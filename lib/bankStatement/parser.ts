import { BankStatementData } from '@/app/types';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { genAI, GEMINI_PARSER_MODEL } from '@/lib/gemini/client';
import pdf from 'pdf-parse';

// pdf-parse is used for reliable page counting and metadata extraction

/**
 * Parses a PDF bank statement file
 * @param file - PDF file to parse
 * @param onProgress - Optional callback for progress updates
 * @returns Parsed bank statement data
 */
export async function parseBankStatementPDF(
  file: File,
  onProgress?: (current: number, total: number) => void,
): Promise<BankStatementData> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  const buffer = Buffer.from(uint8Array);

  // Initialize data structure
  const data: BankStatementData = {
    accountName: '',
    accountNumber: '',
    bankName: '',
    startDate: '',
    endDate: '',
    transactions: [],
    totalCredits: 0,
  };

  // 1. Get accurate page count using pdf-parse
  let numPages = 1;
  try {
    const pdfData = await pdf(buffer);
    numPages = pdfData.numpages || 1;
  } catch (pdfError) {
    // Fallback: Look for the root /Pages object count
    const countRegex = /\/Type\s*\/Pages\b[\s\S]*?\/Count\s+(\d+)/g;
    let countEstimate = 0;
    let matches;
    const binContent = buffer.toString('binary');
    while ((matches = countRegex.exec(binContent)) !== null) {
      const c = parseInt(matches[1], 10);
      if (!isNaN(c)) countEstimate = c;
    }
    const pageMatches = binContent.match(/\/Type\s*\/Page\b/g);
    const regexCount = pageMatches ? pageMatches.length : 1;
    numPages = countEstimate > 0 ? countEstimate : regexCount;
  }

  if (numPages === 0) numPages = 1;

  // Use Gemini AI with native PDF support for superior accuracy and reliability.
  // We process the document in chunks to handle large files and prevent truncation.
  let tempPath = '';
  let uploadedFile: any = null;

  try {
    // 1. Save buffer to temporary file for upload
    tempPath = path.join(os.tmpdir(), `statement-${Date.now()}.pdf`);
    await fs.promises.writeFile(tempPath, buffer);

    // 2. Upload to Gemini File API
    if (!genAI.files || !genAI.files.upload) {
      console.error('Gemini SDK error: genAI.files.upload is not available');
      throw new Error('AI File service mismatch');
    }

    uploadedFile = await genAI.files.upload({
      file: tempPath,
      config: {
        mimeType: 'application/pdf',
        displayName: file.name,
      },
    });

    // 3. Define the extraction task with System Instruction for maximum accuracy
    const SYSTEM_INSTRUCTION = `
    You are an expert financial data analyst specializing in Nigerian bank statements.
    Extract EVERY single CREDIT (inflow/deposit) transaction from the provided pages.
    
    CRITICAL RULES:
    1. DOCUMENT VERIFICATION: First, determine if this document is actually a bank statement. If it is NOT a bank statement, return ONLY: {"isNotBankStatement": true}.
    2. CREDIT IDENTIFICATION: Extract only transactions where money ENTERS the account (Inflow).
       - Look for columns like "Credit", "Money In", "Inflow", "CR", "Lodgments", "Deposit".
       - Discard any row that has a numerical value in the "Debit", "Withdrawal", "Outflow", or "Money Out" column.
    3. EXPLICIT DEBIT EXCLUSION: Nigerian bank charges are DEBITS. You MUST DISCARD rows matching these narrations unless they are explicitly marked as "REVERSAL":
       - VAT, SMS ALERT, TRANSFER FEE, MAINT FEE, CARD MAINT, ETM FEE, COMMISSION, STAMP DUTY, WHT, FGN STAMP DUTY, CBN ELECTRONICLEVY, ELECTRONICLEVY, NIP-FEE, NIP FEE.
    4. BALANCE VERIFICATION: If a "Balance" column exists, a transaction is a credit ONLY if the ending balance is GREATER than the previous row's balance (within the context of these pages).
    5. NO SUMMARIES: Ignore "Total Credits", "Balance Brought Forward", "Total Outflow", "B/F", "C/F", etc.
    6. HEADERS: Note that column headers might only be present on the first page. Apply the same column structure to all subsequent pages.
    7. DATA QUALITY: Capture the full description/narration. Format dates as DD/MM/YYYY. Use numbers for amounts and balance (remove currency symbols and commas).
    8. OUTPUT FORMAT: Return valid JSON with the following structure:
       {
         "isNotBankStatement": false,
         "accountName": "...", "accountNumber": "...", "bankName": "...",
         "transactions": [
           { "date": "DD/MM/YYYY", "description": "...", "amount": 1000.50, "balance": 5000.00 }
         ]
       }
    `;

    const processChunk = async (
      start: number,
      end: number,
      isFirst: boolean,
    ) => {
      const prompt = `
      Pages to process: ${start} to ${end}.
      Extract all credit transactions from these pages.
      ${
        isFirst
          ? 'Also extract: accountName, accountNumber, and bankName from the header.'
          : 'Focus only on transactions. Use empty strings for accountName, accountNumber, and bankName.'
      }
      Return ONLY valid JSON in the specified format.
      `;

      const result = await genAI.models.generateContent({
        model: GEMINI_PARSER_MODEL,
        config: {
          temperature: 0.1,
          responseMimeType: 'application/json',
          systemInstruction: SYSTEM_INSTRUCTION,
          httpOptions: { timeout: 180_000 }, // 3 min per chunk (PDF extraction can be slow; 504 = backend deadline)
        },
        contents: [
          {
            role: 'user',
            parts: [
              {
                fileData: {
                  fileUri:
                    uploadedFile.file?.uri ||
                    uploadedFile.uri ||
                    (uploadedFile as any).fileUri,
                  mimeType: 'application/pdf',
                },
              },
              { text: prompt },
            ],
          },
        ],
      });

      if (!result) throw new Error('No response from AI service');

      let textResponse = '';
      try {
        const anyResult = result as any;
        textResponse =
          typeof anyResult.text === 'function'
            ? anyResult.text()
            : anyResult.text || '';
      } catch (e) {
        const anyResult = result as any;
        textResponse =
          anyResult.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }

      try {
        return JSON.parse(textResponse.trim());
      } catch (e) {
        // Robust fallback for JSON extraction
        const match = textResponse.match(/\{[\s\S]*\}/);
        if (match) return JSON.parse(match[0]);
        throw new Error('Invalid JSON response from AI');
      }
    };

    // 4. Optimized Multi-page Processing
    // High chunk size (2) for maximum extraction accuracy
    const CHUNK_SIZE = 2;
    const CONCURRENCY_LIMIT = 2;
    const chunkConfigs: { start: number; end: number; index: number }[] = [];

    for (let i = 1, idx = 0; i <= numPages; i += CHUNK_SIZE, idx++) {
      chunkConfigs.push({
        start: i,
        end: Math.min(i + CHUNK_SIZE - 1, numPages),
        index: idx,
      });
    }

    const results: any[] = new Array(chunkConfigs.length);
    let completedPages = 0;

    const processQueue = async () => {
      while (chunkConfigs.length > 0) {
        const config = chunkConfigs.shift();
        if (!config) break;

        let retries = 0;
        const MAX_RETRIES = 3;
        while (retries <= MAX_RETRIES) {
          try {
            if (onProgress) onProgress(completedPages + 1, numPages);

            const res = await processChunk(
              config.start,
              config.end,
              config.start === 1,
            );
            results[config.index] = res;

            completedPages += config.end - config.start + 1;
            if (onProgress)
              onProgress(Math.min(completedPages, numPages), numPages);
            break;
          } catch (error: any) {
            const msg = (error?.message ?? String(error)).toLowerCase();
            const status = (error as any)?.status ?? (error as any)?.code;
            const isRetryable =
              msg.includes('503') ||
              msg.includes('429') ||
              msg.includes('504') ||
              msg.includes('deadline') ||
              msg.includes('json') ||
              msg.includes('fetch failed') ||
              msg.includes('sending request') ||
              msg.includes('econnreset') ||
              msg.includes('etimedout') ||
              msg.includes('network') ||
              status === 504 ||
              (error?.name === 'TypeError' && msg.includes('fetch'));
            if (isRetryable && retries < MAX_RETRIES) {
              retries++;
              const backoff = retries * 4000;
              console.warn(
                `Retry ${retries}/${MAX_RETRIES} for pages ${config.start}-${config.end} after ${backoff}ms`,
              );
              await new Promise((r) => setTimeout(r, backoff));
            } else {
              throw error;
            }
          }
        }
      }
    };

    await Promise.all(
      Array.from({
        length: Math.min(
          CONCURRENCY_LIMIT,
          chunkConfigs.length + CONCURRENCY_LIMIT,
        ),
      }).map(() => processQueue()),
    );

    // 5. Aggregate results
    let isNotBankStatement = false;
    results.forEach((res) => {
      if (!res) return;
      if (res.isNotBankStatement) isNotBankStatement = true;

      if (
        res.accountName &&
        res.accountName !== '...' &&
        (!data.accountName || data.accountName === 'N/A')
      )
        data.accountName = res.accountName;
      if (
        res.accountNumber &&
        res.accountNumber !== '...' &&
        (!data.accountNumber || data.accountNumber === 'N/A')
      )
        data.accountNumber = res.accountNumber;
      if (
        res.bankName &&
        res.bankName !== '...' &&
        (!data.bankName || data.bankName === 'N/A')
      )
        data.bankName = res.bankName;

      if (Array.isArray(res.transactions)) {
        const normalized = res.transactions
          .filter((t: any) => t.date && t.amount)
          .map((t: any) => ({
            date: String(t.date).trim(),
            description: String(t.description || '')
              .replace(/\s+/g, ' ')
              .trim(),
            amount:
              typeof t.amount === 'number'
                ? t.amount
                : parseFloat(String(t.amount).replace(/[^0-9.]/g, '')),
            balance:
              typeof t.balance === 'number'
                ? t.balance
                : parseFloat(String(t.balance).replace(/[^0-9.]/g, '')),
            type: 'credit' as const,
          }));
        data.transactions.push(...normalized);
      }
    });

    if (isNotBankStatement) {
      throw new Error(
        'The document you uploaded does not appear to be a valid bank statement.',
      );
    }

    // Deduplicate
    const seen = new Set();
    data.transactions = data.transactions.filter((t) => {
      const key = `${t.date}-${t.description}-${t.amount}-${t.balance}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  } catch (error: any) {
    console.error('Gemini Multi-Page Extraction Error:', error);
    const msg = error.message || '';

    // 1. Handle specific known errors with user-friendly messages
    if (msg.includes('429') || msg.toLowerCase().includes('rate limit')) {
      throw new Error(
        'The AI service is currently reaching its limit. Please wait about 30 seconds and try again.',
      );
    }

    if (msg.includes('503') || msg.toLowerCase().includes('overloaded')) {
      throw new Error(
        'The AI service is currently busy processing many requests. Please try again in about 10 seconds.',
      );
    }

    if (msg.includes('504') || msg.includes('deadline') || msg.includes('DEADLINE_EXCEEDED')) {
      throw new Error(
        'The request took too long to complete. Please try again or upload a shorter statement.',
      );
    }

    // 2. Pass through our specific "not a bank statement" error
    if (msg.includes('not a bank statement')) {
      throw error;
    }

    // 3. Fallback to a cleaner error message for unexpected failures (leaked technical errors)
    throw new Error(
      'Something went wrong while processing your document. Please try again.',
    );
  } finally {
    // Clean up temporary file
    if (tempPath && fs.existsSync(tempPath)) {
      try {
        fs.unlinkSync(tempPath);
      } catch (e) {}
    }
    // Note: We don't delete from Gemini here as there isn't a simple delete method in this SDK version,
    // and files expire automatically after 48 hours.
  }

  // Calculate date range and total
  if (data.transactions.length > 0) {
    const parseDate = (d: string): Date => {
      if (!d) return new Date(0);
      const s = d.trim();

      // Try DD/MM/YYYY or MM/DD/YYYY
      const m1 = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
      if (m1) {
        let [_, p1, p2, p3] = m1;
        const year =
          p3.length === 2 ? parseInt(`20${p3}`, 10) : parseInt(p3, 10);
        const v1 = parseInt(p1, 10);
        const v2 = parseInt(p2, 10);

        // Robust logic:
        // If one is > 12, it must be the day.
        // If p1 > 12, it's DD/MM/YYYY
        if (v1 > 12) {
          return new Date(year, v2 - 1, v1);
        }
        // If p2 > 12, it's MM/DD/YYYY
        if (v2 > 12) {
          return new Date(year, v1 - 1, v2);
        }
        // Ambiguous: Assume DD/MM/YYYY as it's standard in Nigeria
        return new Date(year, v2 - 1, v1);
      }

      // Try YYYY-MM-DD
      const m2 = s.match(/^(\d{4})[\-](\d{1,2})[\-](\d{1,2})$/);
      if (m2) {
        let [_, yyyy, mm, dd] = m2;
        return new Date(
          parseInt(yyyy, 10),
          parseInt(mm, 10) - 1,
          parseInt(dd, 10),
        );
      }

      const dt = new Date(s);
      return isNaN(dt.getTime()) ? new Date(0) : dt;
    };

    // Sort transactions by parsed date ascending for the data object
    data.transactions.sort(
      (a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime(),
    );

    data.startDate = data.transactions[0].date;
    data.endDate = data.transactions[data.transactions.length - 1].date;
    data.totalCredits = data.transactions.reduce(
      (sum, txn) => sum + txn.amount,
      0,
    );
  }

  return data;
}
