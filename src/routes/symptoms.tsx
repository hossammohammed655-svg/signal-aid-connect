import { createFileRoute } from "@tanstack/react-router";
import { MobileShell, ScreenHeader } from "@/components/MobileShell";
import { useState } from "react";
import { Thermometer, HeartPulse, Brain, Wind, Stethoscope, AlertTriangle, ShieldCheck, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/symptoms")({
  head: () => ({ meta: [{ title: "Symptom Checker · إشارة حياة" }] }),
  component: Symptoms,
});

const symptoms = [
  { id: "fever", label: "Fever", ar: "حمى", icon: Thermometer },
  { id: "chest", label: "Chest pain", ar: "ألم صدر", icon: HeartPulse },
  { id: "headache", label: "Headache", ar: "صداع", icon: Brain },
  { id: "breath", label: "Shortness of breath", ar: "ضيق تنفس", icon: Wind },
  { id: "cough", label: "Cough", ar: "سعال", icon: Stethoscope },
  { id: "dizzy", label: "Dizziness", ar: "دوار", icon: AlertTriangle },
];

function Symptoms() {
  const [selected, setSelected] = useState<string[]>(["fever", "chest"]);
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const risk = selected.includes("chest") || selected.includes("breath") ? "high" : selected.length >= 2 ? "moderate" : "low";
  const meta = {
    low: { color: "bg-success text-success-foreground", label: "Low risk", action: "Visit a pharmacist", ar: "خطر منخفض" },
    moderate: { color: "bg-warning text-warning-foreground", label: "Moderate", action: "Consult a doctor", ar: "خطر متوسط" },
    high: { color: "bg-destructive text-destructive-foreground", label: "Emergency", action: "Go to ER immediately", ar: "حالة طارئة" },
  }[risk];

  return (
    <MobileShell>
      <ScreenHeader title="Symptom Checker" subtitle="Tap what you feel · AI will assess risk" />

      <section className="px-5">
        <div className={cn("rounded-3xl p-5 shadow-soft", meta.color)}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest opacity-80">AI risk score</p>
              <p className="text-2xl font-bold mt-1">{meta.label}</p>
              <p dir="rtl" lang="ar" className="text-xs opacity-80 mt-0.5">{meta.ar}</p>
            </div>
            <div className="relative size-20">
              <svg viewBox="0 0 36 36" className="size-20 -rotate-90">
                <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
                <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${risk === "high" ? 88 : risk === "moderate" ? 60 : 28},100`} strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xl font-bold">{risk === "high" ? "88" : risk === "moderate" ? "60" : "28"}</span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs bg-black/10 rounded-xl px-3 py-2">
            <ShieldCheck className="size-4" />
            <span>Recommended: <strong>{meta.action}</strong></span>
          </div>
        </div>
      </section>

      <section className="px-5 mt-6">
        <h2 className="text-base font-semibold mb-3">Select your symptoms</h2>
        <div className="grid grid-cols-2 gap-3">
          {symptoms.map(({ id, label, ar, icon: Icon }) => {
            const active = selected.includes(id);
            return (
              <button
                key={id}
                onClick={() => toggle(id)}
                className={cn(
                  "rounded-3xl p-4 border text-left transition-all",
                  active ? "bg-gradient-brand text-primary-foreground border-transparent shadow-soft" : "bg-card border-border"
                )}
              >
                <Icon className="size-6 mb-3" />
                <p className="font-semibold text-sm leading-tight">{label}</p>
                <p dir="rtl" lang="ar" className={cn("text-xs", active ? "opacity-80" : "text-muted-foreground")}>{ar}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="px-5 mt-6 space-y-3">
        <h2 className="text-base font-semibold">Suggested next steps</h2>
        {[
          { t: "Talk to a pharmacist", s: "Free · 24/7 chat", tone: "bg-success/30" },
          { t: "Book a doctor", s: "Telehealth in 15 min", tone: "bg-teal/20" },
          { t: "Find nearest ER", s: "1.2 km · King Fahad", tone: "bg-destructive/15" },
        ].map((c) => (
          <button key={c.t} className={cn("w-full rounded-2xl p-4 flex items-center gap-3 text-left", c.tone)}>
            <Stethoscope className="size-5" />
            <div className="flex-1">
              <p className="font-semibold text-sm">{c.t}</p>
              <p className="text-xs text-muted-foreground">{c.s}</p>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </button>
        ))}
      </section>
    </MobileShell>
  );
}
