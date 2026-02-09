import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Message } from "@/app/types";
import { parseMessage } from "@/lib/ai/messageParser";
import Link from "next/link";

interface TaxEstimatorMessagesProps {
  messages: Message[];
  isLoading: boolean;
  onOptionClick?: (value: any) => void;
  isComplete?: boolean;
  onNewSession?: () => void;
}

export function TaxEstimatorMessages({
  messages,
  isLoading,
  onOptionClick,
  isComplete,
  onNewSession,
}: TaxEstimatorMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, isLoading]);

  const handleDownload = async (message: Message) => {
    try {
      const { generateChatResponsePDF, downloadPDF } =
        await import("@/lib/pdf/templates/chatResponse");
      // Use pdfContent if available (markdown for PDF), otherwise fallback to content
      const pdfContent = message.pdfContent || message.content;
      const pdfBlob = generateChatResponsePDF(pdfContent, message.timestamp);
      const filename = `tax-estimate-${
        message.timestamp.toISOString().split("T")[0]
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
              className={`flex gap-2.5 scroll-mt-32 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "max-w-[85%] md:max-w-[70%] bg-emerald-600 text-white"
                    : "w-full md:max-w-[93%] lg:max-w-[83%] xl:max-w-[70%] bg-white dark:bg-zinc-900 border border-[#f5f5f5] dark:border-zinc-900 text-zinc-800 dark:text-zinc-200"
                }`}
              >
                {message.role === "user" ? (
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {(() => {
                      const { body, citations, disclaimer, noInfoFound } =
                        parseMessage(message.content);
                      return (
                        <>
                          <div className="max-w-none">
                            {body.includes('<div class="tax-summary">') ? (
                              <div
                                className="tax-summary-content"
                                dangerouslySetInnerHTML={{
                                  __html: body.replace(
                                    /\*\*(.*?)\*\*/g,
                                    "<strong>$1</strong>",
                                  ),
                                }}
                              />
                            ) : (
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
                            )}
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
                            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/50">
                              <div className="text-xs text-zinc-500 dark:text-zinc-500 italic leading-snug">
                                <ReactMarkdown
                                  components={{
                                    p: ({ children }) => (
                                      <p className="mb-0">{children}</p>
                                    ),
                                    strong: ({ children }) => (
                                      <strong className="font-bold text-zinc-600 dark:text-zinc-400">
                                        {children}
                                      </strong>
                                    ),
                                  }}
                                >
                                  {disclaimer}
                                </ReactMarkdown>
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}

                    {message.options && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {message.options.map((option, idx) => (
                          <button
                            key={idx}
                            onClick={() => onOptionClick?.(option.value)}
                            disabled={isComplete}
                            className={`px-4 py-2 text-sm rounded-full border transition-all font-medium cursor-pointer ${
                              isComplete
                                ? "border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
                                : "border-zinc-200 dark:border-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-500 text-emerald-700 dark:text-emerald-400"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between mt-1.5 px-0.5">
                  <p className="text-xs opacity-50">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>

                  {message.role === "assistant" && message.pdfContent && (
                    <div className="flex items-center gap-1.5">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleDownload(message)}
                            className="p-2.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all cursor-pointer"
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
                          <p>Download Estimate</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 w-fit">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce-extra [animation-delay:-0.3s]" />
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce-extra [animation-delay:-0.15s]" />
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce-extra" />
              </div>
            </div>
          )}

          {isComplete && (
            <div className="flex flex-wrap text-xs gap-3.5 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <button
                onClick={onNewSession}
                className="flex items-center gap-2 px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-semibold transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
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
                >
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
                New Session
              </button>
              <Link
                href="/tools/ai-chat"
                className="flex items-center gap-2 px-4.5 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 text-zinc-700 dark:text-zinc-300 rounded-full font-semibold transition-all cursor-pointer"
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
                  className="text-emerald-500"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Try AI Chat
              </Link>
            </div>
          )}
          <div ref={scrollRef} className="h-32" />
        </div>
      </div>
    </div>
  );
}
