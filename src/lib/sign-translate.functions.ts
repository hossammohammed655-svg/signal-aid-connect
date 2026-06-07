import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  imageBase64: z.string().min(100).max(8_000_000),
});

export type SignTranslateResult = {
  text_en: string;
  text_ar: string;
  detected: boolean;
};

export const translateSign = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<SignTranslateResult> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const dataUrl = data.imageBase64.startsWith("data:")
      ? data.imageBase64
      : `data:image/jpeg;base64,${data.imageBase64}`;

    const systemPrompt = `You are a sign language interpreter. Look at the image and if you see someone making hand signs, translate what they are signing into text. Respond ONLY with strict JSON of shape {"detected": boolean, "text_en": string, "text_ar": string}. If no clear sign language is detected, set detected=false and politely say so in both languages.`;

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
      return {
        detected: !!parsed.detected,
        text_en: String(parsed.text_en ?? ""),
        text_ar: String(parsed.text_ar ?? ""),
      };
    } catch {
      throw new Error("AI returned invalid JSON");
    }
  });
