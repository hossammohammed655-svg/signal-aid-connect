import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `You are a medical AI assistant. Analyze these symptoms: ${data.symptoms.join(", ")}. Respond in JSON with:
risk_level: LOW, MODERATE, or EMERGENCY
explanation_ar: brief explanation in Arabic (1-2 sentences)
explanation_en: brief explanation in English (1-2 sentences)
recommendation: Pharmacist, Doctor, or Emergency Room`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a careful medical triage assistant. Always respond with strict JSON only, no markdown." },
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
    let parsed: SymptomResult;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error("AI returned invalid JSON");
    }

    const risk = String(parsed.risk_level || "").toUpperCase();
    if (!["LOW", "MODERATE", "EMERGENCY"].includes(risk)) {
      parsed.risk_level = "MODERATE";
    } else {
      parsed.risk_level = risk as SymptomResult["risk_level"];
    }
    return parsed;
  });
