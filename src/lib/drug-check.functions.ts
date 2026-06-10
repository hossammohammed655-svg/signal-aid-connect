import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { geminiJson } from "@/lib/gemini.server";

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

    const parsed = await geminiJson<DrugCheckResult>({
      system: "You are a careful clinical pharmacist. Always respond with strict JSON only, no markdown.",
      prompt,
    });

    parsed.interactions = (parsed.interactions || []).map((i) => ({
      ...i,
      level: (["DANGER", "CAUTION", "SAFE"].includes(String(i.level).toUpperCase())
        ? String(i.level).toUpperCase()
        : "CAUTION") as InteractionItem["level"],
      category: i.category === "drug" ? "drug" : "food",
    }));

    return parsed;
  });
