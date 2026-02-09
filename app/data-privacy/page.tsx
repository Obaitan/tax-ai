import Link from "next/link";
import { ContactLink } from "@/components/common/ContactLink";

const DataPrivacyPage = () => {
  return (
    <section className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 md:py-16">
      <div className="md:px-12 xl:px-0 max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Data Privacy Policy
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">
            Last updated: February 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-10">
          {/* Introduction */}
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
              At{" "}
              <span className="font-semibold text-indigo-800 dark:text-indigo-400">
                Tax AI
              </span>
              , we are committed to protecting your privacy and ensuring the
              security of any information you share while using our platform.
              This policy outlines how we handle data when you use our
              AI-powered tax assistance service.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              No Personal Information Collection
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              This application does not request, collect, or store any personal
              information. We do not require you to create an account, provide
              your name, email address, phone number, or any other personally
              identifiable information to use our services.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Automatic Session Data Deletion
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              All data generated during your session—including your
              conversations, tax calculations, and any information you input —is
              automatically deleted when your session ends. We do not retain any
              session-specific data after you close the application or your
              browser.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Anonymous Query Analysis
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              To improve our service efficiency and understanding of user needs,
              we may store anonymized queries and prompts for future analysis.
              These stored queries are completely anonymized and are not tied to
              any user identity, IP address, or session information. This data
              is used solely for improving the quality and accuracy of our tax
              guidance.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Handling of Sensitive Information
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
              We understand that tax-related queries may involve sensitive
              information such as salary details, employer information, or
              financial data. Please be aware of the following:
            </p>
            <ul className="space-y-2 text-zinc-600 dark:text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-400">•</span>
                <span>
                  <strong className="text-zinc-700 dark:text-zinc-300">
                    Document Uploads:
                  </strong>{" "}
                  If you upload documents such as salary slips, they are
                  processed in-memory and are not stored on our servers.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-400">•</span>
                <span>
                  <strong className="text-zinc-700 dark:text-zinc-300">
                    Data Minimization:
                  </strong>{" "}
                  We recommend sharing only the minimum information necessary to
                  receive accurate tax guidance.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-400">•</span>
                <span>
                  <strong className="text-zinc-700 dark:text-zinc-300">
                    Encryption:
                  </strong>{" "}
                  All data transmitted to and from our platform is encrypted
                  using industry-standard TLS/SSL protocols.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-400">•</span>
                <span>
                  <strong className="text-zinc-700 dark:text-zinc-300">
                    No Third-Party Sharing:
                  </strong>{" "}
                  We do not share, sell, or transfer any user data to third
                  parties for marketing or other purposes.
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Compliance with Nigerian Data Protection Laws
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
              TaxAffairs.ng operates in full compliance with applicable Nigerian
              data protection regulations, including:
            </p>
            <ul className="space-y-2 text-zinc-600 dark:text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="text-teal-600 dark:text-teal-400">•</span>
                <span>
                  <strong className="text-zinc-700 dark:text-zinc-300">
                    Nigeria Data Protection Act (NDPA) 2023:
                  </strong>{" "}
                  We adhere to all principles outlined in the NDPA, including
                  lawfulness, fairness, transparency, and data minimization.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 dark:text-teal-400">•</span>
                <span>
                  <strong className="text-zinc-700 dark:text-zinc-300">
                    NITDA Guidelines:
                  </strong>{" "}
                  We follow guidelines issued by the National Information
                  Technology Development Agency regarding data handling and
                  privacy.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 dark:text-teal-400">•</span>
                <span>
                  <strong className="text-zinc-700 dark:text-zinc-300">
                    User Rights:
                  </strong>{" "}
                  Since we do not store personal data, traditional data subject
                  rights (access, rectification, erasure) are automatically
                  fulfilled through our no-storage policy.
                </span>
              </li>
            </ul>
          </div>

          {/* Your Responsibility */}
          <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 p-4 md:p-5">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
              Your Responsibility
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              While we take extensive measures to protect your privacy, we
              encourage you to exercise caution when sharing sensitive
              information online. Avoid including unnecessary personal
              identifiers in your queries. If you have concerns about privacy,
              you may use generalized examples or hypothetical scenarios when
              seeking tax advice.
            </p>
          </div>

          {/* Contact */}
          <div className="text-center text-sm pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400">
              If you have any questions about our privacy policy or anything
              else, please{" "}
              <ContactLink className="text-indigo-800 dark:text-indigo-400 hover:underline font-medium">
                contact us
              </ContactLink>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DataPrivacyPage;
