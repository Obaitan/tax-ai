import { TAX_QNA_TASK_PROMPT } from "@/lib/ai/taxQnA";
import { runTaxAI } from "@/lib/ai/aiOrchestrator";

function extractName(question: string): string | null {
  const m = question.match(
    /\b(?:my name is|i am|i'm|im|it's|its)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/i,
  );
  return m ? m[1] : null;
}

function isLikelyTaxRelated(question: string): boolean {
  if (!question) return false;
  const q = question.toLowerCase();

  // Broadened keyword list to include common synonyms and variations
  const keywords = [
    "tax",
    "paye",
    "vat",
    "wht",
    "tin",
    "levy",
    "duty",
    "excise",
    "income",
    "profit",
    "gain",
    "relief",
    "exemption",
    "deduction",
    "filing",
    "return",
    "compliance",
    "assessment",
    "penalty",
    "interest",
    "corporation",
    "company",
    "individual",
    "personal",
    "payroll",
    "withholding",
    "capital gains",
    "stamp duty",
    "education tax",
    "itas",
    "firs",
    "sir",
    "lirs",
    "revenue",
    "fiscal",
  ];

  // Check if any keyword matches as a word boundary to avoid partial matches like "taxi"
  // but also allow simple inclusion for composite terms
  return keywords.some((k) => q.includes(k));
}

export async function POST(req: Request) {
  const { question, context } = await req.json();

  const name = extractName(question || "");

  // If the user just introduces their name (no other content), greet and redirect
  const onlyNameProvided =
    !!name &&
    !!question
      .trim()
      .toLowerCase()
      .replace(/["'!.]/g, "")
      .match(/^(my name is|i am|i'm|im|it's|its)\s+[a-z\s]+$/i);

  if (onlyNameProvided) {
    const greeting = `Hi ${name}, how can I help you with your taxes today?`;
    return Response.json({ aiResponse: greeting });
  }

  // Let the AI determine if the question is tax-related or not for better accuracy
  const taskPrompt = TAX_QNA_TASK_PROMPT(question);

  // Include the detected name in the context if available so the model may use it politely
  const contextPrompt = (name ? `UserName: ${name}\n` : "") + (context || "");

  try {
    const aiResponse = await runTaxAI({
      taskPrompt,
      contextPrompt,
    });

    return Response.json({ aiResponse });
  } catch (error: any) {
    console.error("Chat AI Error:", error);
    const msg = error.message || "";
    let userFriendlyMessage =
      "I'm sorry, something went wrong while processing your request. Please try again.";

    if (msg.includes("503") || msg.toLowerCase().includes("overloaded")) {
      userFriendlyMessage =
        "The AI service is currently busy processing many requests. Please try again in about 10 seconds.";
    } else if (
      msg.includes("429") ||
      msg.toLowerCase().includes("rate limit")
    ) {
      userFriendlyMessage =
        "The AI service is currently reaching its limit. Please wait about 30 seconds and try again.";
    }

    return Response.json({ aiResponse: userFriendlyMessage }, { status: 200 });
  }
}
