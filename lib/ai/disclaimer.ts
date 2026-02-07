export const SHORT_DISCLAIMER_TEXT =
  "This response is for informational purposes only and does not constitute professional tax advice.";

// Legacy or variant disclaimers that might be emitted by the model. We strip these
// from model output to avoid duplicates and ensure a single canonical disclaimer.
export const LEGACY_DISCLAIMERS = [
  "This response is for informational purposes only and does not constitute professional tax advice. You should consult with a licensed tax advisor for advice tailored to your specific situation.",
  "This response is for informational purposes only and does not constitute professional tax advice. You should consult with a licensed tax professional for advice tailored to your specific situation.",
  SHORT_DISCLAIMER_TEXT,
];

export const DISCLAIMER_BLOCK = `---DISCLAIMER---\n${SHORT_DISCLAIMER_TEXT}`;

/**
 * Removes any known legacy disclaimers from the text to prevent duplication.
 */
export function stripLegacyDisclaimers(text: string): string {
  let cleanedText = text;
  for (const disclaimer of LEGACY_DISCLAIMERS) {
    // Escape special characters for regex
    const escaped = disclaimer.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "g");
    cleanedText = cleanedText.replace(regex, "");
  }
  return cleanedText.trim();
}
