import { Message } from "@/app/types";

export function buildSessionContext(messages: Message[], maxTurns = 10) {
  if (!messages || messages.length === 0) return "";

  // Keep the most recent `maxTurns` user+assistant messages (i.e., last 2*maxTurns messages)
  const filtered = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-maxTurns * 2);

  // Attempt to find the user's name in the entire history for personalization
  let sessionUserName: string | null = null;
  for (const m of messages) {
    if (m.role === "user" && m.content) {
      const match = m.content.match(
        /\b(?:my name is|i am|i'm|im|it's|its)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/i
      );
      if (match) {
        sessionUserName = match[1];
        break; // Take the first name mentioned
      }
    }
  }

  const contextLines: string[] = ["=== SESSION CONTEXT ==="];

  if (sessionUserName) {
    contextLines.push(`UserName: ${sessionUserName}`);
  }

  contextLines.push("RELEVANT_HISTORY:");

  filtered.forEach((m) => {
    const role = m.role === "user" ? "User" : "Assistant";
    contextLines.push(`${role}: ${m.content}`);
  });

  contextLines.push("=== END OF SESSION CONTEXT ===");

  return contextLines.join("\n");
}
