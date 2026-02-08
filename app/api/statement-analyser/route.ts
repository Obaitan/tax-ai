import { NextRequest, NextResponse } from "next/server";
import { parseBankStatementPDF } from "@/lib/bankStatement/parser";
import { del } from "@vercel/blob";

const blobToken = () => process.env.STATEMENT_READ_WRITE_TOKEN;

export const maxDuration = 300; // Increase timeout to 5 minutes to handle large multi-page documents
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let blobUrl: string | null = null;
  try {
    const body = await request.json();
    blobUrl = body.blobUrl;

    if (!blobUrl) {
      return NextResponse.json(
        { error: "No file URL provided" },
        { status: 400 },
      );
    }

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      console.error("Missing GOOGLE_GEMINI_API_KEY environment variable");
      // Clean up blob even if config is missing
      await del(blobUrl, { token: blobToken() });
      return NextResponse.json(
        { error: "Server configuration error: Gemini API key is missing." },
        { status: 500 },
      );
    }

    // Fetch the file from Vercel Blob
    const fileResponse = await fetch(blobUrl);
    if (!fileResponse.ok) {
      await del(blobUrl, { token: blobToken() });
      throw new Error("Failed to fetch the uploaded file for analysis.");
    }

    const blob = await fileResponse.blob();
    const fileName = blobUrl.split("/").pop() || "statement.pdf";
    const file = new File([blob], fileName, { type: "application/pdf" });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Send an immediate progress message to establish the connection and prevent timeouts
        controller.enqueue(
          encoder.encode(
            JSON.stringify({ type: "progress", current: 0, total: 100 }) + "\n",
          ),
        );

        try {
          const data = await parseBankStatementPDF(file, (current, total) => {
            controller.enqueue(
              encoder.encode(
                JSON.stringify({ type: "progress", current, total }) + "\n",
              ),
            );
          });

          if (!data || data.transactions.length === 0) {
            controller.enqueue(
              encoder.encode(
                JSON.stringify({
                  type: "error",
                  error:
                    "I couldn't find any credit transactions in the document provided. Please confirm that it is a bank statement and try again.",
                }) + "\n",
              ),
            );
          } else {
            controller.enqueue(
              encoder.encode(JSON.stringify({ type: "result", data }) + "\n"),
            );
          }
        } catch (error: any) {
          console.error("Statement analysis stream error:", error);
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: "error",
                error:
                  error.message ||
                  "An unexpected error occurred during analysis",
              }) + "\n",
            ),
          );
        } finally {
          // ALWAYS delete the blob after processing (success or failure)
          if (blobUrl) {
            try {
              await del(blobUrl, { token: blobToken() });
            } catch (delError) {
              console.error("Failed to delete blob:", delError);
            }
          }
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (error) {
    console.error("Bank statement analysis error:", error);
    // Attempt cleanup if we have the URL
    if (blobUrl) {
      try {
        await del(blobUrl, { token: blobToken() });
      } catch (e) {}
    }
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to analyze bank statement",
      },
      { status: 500 },
    );
  }
}
