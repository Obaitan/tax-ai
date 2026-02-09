/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Message } from "@/app/types";
import { parseMessage } from "@/lib/ai/messageParser";
import { Pen } from "lucide-react";

interface AIAssistantMessagesProps {
  messages: Message[];
  isLoading: boolean;
  onEditMessage?: (id: string) => void;
}

export function AIAssistantMessages({
  messages,
  isLoading,
  onEditMessage,
}: AIAssistantMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, isLoading]);

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleDownload = async (content: string, timestamp: Date) => {
    try {
      const { generateChatResponsePDF, downloadPDF } =
        await import("@/lib/pdf/templates/chatResponse");
      const pdfBlob = generateChatResponsePDF(content, timestamp);
      const filename = `tax-response-${
        timestamp.toISOString().split("T")[0]
      }.pdf`;
      downloadPDF(pdfBlob, filename);
    } catch (error) {
      console.error("PDF generation error:", error);
    }
  };

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
                {(() => {
                  const isUser = message.role === "user";
                  const { body, citations, disclaimer, noInfoFound } = !isUser
                    ? parseMessage(message.content)
                    : {
                        body: message.content,
                        citations: "",
                        disclaimer: "",
                        noInfoFound: false,
                      };

                  return (
                    <>
                      {isUser ? (
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </p>
                      ) : (
                        <div className="space-y-4">
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
                                ul: ({ children }) => (
                                  <ul className="list-disc pl-5 mb-4 space-y-2">
                                    {children}
                                  </ul>
                                ),
                                li: ({ children }) => (
                                  <li className="text-sm leading-relaxed">
                                    {children}
                                  </li>
                                ),
                                h3: ({ children }) => (
                                  <h3 className="text-base font-semibold mt-3 mb-2">
                                    {children}
                                  </h3>
                                ),
                              }}
                            >
                              {body}
                            </ReactMarkdown>
                          </div>

                          {citations && !noInfoFound && (
                            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/50">
                              <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                                References & Citations:
                              </p>
                              <div className="text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed">
                                <ReactMarkdown
                                  components={{
                                    p: ({ children }) => (
                                      <p className="mb-0">{children}</p>
                                    ),
                                    strong: ({ children }) => (
                                      <strong className="font-bold text-zinc-700 dark:text-zinc-300">
                                        {children}
                                      </strong>
                                    ),
                                  }}
                                >
                                  {citations}
                                </ReactMarkdown>
                              </div>
                            </div>
                          )}

                          {disclaimer && !noInfoFound && (
                            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/50">
                              <p className="text-xs text-zinc-500 dark:text-zinc-500 italic leading-snug">
                                {disclaimer}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-1.5 px-0.5">
                        <div className="flex items-center gap-2">
                          <p
                            className={`text-xs ${
                              message.role === "user"
                                ? "text-zinc-500 dark:text-zinc-400"
                                : "text-zinc-400 dark:text-zinc-500"
                            }`}
                          >
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {message.edited && (
                              <span className="text-[11px] ml-2 opacity-80">
                                {" "}
                                •Edited
                              </span>
                            )}
                          </p>

                          {message.role === "user" && !message.fileName && (
                            <div className="flex items-center gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => handleCopy(message.content)}
                                    className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-200 text-zinc-400 hover:text-indigo-900 dark:hover:text-indigo-400 transition-all cursor-pointer"
                                    aria-label="Copy message"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="14"
                                      height="14"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <rect
                                        width="14"
                                        height="14"
                                        x="8"
                                        y="8"
                                        rx="2"
                                        ry="2"
                                      />
                                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                                    </svg>
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p>Copy prompt</p>
                                </TooltipContent>
                              </Tooltip>

                              {onEditMessage && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={() => onEditMessage(message.id)}
                                      className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-200 text-zinc-400 hover:text-indigo-900 dark:hover:text-indigo-400 transition-all cursor-pointer"
                                      aria-label="Edit message"
                                    >
                                      <Pen className="size-3.5" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    <p>Edit prompt</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          )}
                        </div>

                        {message.role === "assistant" &&
                          !message.isProcessing &&
                          !noInfoFound && (
                            <div className="flex items-center gap-1.5">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => handleCopy(message.content)}
                                    className="p-2.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-indigo-900 dark:hover:text-indigo-400 transition-all cursor-pointer"
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
                                      <rect
                                        width="14"
                                        height="14"
                                        x="8"
                                        y="8"
                                        rx="2"
                                        ry="2"
                                      />
                                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                                    </svg>
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" align="center">
                                  <p>Copy</p>
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() =>
                                      handleDownload(
                                        message.content,
                                        message.timestamp,
                                      )
                                    }
                                    className="p-2.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-indigo-900 dark:hover:text-indigo-400 transition-all cursor-pointer"
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
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" align="center">
                                  <p>Download Response</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          )}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 w-fit">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-indigo-900 dark:bg-indigo-400 animate-bounce-extra [animation-delay:-0.3s]" />
                <div className="h-2 w-2 rounded-full bg-indigo-900 dark:bg-indigo-400 animate-bounce-extra [animation-delay:-0.15s]" />
                <div className="h-2 w-2 rounded-full bg-indigo-900 dark:bg-indigo-400 animate-bounce-extra" />
              </div>
            </div>
          )}
          <div ref={scrollRef} className="h-32" />
        </div>
      </div>
    </div>
  );
}
