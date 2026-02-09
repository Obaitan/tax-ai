import { GoogleGenAI } from "@google/genai";

export const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY!,
});

export const GEMINI_ASSISTANT_MODEL = "gemini-3-flash-preview";
export const GEMINI_PARSER_MODEL = "gemini-3-flash-preview";
