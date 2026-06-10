import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  medication: z.string().min(1).max(80).regex(/^[a-zA-Z0-9 _\-]+$/),
});

export type InteractionItem = {
  name_en: string;
  name_ar: string;
  category: "food" | "drug";
  level: "DANGER" | "CAUTION" | "SAFE";
  reason_en: string;
  reason_ar: string;
  advice_en: string;
  advice_ar: string;
};

export type DrugCheckResult = {
  medication: string;
  timing_en: string;
  timing_ar: string;
  interactions: InteractionItem[];
};

export const checkDrugInteractions = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<DrugCheckResult> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `You are a clinical pharmacist AI. For the medication "${data.medication}", produce a strict JSON object with this exact schema:
{
  "medication": string,
  "timing_en": string (best time to take it, with/without food, etc),
  "timing_ar": string (نفس الشيء بالعربية),
  "interactions": [
    {
      "name_en": string (food or drug name in English),
      "name_ar": string (الاسم بالعربية),
      "category": "food" | "drug",
      "level": "DANGER" | "CAUTION" | "SAFE",
      "reason_en": string (one short sentence why),
      "reason_ar": string (جملة قصيرة بالعربية),
      "advice_en": string (what to do instead, one short sentence),
      "advice_ar": string (نصيحة قصيرة بالعربية)
    }
  ]
}
Include 4-7 of the most clinically relevant interactions: at least 2 food interactions and at least 2 drug interactions. Use "SAFE" for any food/drug that is specifically recommended or safe. Respond with JSON only, no markdown.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a careful clinical pharmacist. Always respond with strict JSON only, no markdown." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      if (res.status === 429) throw new Error("Rate limit exceeded. Please try again shortly.");
      if (res.status === 402) throw new Error("AI credits exhausted. Please add credits to your workspace.");
      throw new Error(`AI request failed: ${res.status} ${text}`);
    }

    const json = await res.json();
    const content: string = json?.choices?.[0]?.message?.content ?? "{}";
    let parsed: DrugCheckResult;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error("AI returned invalid JSON");
    }

    parsed.interactions = (parsed.interactions || []).map((i) => ({
      ...i,
      level: (["DANGER", "CAUTION", "SAFE"].includes(String(i.level).toUpperCase())
        ? String(i.level).toUpperCase()
        : "CAUTION") as InteractionItem["level"],
      category: i.category === "drug" ? "drug" : "food",
    }));

    return parsed;
  });
