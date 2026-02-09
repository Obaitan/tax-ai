/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BankAnalyserMessages } from "@/components/bank-statement-analyser/BankAnalyserMessages";
import { BankAnalyserInput } from "@/components/bank-statement-analyser/BankAnalyserInput";
import { Message } from "@/app/types";
import { upload } from "@vercel/blob/client";

export default function BankStatementPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (type: "bank") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Enforce file size limit (10MB)
      const MAX_FILE_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        const sizeError: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `File is too large (${(file.size / 1024 / 1024).toFixed(
            2,
          )} MB). Please upload a bank statement smaller than 10MB.`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, sizeError]);
        return;
      }

      setIsLoading(true);

      const userFileMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: file.name,
        timestamp: new Date(),
        fileName: file.name,
        fileType: "pdf",
        fileSize: file.size,
      };
      setMessages((prev) => [...prev, userFileMessage]);

      const processingMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Uploading and processing your bank statement. Please wait...",
        timestamp: new Date(),
        isProcessing: true,
      };
      setMessages((prev) => [...prev, processingMessage]);

      try {
        // 1. Upload to Vercel Blob (Client-side)
        // This avoids Vercel's 4.5MB request body limit
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/uploads",
        });

        // 2. Call analysis API with the blob URL
        const response = await fetch("/api/statement-analyser", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ blobUrl: blob.url }),
        });

        if (!response.ok) {
          throw new Error("Failed to connect to the analysis service.");
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("Could not read response stream.");

        const decoder = new TextDecoder();
        let data = null;
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const json = JSON.parse(line);

              if (json.type === "progress") {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === processingMessage.id
                      ? {
                          ...msg,
                          processingProgress: `Processing Page ${json.current} of ${json.total}`,
                          progressCurrent: json.current,
                          progressTotal: json.total,
                        }
                      : msg,
                  ),
                );
              } else if (json.type === "result") {
                data = json.data;
              } else if (json.type === "error") {
                // Store the server-provided error to use it in the catch block if needed
                throw new Error(json.error);
              }
            } catch (innerError) {
              // If it's an Error object we just threw (e.g. from json.type === "error"), re-throw it to the outer catch
              if (
                innerError instanceof Error &&
                line.includes('"type":"error"')
              ) {
                throw innerError;
              }
              console.error("Error parsing stream line:", innerError, line);
            }
          }
        }

        if (!data)
          throw new Error(
            "No analysis data was returned. Please try again with a clear bank statement.",
          );

        const { generateBankStatementPDF } =
          await import("@/lib/pdf/templates/bankStatement");
        const pdfBlob = generateBankStatementPDF(data);
        const filename = `bank-statement-analysis-${
          new Date().toISOString().split("T")[0]
        }.pdf`;

        setMessages((prev) =>
          prev.filter((msg) => msg.id !== processingMessage.id),
        );

        const successMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Successfully analyzed your bank statement.

**Number of credit transactions:** ${data.transactions.length}
**Total Credit:** ₦${data.totalCredits.toLocaleString("en-NG", {
            minimumFractionDigits: 2,
          })}
**Date Range:** ${data.startDate} - ${data.endDate}

---DISCLAIMER---
Note: Credit information extraction from bank statements may not be 100% accurate.`,
          timestamp: new Date(),
          pdfBlob,
          pdfFilename: filename,
        };
        setMessages((prev) => [...prev, successMessage]);
      } catch (error) {
        console.error("Bank statement upload error:", error);
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== processingMessage.id),
        );

        const errorMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Something went wrong while processing your document. Please try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    };

    input.click();
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-[calc(100dvh-64px)] bg-zinc-50 dark:bg-zinc-950">
        <main className="grow flex flex-col">
          <div className="w-full max-w-6xl mx-auto px-6 md:px-12 xl:px-0 pt-10">
            <div className="space-y-4 max-w-2xl">
              <p className="text-lg md:text-[22px] text-zinc-800 dark:text-zinc-400 max-w-3xl leading-relaxed font-medium">
                Our{" "}
                <span className="text-indigo-800 dark:text-indigo-400 font-bold">
                  Bank Statement Analyser
                </span>{" "}
                will help you extract credit/inflow data from your bank
                stattement.{" "}
                <span className="font-bold underline decoration-indigo-500 underline-offset-4">
                  Upload a bank statement
                </span>
                .
              </p>
            </div>
          </div>
          <BankAnalyserMessages messages={messages} isLoading={isLoading} />
        </main>

        <div className="sticky bottom-0 z-40 bg-zinc-50/60 dark:bg-zinc-950/80 backdrop-blur-md border-t border-zinc-200/50 dark:border-zinc-800/50">
          <BankAnalyserInput
            isLoading={isLoading}
            onFileUpload={handleFileUpload}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
