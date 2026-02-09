import { Button } from "@/components/ui/button";

interface BankAnalyserInputProps {
  isLoading: boolean;
  onFileUpload: (type: "bank") => void;
}

export function BankAnalyserInput({
  isLoading,
  onFileUpload,
}: BankAnalyserInputProps) {
  const handleBankStatementUpload = () => {
    onFileUpload("bank");
  };

  return (
    <div className="py-4 md:py-6">
      <div className="max-w-4xl mx-auto px-4 md:px-12 lg:px-0">
        {/* Desktop Layout */}
        <div className="hidden md:block">
          <div
            className="relative flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-full border border-[#f3f3f3] dark:border-zinc-900 px-3 py-2 cursor-pointer"
            onClick={handleBankStatementUpload}
          >
            <div className="flex-1 flex items-center gap-2.5 text-sm text-zinc-500 dark:text-zinc-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-zinc-500 dark:text-zinc-400"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              Click to upload a PDF bank statement (Max. file size: 10MB)
            </div>

            <Button
              disabled={isLoading}
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

        {/* Mobile Layout */}
        <div className="md:hidden">
          <div
            className="bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-900 p-4 cursor-pointer"
            onClick={handleBankStatementUpload}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
                Upload bank statement (Max. 10MB)
              </div>

              <Button
                disabled={isLoading}
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
      </div>
    </div>
  );
}
