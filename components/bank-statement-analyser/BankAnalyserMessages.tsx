/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Message } from "@/app/types";
import { parseMessage } from "@/lib/ai/messageParser";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import Link from "next/link";

interface BankAnalyserMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export function BankAnalyserMessages({
  messages,
  isLoading,
}: BankAnalyserMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, isLoading]);

  return (
    <div className="w-full max-w-6xl mx-auto grow flex flex-col">
      <div className="flex-1 px-6 md:px-12 xl:px-0">
        <div className="max-w-6xl mx-auto space-y-10 pt-10 pb-12 relative">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex gap-2.5 scroll-mt-48 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "max-w-[85%] md:max-w-[70%] bg-[#f4f4f4] dark:bg-zinc-800 dark:text-zinc-100 text-zinc-800"
                    : "w-full md:max-w-[93%] lg:max-w-[83%] xl:max-w-[70%] bg-white dark:bg-zinc-900 border border-[#f5f5f5] dark:border-zinc-900 text-zinc-800 dark:text-zinc-200"
                }`}
              >
                {message.role === "user" ? (
                  message.fileName && (
                    <div className="flex flex-col items-center gap-2 max-w-55">
                      <div className="w-full rounded-md py-3 px-3 flex flex-col items-center">
                        <div className="flex items-center justify-center mb-1.5">
                          <Image
                            src="/icons/pdf.svg"
                            alt="PDF document"
                            width={474}
                            height={615}
                            className="w-20"
                          />
                        </div>
                        <div className="w-full text-center">
                          <p className="text-sm font-medium text-zinc-600 truncate">
                            {message.fileName}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                ) : message.isProcessing ? (
                  <div className="py-3 px-2 space-y-0.5">
                    <div className="space-y-3 min-w-[240px]">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-[15px] text-zinc-900 dark:text-zinc-100">
                          Analyzing Statement...
                        </p>
                      </div>
                      <Progress
                        value={
                          typeof message.progressCurrent === "number" &&
                          typeof message.progressTotal === "number"
                            ? Math.max(
                                5,
                                (message.progressCurrent /
                                  message.progressTotal) *
                                  100,
                              )
                            : 5
                        }
                        className="h-2 bg-zinc-100 dark:bg-zinc-800 border-none *:bg-indigo-700"
                      />
                      <p className="text-xs text-zinc-500 italic">
                        Extracting credit data. This might take several
                        minutes...
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(() => {
                      const { body, disclaimer } = parseMessage(
                        message.content,
                      );
                      return (
                        <>
                          <div className="max-w-none">
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => (
                                  <p className="text-sm leading-relaxed mb-2 last:mb-0 whitespace-pre-wrap">
                                    {children}
                                  </p>
                                ),
                                strong: ({ children }) => (
                                  <strong className="font-bold text-zinc-900 dark:text-zinc-100">
                                    {children}
                                  </strong>
                                ),
                              }}
                            >
                              {body}
                            </ReactMarkdown>
                          </div>

                          {disclaimer && (
                            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/50">
                              <p className="text-xs text-zinc-500 dark:text-zinc-500 italic leading-snug">
                                {disclaimer}
                              </p>
                            </div>
                          )}

                          {message.pdfBlob && message.pdfFilename && (
                            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/50 flex flex-wrap items-end gap-4 justify-between animate-in fade-in slide-in-from-bottom-4 duration-700">
                              <button
                                onClick={() => {
                                  const url = URL.createObjectURL(
                                    message.pdfBlob!,
                                  );
                                  const link = document.createElement("a");
                                  link.href = url;
                                  link.download = message.pdfFilename!;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                  URL.revokeObjectURL(url);
                                }}
                                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-800 hover:bg-indigo-800 dark:bg-indigo-400 dark:hover:bg-indigo-400 text-white rounded-lg transition-colors text-sm font-medium cursor-pointer"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                  <polyline points="7 10 12 15 17 10" />
                                  <line x1="12" x2="12" y1="15" y2="3" />
                                </svg>
                                Download Document
                              </button>
                              <Link
                                href="/tools/ai-chat"
                                className="flex items-center gap-2 px-4.5 py-2.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-800 text-zinc-700 dark:text-zinc-300 rounded-full font-semibold transition-all cursor-pointer"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-indigo-800 dark:text-indigo-400"
                                >
                                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                                Ask AI Chat Something
                              </Link>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
                <div className="flex items-center justify-between mt-1.5 px-0.5">
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          <div ref={scrollRef} className="h-32" />
        </div>
      </div>
    </div>
  );
}
