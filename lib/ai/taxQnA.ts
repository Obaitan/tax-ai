export const TAX_QNA_TASK_PROMPT = (question: string) => `
TASK:
Answer the user's question as accurately as possible using the Nigerian tax law context provided above and your knowledge of the Nigerian Tax Reform Act 2025.

User question:
"${question}"

GUIDELINES:
- Provide a clear and comprehensive answer.
- If the law provides specific exemptions, thresholds, or conditions, please list them clearly.
- If the question is not directly covered in the provided context but relates to standard Nigerian tax principles, use your broader knowledge to be helpful while remaining legally accurate.
- CITATIONS: Provide the specific sections of the tax laws referred to. Use human-readable titles (e.g., "Nigeria Tax Act 2025"). Provide this in a dedicated section prefixed by "---CITATIONS---".
- DISCLAIMER: End with the standard disclaimer prefixed by "---DISCLAIMER---".
`;
