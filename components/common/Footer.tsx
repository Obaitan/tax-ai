"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ContactLink } from "./ContactLink";
import { resources } from "../../lib/data/resources";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();

  return (
    <footer className="bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 md:px-12 2xl:px-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
          <div className="space-y-5">
            <Link href="/" className="inline-block">
              <span className="text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Tax AI
              </span>
            </Link>
            <p className="text-zinc-600 dark:text-zinc-500 text-sm leading-relaxed">
              Empowering Nigerians with tax tools and AI-driven insights based
              on the Nigeria Tax Act 2025.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="#"
                className="text-zinc-400 hover:text-indigo-900 dark:hover:text-indigo-400 transition-colors"
              >
                <span className="sr-only">X (Twitter)</span>
                <svg className="size-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </Link>
              <Link
                href="#"
                className="text-zinc-400 hover:text-indigo-900 dark:hover:text-indigo-400 transition-colors"
              >
                <span className="sr-only">LinkedIn</span>
                <svg className="size-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Tools Section */}
          <div className="md:pl-14">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-6">
              Tools
            </h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/tools/tax-estimator"
                  className={`transition-colors text-sm ${
                    pathname === "/tools/tax-estimator"
                      ? "text-indigo-900 dark:text-indigo-400 font-medium"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-indigo-900 dark:hover:text-indigo-400"
                  }`}
                >
                  Tax Estimator
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/ai-chat"
                  className={`transition-colors text-sm ${
                    pathname === "/tools/ai-chat"
                      ? "text-indigo-900 dark:text-indigo-400 font-medium"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-indigo-900 dark:hover:text-indigo-400"
                  }`}
                >
                  AI Chat Assistant
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/bank-statement"
                  className={`transition-colors text-sm ${
                    pathname === "/tools/bank-statement"
                      ? "text-indigo-900 dark:text-indigo-400 font-medium"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-indigo-900 dark:hover:text-indigo-400"
                  }`}
                >
                  Bank Statement Analyser
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Section */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-6">
              Download Resources
            </h3>
            <ul className="space-y-4">
              {resources.map((resource) => (
                <li key={resource.id}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-600 dark:text-zinc-400 hover:text-indigo-900 dark:hover:text-indigo-400 transition-colors text-sm block truncate"
                  >
                    <div className="flex items-center gap-1.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="size-4 text-indigo-900 dark:text-indigo-400"
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
                      <span className="truncate text-sm">{resource.title}</span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-8 flex flex-col md:flex-row flex-wrap lg:justify-between md:items-center gap-x-5 gap-y-2.5">
          <p className="text-zinc-500 text-xs">
            © {currentYear} Tax AI. Built for Nigeria.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 mt-2 md:mt-0">
            <Link
              href="#"
              className="text-zinc-600 dark:text-zinc-400 hover:text-indigo-900 dark:hover:text-indigo-400 transition-colors text-xs"
            >
              Consult A Licensed Tax Professional
            </Link>

            <Link
              href="/data-privacy"
              className="text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 text-xs transition-colors"
            >
              Data Privacy
            </Link>
            <ContactLink className="text-indigo-900 dark:text-indigo-400 text-xs">
              Contact Us
            </ContactLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
