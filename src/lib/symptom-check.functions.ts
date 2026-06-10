import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { geminiJson } from "@/lib/gemini.server";

const inputSchema = z.object({
  symptoms: z.array(z.string().min(1).max(64)).min(1).max(20),
});

export type SymptomResult = {
  risk_level: "LOW" | "MODERATE" | "EMERGENCY";
  explanation_ar: string;
  explanation_en: string;
  recommendation: "Pharmacist" | "Doctor" | "Emergency Room";
};

export const checkSymptoms = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<SymptomResult> => {
    const prompt = `You are a medical AI assistant. Analyze these symptoms: ${data.symptoms.join(", ")}. Respond in JSON with:
risk_level: LOW, MODERATE, or EMERGENCY
explanation_ar: brief explanation in Arabic (1-2 sentences)
explanation_en: brief explanation in English (1-2 sentences)
recommendation: Pharmacist, Doctor, or Emergency Room`;

    const parsed = await geminiJson<SymptomResult>({
      system: "You are a careful medical triage assistant. Always respond with strict JSON only, no markdown.",
      prompt,
    });

    const risk = String(parsed.risk_level || "").toUpperCase();
    if (!["LOW", "MODERATE", "EMERGENCY"].includes(risk)) {
      parsed.risk_level = "MODERATE";
    } else {
      parsed.risk_level = risk as SymptomResult["risk_level"];
    }
    return parsed;
  });
