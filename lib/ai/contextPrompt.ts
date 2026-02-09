export function buildContextPrompt(
  retrievedChunks: {
    source: string;
    section?: string;
    content: string;
  }[],
) {
  if (!retrievedChunks.length) {
    return `
NIGERIAN TAX LAW CONTEXT (VERIFIED):

No relevant tax law context was retrieved.
The assistant must state that the information cannot be determined with certainty.
`;
  }

  const formattedChunks = retrievedChunks
    .map((chunk, index) => {
      return `
[Source ${index + 1}]
Document: ${chunk.source}
${chunk.section ? `Section: ${chunk.section}` : ""}
Content:
${chunk.content}
`;
    })
    .join("\n");

  return `
NIGERIAN TAX LAW CONTEXT (VERIFIED):

The following excerpts are from official Nigerian tax laws and regulatory documents.
They are the ONLY authoritative sources you may rely on.

${formattedChunks}
`;
}
