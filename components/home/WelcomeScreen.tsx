import Link from "next/link";

export function WelcomeScreen() {
  const tools = [
    {
      title: "Tax Estimator",
      description:
        "Answer a few guided questions to estimate your individual / corporate tax obligations.",
      href: "/tools/tax-estimator",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="16" height="20" x="4" y="2" rx="2" />
          <line x1="8" x2="16" y1="6" y2="6" />
          <line x1="8" x2="16" y1="10" y2="10" />
          <line x1="8" x2="16" y1="14" y2="14" />
          <line x1="8" x2="16" y1="18" y2="18" />
        </svg>
      ),
      color: "blue",
    },
    {
      title: "AI Chat Assistant",
      description:
        "Ask questions about tax laws, exemptions, PAYE, and compliance.",
      href: "/tools/ai-chat",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
        </svg>
      ),
      color: "emerald",
    },
    {
      title: "Bank Statement Analyser",
      description:
        "Upload your bank statement and download a report showing only credit transactions.",
      href: "/tools/bank-statement",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
          <path d="M10 9H8" />
          <path d="M16 13H8" />
          <path d="M16 17H8" />
        </svg>
      ),
      color: "purple",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-full max-w-6xl space-y-12">
        <div className="md:text-center space-y-2">
          <h1 className="text-3xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Simplify Your{" "}
            <span className="text-indigo-800 dark:text-indigo-400">Taxes</span>
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto text-lg">
            Estimate individual and corporate taxes in{" "}
            <span className="text-indigo-800 dark:text-indigo-400 font-semibold">Nigeria</span>, get
            AI guidance based on the new tax act, and analyse bank statements
            for inflowss — all in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 xl:px-4">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="flex flex-col p-4 md:px-6 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md hover:border-indigo-800 dark:hover:border-indigo-400 transition-all group"
            >
              <div
                className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 transition-colors shadow-sm
                ${
                  tool.color === "blue"
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    : ""
                }
                ${
                  tool.color === "emerald"
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : ""
                }
                ${
                  tool.color === "purple"
                    ? "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                    : ""
                }
                group-hover:scale-110 transition-transform duration-300
              `}
              >
                {tool.icon}
              </div>

              <h3 className="text-[17px] font-semibold text-zinc-900 dark:text-zinc-100 mb-1 group-hover:text-indigo-900 dark:group-hover:text-indigo-400 transition-colors">
                {tool.title}
              </h3>
              <p className="text-[13px] text-zinc-700 dark:text-zinc-300">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
