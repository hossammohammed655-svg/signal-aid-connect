import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const dataUrl = data.imageBase64.startsWith("data:")
      ? data.imageBase64
      : `data:image/jpeg;base64,${data.imageBase64}`;

    const systemPrompt = `You are a sign language interpreter. Look carefully at the hands in this image. If you see sign language gestures translate them. Respond ONLY with strict JSON of shape {"detected": boolean, "translation_ar": string, "translation_en": string, "confidence": "HIGH" | "MEDIUM" | "LOW"}. If no clear sign is detected, set detected=false, translation_ar="لم يتم اكتشاف إشارة واضحة", translation_en="No clear sign detected", confidence="LOW".`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "Translate the sign in this image. Reply with JSON only." },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      if (res.status === 429) throw new Error("Rate limit exceeded. Please try again shortly.");
      if (res.status === 402) throw new Error("AI credits exhausted.");
      throw new Error(`AI request failed: ${res.status} ${text}`);
    }

    const json = await res.json();
    const content: string = json?.choices?.[0]?.message?.content ?? "{}";
    try {
      const parsed = JSON.parse(content);
      const conf = String(parsed.confidence ?? "LOW").toUpperCase();
      return {
        detected: !!parsed.detected,
        text_en: String(parsed.translation_en ?? parsed.text_en ?? ""),
        text_ar: String(parsed.translation_ar ?? parsed.text_ar ?? ""),
        confidence: (conf === "HIGH" || conf === "MEDIUM" ? conf : "LOW") as "HIGH" | "MEDIUM" | "LOW",
      };
    } catch {
      throw new Error("AI returned invalid JSON");
    }
  });
