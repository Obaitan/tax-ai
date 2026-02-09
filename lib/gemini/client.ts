import { GoogleGenAI } from "@google/genai";

let _genAI: GoogleGenAI | null = null;

export const getGenAI = (): GoogleGenAI => {
  if (!_genAI) {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      throw new Error("GOOGLE_GEMINI_API_KEY is not set");
    }
    _genAI = new GoogleGenAI({
      apiKey: process.env.GOOGLE_GEMINI_API_KEY,
    });
  }
  return _genAI;
};

// For backward compatibility, export genAI as a getter
export const genAI = new Proxy({} as GoogleGenAI, {
  get(_, prop) {
    return getGenAI()[prop as keyof GoogleGenAI];
  },
});

export const GEMINI_ASSISTANT_MODEL = "gemini-3-flash-preview";
export const GEMINI_PARSER_MODEL = "gemini-3-flash-preview";
