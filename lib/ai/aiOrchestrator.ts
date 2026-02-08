import { ThinkingLevel } from "@google/genai";
import { genAI, GEMINI_ASSISTANT_MODEL } from "@/lib/gemini/client";
import { assemblePrompt } from "@/lib/ai/promptAssembler";
import { SYSTEM_PROMPT_V1 } from "@/lib/ai/systemPrompt";

const IS_GEMINI_3 =
  GEMINI_ASSISTANT_MODEL.startsWith("gemini-3-");

export async function runTaxAI({
  taskPrompt,
  contextPrompt,
}: {
  taskPrompt: string;
  contextPrompt: string;
}) {
  const storeId = process.env.GEMINI_FILE_SEARCH_STORE_ID;

  const result = await genAI.models.generateContent({
    model: GEMINI_ASSISTANT_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: assemblePrompt({
              systemPrompt: "", // System prompt moved to instruction
              contextPrompt,
              taskPrompt,
            }),
          },
        ],
      },
    ],
    config: {
      systemInstruction: SYSTEM_PROMPT_V1,
      ...(IS_GEMINI_3 && {
        thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
      }),
      tools: storeId
        ? [
            {
              fileSearch: {
                fileSearchStoreNames: [storeId],
              },
            },
          ]
        : undefined,
    },
  });

  // Normalize the disclaimer so the UI shows a short, consistent message
  // If the model included a disclaimer section (prefixed by ---DISCLAIMER---), replace its contents with a short standard disclaimer.
  // Otherwise, append the standard disclaimer block so the UI can render it consistently.
  const { DISCLAIMER_BLOCK, stripLegacyDisclaimers } =
    await import("@/lib/ai/disclaimer");

  let finalText = result.text ?? "";
  finalText = stripLegacyDisclaimers(finalText);

  // If the model returned an empty string, provide a helpful fallback
  const isActuallyEmpty = finalText.trim().length === 0;
  if (isActuallyEmpty) {
    finalText =
      "I'm sorry, I was unable to find specific information in the Nigerian tax laws to answer your question accurately. Please try rephrasing your question or provide more details.";
  }

  // Normalize the disclaimer logic
  if (finalText.includes("---DISCLAIMER---")) {
    finalText = finalText.replace(
      /---DISCLAIMER---[\s\S]*$/g,
      DISCLAIMER_BLOCK,
    );
  } else if (!isActuallyEmpty) {
    // Only append the disclaimer block if we have actual content from the model
    // and it didn't already include one. Forego it for the fallback message
    // as per user request to hide it when there is "no answer".
    finalText = `${finalText.trim()}\n\n${DISCLAIMER_BLOCK}`;
  }

  return finalText;
}
