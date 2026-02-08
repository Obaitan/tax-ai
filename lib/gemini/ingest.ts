import fs from "fs";
import path from "path";
import { genAI } from "./client";
import { Readable } from "stream";
import { finished } from "stream/promises";

/**
 * Ingests a file from a URL into the Gemini File Search store.
 * 1. Downloads the file to a temp location using streams.
 * 2. Uploads the file to Gemini File API.
 * 3. Imports the file into the Managed RAG File Search Store.
 */
export async function ingestFileFromUrl({
  url,
  displayName,
  storeId,
}: {
  url: string;
  displayName: string;
  storeId: string;
}) {
  const tempDir = path.join(process.cwd(), "tmp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const fileName = path.basename(new URL(url).pathname);
  const localPath = path.join(tempDir, fileName);

  try {
    const response = await fetch(url);
    if (!response.ok || !response.body) {
      throw new Error(`Failed to download ${url}: ${response.statusText}`);
    }

    const fileStream = fs.createWriteStream(localPath);
    await finished(Readable.fromWeb(response.body as any).pipe(fileStream));

    const uploadResponse = await genAI.files.upload({
      file: localPath,
      config: {
        mimeType: "application/pdf",
        displayName: displayName,
      },
    });

    if (!uploadResponse.name)
      throw new Error("Upload failed: No file name returned");

    const importOperation = await genAI.fileSearchStores.importFile({
      fileSearchStoreName: storeId,
      fileName: uploadResponse.name,
    });

    return importOperation;
  } catch (error) {
    console.error(`Ingestion failed for ${displayName}:`, error);
    throw error;
  } finally {
    if (fs.existsSync(localPath)) {
      try {
        fs.unlinkSync(localPath);
      } catch (err) {
        console.warn(`Could not delete temp file ${localPath}:`, err);
      }
    }
  }
}

/**
 * Ingests a local file into the Gemini File Search store.
 * 1. Uploads the file to Gemini File API.
 * 2. Imports the file into the Managed RAG File Search Store.
 * 3. Optionally deletes the local file after successful ingestion.
 */
export async function ingestLocalFile({
  filePath,
  displayName,
  storeId,
  deleteAfterUpload = false,
}: {
  filePath: string;
  displayName: string;
  storeId: string;
  deleteAfterUpload?: boolean;
}) {
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  // Validate file extension
  if (!filePath.toLowerCase().endsWith(".pdf")) {
    throw new Error(`Only PDF files are supported. File: ${filePath}`);
  }

  // Check file size (Gemini has limits)
  const stats = fs.statSync(filePath);
  const maxSizeBytes = 100 * 1024 * 1024; // 100MB limit
  if (stats.size > maxSizeBytes) {
    throw new Error(
      `File too large (${(stats.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed: ${maxSizeBytes / (1024 * 1024)}MB. File: ${filePath}`,
    );
  }

  let uploadResponse;
  let importOperation;

  try {
    // Upload with retry logic
    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        uploadResponse = await genAI.files.upload({
          file: filePath,
          config: {
            mimeType: "application/pdf",
            displayName: displayName,
          },
        });
        break; // Success, exit retry loop
      } catch (error) {
        lastError = error as Error;
        console.warn(
          `Upload attempt ${attempt}/${maxRetries} failed for ${displayName}:`,
          (error as Error).message,
        );
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff

          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    if (!uploadResponse) {
      throw new Error(
        `Upload failed after ${maxRetries} attempts: ${(lastError as Error).message}`,
      );
    }

    if (!uploadResponse.name) {
      throw new Error("Upload failed: No file name returned");
    }

    // Import to store with retry logic
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        importOperation = await genAI.fileSearchStores.importFile({
          fileSearchStoreName: storeId,
          fileName: uploadResponse.name,
        });
        break; // Success, exit retry loop
      } catch (error) {
        lastError = error as Error;
        console.warn(
          `Import attempt ${attempt}/${maxRetries} failed for ${displayName}:`,
          (error as Error).message,
        );
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);

          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    if (!importOperation) {
      throw new Error(
        `Import failed after ${maxRetries} attempts: ${(lastError as Error).message}`,
      );
    }

    // Delete the local file if requested
    if (deleteAfterUpload) {
      try {
        fs.unlinkSync(filePath);
      } catch (deleteError) {
        console.warn(
          `Could not delete local file ${filePath}:`,
          (deleteError as Error).message,
        );
      }
    }

    return {
      uploadResponse,
      importOperation,
    };
  } catch (error) {
    console.error(
      `Ingestion failed for ${displayName}:`,
      (error as Error).message,
    );
    throw error;
  }
}

/**
 * Ingests all PDF files from a directory into the Gemini File Search store.
 */
export async function ingestFilesFromDirectory({
  directoryPath,
  storeId,
  deleteAfterUpload = false,
}: {
  directoryPath: string;
  storeId: string;
  deleteAfterUpload?: boolean;
}) {
  try {
    // Check if directory exists
    if (!fs.existsSync(directoryPath)) {
      throw new Error(`Directory not found: ${directoryPath}`);
    }

    // Get all PDF files in the directory
    const files = fs
      .readdirSync(directoryPath)
      .filter((file) => file.toLowerCase().endsWith(".pdf"))
      .map((file) => ({
        fileName: file,
        filePath: path.join(directoryPath, file),
        displayName: path.parse(file).name, // Remove .pdf extension for display name
      }));

    if (files.length === 0) {
      return [];
    }

    const results = [];

    for (const file of files) {
      try {
        const result = await ingestLocalFile({
          filePath: file.filePath,
          displayName: file.displayName,
          storeId,
          deleteAfterUpload,
        });
        results.push({
          fileName: file.fileName,
          success: true,
          result,
        });
      } catch (error) {
        console.error(`Failed to process ${file.fileName}:`, error);
        results.push({
          fileName: file.fileName,
          success: false,
          error: (error as Error).message,
        });
      }
    }

    return results;
  } catch (error) {
    console.error(`Directory ingestion failed:`, error);
    throw error;
  }
}
