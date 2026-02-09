"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ContactLink } from "./ContactLink";
import { resources } from "../../lib/data/resources";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export default function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isMobileResourcesOpen, setIsMobileResourcesOpen] = useState(false);
  const [isMobileToolsOpen, setIsMobileToolsOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  // Toggle dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Close menus when route changes
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsMobileMenuOpen(false);
    setIsResourcesOpen(false);
    setIsToolsOpen(false);
    setIsMobileResourcesOpen(false);
    setIsMobileToolsOpen(false);
  }

  return (
    <TooltipProvider>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 backdrop-blur-sm">
        <div className="flex flex-wrap justify-between items-center md:px-12 2xl:px-0 max-w-7xl mx-auto px-6 py-3">
          <Link href="/" className="flex items-center gap-3">
            <div>
              <p className="text-lg md:text-xl font-bold text-indigo-900 dark:text-indigo-400">
                Tax AI
              </p>
              <p className="hidden md:block text-xs text-zinc-500 dark:text-zinc-500">
                Based on the Nigerian Tax Act 2025
              </p>
              <p className="md:hidden text-xs text-zinc-500 dark:text-zinc-400">
                Nigerian Tax Act 2025
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-9 text-[15px]">
            {/* Tools dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsToolsOpen(true)}
              onMouseLeave={() => setIsToolsOpen(false)}
            >
              <button
                onClick={() => setIsToolsOpen(!isToolsOpen)}
                aria-haspopup="menu"
                aria-expanded={isToolsOpen}
                className={`flex items-center gap-2 transition-colors cursor-pointer ${
                  pathname.startsWith("/tools")
                    ? "text-indigo-900 dark:text-indigo-400 font-semibold"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-indigo-900 dark:hover:text-indigo-400"
                }`}
              >
                Tools
                <svg
                  className={`w-4 h-4 text-zinc-400 transition-transform ${
                    isToolsOpen ? "rotate-180" : ""
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <div
                className={`absolute left-0 top-full pt-3 w-64 transition-all duration-200 ${
                  isToolsOpen
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 translate-y-1 pointer-events-none"
                }`}
              >
                <div
                  className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden"
                  role="menu"
                >
                  <div>
                    <Link
                      href="/tools/tax-estimator"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-[#f6f6f6] dark:hover:bg-zinc-800 transition-colors"
                    >
                      <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
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
                          <rect width="16" height="20" x="4" y="2" rx="2" />
                          <line x1="8" x2="16" y1="6" y2="6" />
                          <line x1="8" x2="16" y1="10" y2="10" />
                          <line x1="8" x2="16" y1="14" y2="14" />
                          <line x1="8" x2="16" y1="18" y2="18" />
                        </svg>
                      </div>
                      Tax Estimator
                    </Link>
                    <Link
                      href="/tools/ai-chat"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-[#f6f6f6] dark:hover:bg-zinc-800 transition-colors"
                    >
                      <div className="p-1.5 rounded-md bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
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
                          <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
                        </svg>
                      </div>
                      AI Chat Assistant
                    </Link>
                    <Link
                      href="/tools/bank-statement"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-[#f6f6f6] dark:hover:bg-zinc-800 transition-colors"
                    >
                      <div className="p-1.5 rounded-md bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
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
                          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                          <path d="M10 9H8" />
                          <path d="M16 13H8" />
                          <path d="M16 17H8" />
                        </svg>
                      </div>
                      Bank Statement Analyser
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <Link
              href="/data-privacy"
              className={`hover:text-indigo-900 dark:hover:text-indigo-400 transition-colors ${
                isActive("/data-privacy")
                  ? "text-indigo-900 dark:text-indigo-400 font-semibold"
                  : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              Data Privacy
            </Link>

            {/* Resources dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsResourcesOpen(true)}
              onMouseLeave={() => setIsResourcesOpen(false)}
            >
              <button
                onClick={() => setIsResourcesOpen(!isResourcesOpen)}
                aria-haspopup="menu"
                aria-expanded={isResourcesOpen}
                className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-indigo-900 dark:hover:text-indigo-400 transition-colors cursor-pointer"
              >
                Resources
                <svg
                  className={`w-4 h-4 text-zinc-400 transition-transform ${
                    isResourcesOpen ? "rotate-180" : ""
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <div
                className={`absolute right-0 top-full pt-3 w-92 transition-all duration-200 ${
                  isResourcesOpen
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 translate-y-1 pointer-events-none"
                }`}
              >
                <div
                  className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden"
                  role="menu"
                >
                  <p className="pt-3 px-4 uppercase text-zinc-500 text-[13px]">
                    Download Gazettes
                  </p>
                  <hr className="mt-2 border-zinc-100 dark:border-zinc-800" />
                  <div>
                    {resources.map((r) => (
                      <a
                        key={r.id}
                        href={r.url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex gap-1.5 px-4 py-3.5 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-[#f6f6f6] dark:hover:bg-zinc-800 transition-colors"
                        aria-label={r.title}
                      >
                        <div className="flex items-center gap-1.5">
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
                            className="text-indigo-900 dark:text-indigo-400"
                          >
                            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                            <path d="M10 9H8" />
                            <path d="M16 13H8" />
                            <path d="M16 17H8" />
                          </svg>
                          <span className="truncate">{r.title}</span>
                        </div>
                        <span className="text-zinc-400">({r.size})</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <ContactLink className="text-zinc-500 dark:text-zinc-400 hover:text-indigo-900 dark:hover:text-indigo-400 transition-colors">
              Contact Us
            </ContactLink>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
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
                  className="text-zinc-600 dark:text-zinc-400"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              ) : (
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
                  className="text-zinc-600 dark:text-zinc-400"
                >
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
              )}
            </button>

            {/* Dark Mode Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                  aria-label="Toggle dark mode"
                >
                  {isDarkMode ? (
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
                      className="text-yellow-500"
                    >
                      <circle cx="12" cy="12" r="4" />
                      <path d="M12 2v2" />
                      <path d="M12 20v2" />
                      <path d="m4.93 4.93 1.41 1.41" />
                      <path d="m17.66 17.66 1.41 1.41" />
                      <path d="M2 12h2" />
                      <path d="M20 12h2" />
                      <path d="m6.34 17.66-1.41 1.41" />
                      <path d="m19.07 4.93-1.41 1.41" />
                    </svg>
                  ) : (
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
                      className="text-zinc-600"
                    >
                      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                    </svg>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="center">
                <p>{isDarkMode ? "Light Mode" : "Dark Mode"}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Mobile Navigation Menu Backdrop */}
        <div
          className={`lg:hidden h-screen fixed inset-0 top-17.5 bg-zinc-950/60 backdrop-blur-[2px] z-30 transition-opacity duration-300 ${
            isMobileMenuOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Mobile Navigation Menu */}
        <div
          className={`lg:hidden absolute top-full left-0 w-full z-40 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-sm transition-all duration-300 ease-in-out ${
            isMobileMenuOpen
              ? "max-h-[85vh] opacity-100 translate-y-0 pointer-events-auto"
              : "max-h-0 opacity-0 -translate-y-2 pointer-events-none"
          } overflow-y-auto`}
        >
          <div className="px-6 md:px-12 py-5 space-y-6">
            <div>
              <button
                onClick={() => setIsMobileToolsOpen(!isMobileToolsOpen)}
                className="w-full flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                aria-expanded={isMobileToolsOpen}
              >
                <span>Tools</span>
                <svg
                  className={`w-4 h-4 transform transition-transform ${
                    isMobileToolsOpen ? "rotate-180" : ""
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <div
                className={`mt-4 space-y-4 pl-3 transition-all ${
                  isMobileToolsOpen ? "block" : "hidden"
                }`}
              >
                <Link
                  href="/tools/tax-estimator"
                  className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
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
                  </div>
                  Tax Estimator
                </Link>
                <Link
                  href="/tools/ai-chat"
                  className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  <div className="p-1.5 rounded-md bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
                    </svg>
                  </div>
                  AI Chat Assistant
                </Link>
                <Link
                  href="/tools/bank-statement"
                  className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  <div className="p-1.5 rounded-md bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
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
                  </div>
                  Bank Statement Analyser
                </Link>
              </div>
            </div>

            <Link
              href="/data-privacy"
              className={`block text-sm transition-colors ${
                isActive("/data-privacy")
                  ? "text-indigo-900 font-semibold"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-indigo-900 dark:hover:text-indigo-400"
              }`}
            >
              Data Privacy
            </Link>

            <div>
              <button
                onClick={() => setIsMobileResourcesOpen(!isMobileResourcesOpen)}
                className="w-full flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400 hover:text-indigo-900 dark:hover:text-indigo-400 transition-colors"
                aria-expanded={isMobileResourcesOpen}
              >
                <span>Download Gazettes</span>
                <svg
                  className={`w-4 h-4 transform transition-transform ${
                    isMobileResourcesOpen ? "rotate-180" : ""
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <div
                className={`mt-3 space-y-3 pl-3 transition-all ${
                  isMobileResourcesOpen ? "block" : "hidden"
                }`}
              >
                {resources.map((r) => (
                  <Link
                    key={r.id}
                    href={r.url || "#"}
                    target={r.url ? "_blank" : undefined}
                    rel={r.url ? "noopener noreferrer" : undefined}
                    className="flex items-center justify-between gap-3 text-sm text-zinc-500 dark:text-zinc-400 hover:text-indigo-900 dark:hover:text-indigo-400 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 text-rose-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <path d="M14 2v6h6" />
                      </svg>
                      <span className="truncate">{r.title}</span>
                    </div>
                    <span className="text-[11px] text-zinc-400 shrink-0">
                      {r.size}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <ContactLink className="block text-sm text-zinc-600 dark:text-zinc-400 hover:text-indigo-900 dark:hover:text-indigo-400 transition-colors">
              Contact Us
            </ContactLink>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}
