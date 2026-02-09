export function assemblePrompt({
  systemPrompt,
  contextPrompt,
  taskPrompt,
}: {
  systemPrompt: string;
  contextPrompt: string;
  taskPrompt: string;
}) {
  return `
${systemPrompt}

${contextPrompt}

${taskPrompt}
`.trim();
}
