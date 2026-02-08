export const boldTaxActs = (text: string) => {
  const regex =
    /(Nigeria(?:n)? Tax(?: Reform| Administration)? Act(?:,?\s*\d{4})?|Finance Act(?:,?\s*\d{4})?)/gi;
  return text
    .replace(regex, (match) => `**${match.trim()}**`)
    .replace(/\*{4,}/g, "**");
};

/**
 * Detects if a message indicates that no information was found in the tax code
 */
export const isNoInformationFound = (content: string): boolean => {
  const lowerContent = content.toLowerCase();
  const indicators = [
    "unable to find",
    "cannot be determined with certainty",
    "not found in the nigerian tax code",
    "no relevant information",
    "not mention",
    "don't have information",
    "do not have information",
    "could not find",
    "something went wrong",
    "please try again",
    "service is currently busy",
    "reaching its limit",
    "try again in about",
  ];
  return indicators.some((indicator) => lowerContent.includes(indicator));
};

export const parseMessage = (content: string) => {
  const parts = content.split("---DISCLAIMER---");
  const mainPart = parts[0];
  const disclaimer = parts[1] || "";

  const subParts = mainPart.split("---CITATIONS---");
  const body = subParts[0].trim();
  let citations = subParts[1] || "";

  // Regex to remove technical IDs (e.g., "omnw54pzbnw3: ") that might slip through
  // Matches 8-15 alphanumeric characters followed by a colon and space
  citations = citations.replace(/[a-z0-9]{8,15}:\s*/gi, "");

  // Normalize separators: convert newlines or multiple spaces between citations into semicolons
  // Only if they aren't already there
  let processedCitations = citations
    .trim()
    .split(/\n+/)
    .map((c) => c.trim())
    .filter((c) => c.length > 0)
    .join("; ");

  // Check if citations are empty or "None"
  const isCitationsEmpty =
    !processedCitations || processedCitations.toLowerCase() === "none";

  // Check if this is a "no information found" response
  // If the body is empty, we treat it as no information found
  const noInfoFound = isNoInformationFound(content) || body === "";

  return {
    body: boldTaxActs(body),
    citations:
      isCitationsEmpty || noInfoFound ? "" : boldTaxActs(processedCitations),
    disclaimer: noInfoFound ? "" : disclaimer.trim(),
    noInfoFound,
  };
};
