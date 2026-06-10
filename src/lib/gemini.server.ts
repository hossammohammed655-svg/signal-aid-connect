const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

export function getGeminiApiKey(): string {
  const key = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not configured");
  return key;
}

type GeminiPart = { text: string } | { inlineData: { mimeType: string; data: string } };

type GeminiJsonOptions = {
  system?: string;
  prompt: string;
  image?: { mimeType: string; base64: string };
};

export function parseImageBase64(imageBase64: string): { mimeType: string; base64: string } {
  const dataUrl = imageBase64.startsWith("data:")
    ? imageBase64
    : `data:image/jpeg;base64,${imageBase64}`;
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid image data");
  return { mimeType: match[1], base64: match[2] };
}

export async function geminiJson<T>({ system, prompt, image }: GeminiJsonOptions): Promise<T> {
  const apiKey = getGeminiApiKey();
  const parts: GeminiPart[] = [{ text: prompt }];
  if (image) {
    parts.push({ inlineData: { mimeType: image.mimeType, data: image.base64 } });
  }

  const body: Record<string, unknown> = {
    contents: [{ role: "user", parts }],
    generationConfig: { responseMimeType: "application/json" },
  };
  if (system) {
    body.systemInstruction = { parts: [{ text: system }] };
  }

  const res = await fetch(
    `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error("Rate limit exceeded. Please try again shortly.");
    throw new Error(`Gemini API request failed: ${res.status} ${text}`);
  }

  const json = await res.json();
  const content: string = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  try {
    return JSON.parse(content) as T;
  } catch {
    throw new Error("Gemini returned invalid JSON");
  }
}
