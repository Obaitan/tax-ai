import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AIAssistantInputProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  onNewSession: () => void;
  onSubmit: (e?: React.FormEvent) => void;
  editingMessageId?: string | null;
  onCancelEdit?: () => void;
}

export function AIAssistantInput({
  input,
  setInput,
  isLoading,
  onNewSession,
  onSubmit,
  editingMessageId,
  onCancelEdit,
}: AIAssistantInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="py-4 md:py-6">
      <form
        onSubmit={onSubmit}
        className="max-w-4xl mx-auto px-4 md:px-12 lg:px-0"
      >
        {editingMessageId && (
          <div className="mb-3">
            <div className="flex items-center justify-between bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-2 border border-yellow-100 dark:border-yellow-900">
              <div className="text-xs text-yellow-800 dark:text-yellow-300">
                Editing message — your change will be resent to the AI assistant
              </div>
              <button
                onClick={onCancelEdit}
                className="text-xs text-yellow-700 dark:text-yellow-200 underline"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Desktop Layout */}
        <div className="hidden md:flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onNewSession}
                className="bg-zinc-100 dark:bg-zinc-900 rounded-full dark:hover:bg-zinc-800 transition-colors flex items-center justify-center text-xs font-semibold text-indigo-900 dark:text-indigo-400 cursor-pointer w-10 h-10 shrink-0 border border-[#f3f3f3] dark:border-zinc-800"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-5"
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
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" align="center">
              <p>New Session</p>
            </TooltipContent>
          </Tooltip>

          <div className="relative flex-1 flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-full border border-[#f3f3f3] dark:border-zinc-900 px-3 py-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about Nigerian tax laws, calculate your PAYE, or learn about tax exemptions..."
              className="flex-1 min-h-9 max-h-35 bg-transparent! dark:bg-transparent! border-none outline-none p-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none shadow-none"
              rows={1}
            />

            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="shrink-0 h-8 w-8 rounded-full bg-indigo-900 hover:bg-indigo-900 disabled:bg-zinc-300 dark:disabled:bg-zinc-600 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4 text-white dark:text-white"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-900 p-3">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about Nigerian tax laws..."
              className="min-h-11 max-h-35 w-full bg-transparent! dark:bg-transparent! border-none shadow-none outline-none resize-none text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0 pt-1 px-2"
              rows={1}
            />

            <div className="flex items-center justify-between mt-1 pt-1 border-t border-zinc-200/50 dark:border-zinc-800/50">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={onNewSession}
                    className="flex items-center justify-center text-xs font-semibold text-zinc-500 dark:text-zinc-400 cursor-pointer p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="size-4 mr-1.5"
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
                </TooltipTrigger>
                <TooltipContent side="top" align="start">
                  <p>Start a new session</p>
                </TooltipContent>
              </Tooltip>

              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="shrink-0 h-8 w-8 rounded-full bg-indigo-900 hover:bg-indigo-900 disabled:bg-zinc-300 dark:disabled:bg-zinc-600 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-4 text-white dark:text-zinc-900"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
