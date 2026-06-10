import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { geminiJson, parseImageBase64 } from "@/lib/gemini.server";

const inputSchema = z.object({
  imageBase64: z.string().min(100).max(8_000_000),
});

export type SignTranslateResult = {
  detected: boolean;
  text_en: string;
  text_ar: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
};

export const translateSign = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<SignTranslateResult> => {
    const image = parseImageBase64(data.imageBase64);

    const parsed = await geminiJson<{
      detected?: boolean;
      translation_ar?: string;
      translation_en?: string;
      text_ar?: string;
      text_en?: string;
      confidence?: string;
    }>({
      system:
        'You are a sign language interpreter. Look carefully at the hands in this image. If you see sign language gestures translate them. Respond ONLY with strict JSON of shape {"detected": boolean, "translation_ar": string, "translation_en": string, "confidence": "HIGH" | "MEDIUM" | "LOW"}. If no clear sign is detected, set detected=false, translation_ar="لم يتم اكتشاف إشارة واضحة", translation_en="No clear sign detected", confidence="LOW".',
      prompt: "Translate the sign in this image. Reply with JSON only.",
      image,
    });

    const conf = String(parsed.confidence ?? "LOW").toUpperCase();
    return {
      detected: !!parsed.detected,
      text_en: String(parsed.translation_en ?? parsed.text_en ?? ""),
      text_ar: String(parsed.translation_ar ?? parsed.text_ar ?? ""),
      confidence: (conf === "HIGH" || conf === "MEDIUM" ? conf : "LOW") as "HIGH" | "MEDIUM" | "LOW",
    };
  });

const textInputSchema = z.object({
  text: z.string().min(1).max(500),
});

export type TextToSignWord = {
  word: string;
  word_ar: string;
  word_en: string;
  fingers: string;
  hand_shape: string;
  movement: string;
  emoji_representation: string;
  tip: string;
};

export type TextToSignResult = {
  words: TextToSignWord[];
  full_sentence_tip: string;
};

export const textToSign = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => textInputSchema.parse(data))
  .handler(async ({ data }): Promise<TextToSignResult> => {
    const prompt = `You are a sign language expert. The user wants to show this text to a deaf person using sign language: ${data.text}
Respond ONLY in JSON:
{ "words": [ { "word": string, "word_ar": string, "word_en": string, "fingers": string, "hand_shape": string, "movement": string, "emoji_representation": string, "tip": string } ], "full_sentence_tip": string }`;

    const parsed = await geminiJson<{
      words?: Array<Record<string, unknown>>;
      full_sentence_tip?: string;
    }>({
      system: "You are a sign language expert. Always respond with strict JSON only, no markdown.",
      prompt,
    });

    const words = Array.isArray(parsed.words)
      ? parsed.words.map((w) => ({
          word: String(w.word ?? ""),
          word_ar: String(w.word_ar ?? ""),
          word_en: String(w.word_en ?? ""),
          fingers: String(w.fingers ?? ""),
          hand_shape: String(w.hand_shape ?? ""),
          movement: String(w.movement ?? ""),
          emoji_representation: String(w.emoji_representation ?? ""),
          tip: String(w.tip ?? ""),
        }))
      : [];

    return {
      words,
      full_sentence_tip: String(parsed.full_sentence_tip ?? ""),
    };
  });
