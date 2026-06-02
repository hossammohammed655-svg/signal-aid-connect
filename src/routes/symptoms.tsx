import { createFileRoute } from "@tanstack/react-router";
import { MobileShell, ScreenHeader } from "@/components/MobileShell";
import { useLanguage } from "@/hooks/useLanguage";
import { useState } from "react";
import { Thermometer, HeartPulse, Brain, Wind, Stethoscope, AlertTriangle, ShieldCheck, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/symptoms")({
  head: () => ({ meta: [{ title: "Symptom Checker · إشارة حياة" }] }),
  component: Symptoms,
});

const symptomList = [
  { id: "fever", key: "symptoms.fever", icon: Thermometer },
  { id: "chest", key: "symptoms.chestPain", icon: HeartPulse },
  { id: "headache", key: "symptoms.headache", icon: Brain },
  { id: "breath", key: "symptoms.breath", icon: Wind },
  { id: "cough", key: "symptoms.cough", icon: Stethoscope },
  { id: "dizzy", key: "symptoms.dizzy", icon: AlertTriangle },
];

function Symptoms() {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<string[]>(["fever", "chest"]);
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const risk = selected.includes("chest") || selected.includes("breath") ? "high" : selected.length >= 2 ? "moderate" : "low";
  const meta = {
    low: { color: "bg-success text-success-foreground", labelKey: "symptoms.low", actionKey: "symptoms.visitPharmacist" },
    moderate: { color: "bg-warning text-warning-foreground", labelKey: "symptoms.moderate", actionKey: "symptoms.consultDoctor" },
    high: { color: "bg-destructive text-destructive-foreground", labelKey: "symptoms.high", actionKey: "symptoms.goER" },
  }[risk];

  return (
    <MobileShell>
      <ScreenHeader title={t("symptoms.title")} subtitle={t("symptoms.subtitle")} />

      <section className="px-5">
        <div className={cn("rounded-3xl p-5 shadow-soft", meta.color)}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest opacity-80">{t("symptoms.aiScore")}</p>
              <p className="text-2xl font-bold mt-1">{t(meta.labelKey)}</p>
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
            <span>{t("symptoms.recommended")} <strong>{t(meta.actionKey)}</strong></span>
          </div>
        </div>
      </section>

      <section className="px-5 mt-6">
        <h2 className="text-base font-semibold mb-3">{t("symptoms.select")}</h2>
        <div className="grid grid-cols-2 gap-3">
          {symptomList.map(({ id, key, icon: Icon }) => {
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
                <p className="font-semibold text-sm leading-tight">{t(key)}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="px-5 mt-6 space-y-3">
        <h2 className="text-base font-semibold">{t("symptoms.nextSteps")}</h2>
        {[
          { tKey: "symptoms.talkPharmacist", sKey: "symptoms.free247", tone: "bg-success/30" },
          { tKey: "symptoms.bookDoctor", sKey: "symptoms.telehealth", tone: "bg-teal/20" },
          { tKey: "symptoms.findER", sKey: "symptoms.erLocation", tone: "bg-destructive/15" },
        ].map((c) => (
          <button key={c.tKey} className={cn("w-full rounded-2xl p-4 flex items-center gap-3 text-left", c.tone)}>
            <Stethoscope className="size-5" />
            <div className="flex-1">
              <p className="font-semibold text-sm">{t(c.tKey)}</p>
              <p className="text-xs text-muted-foreground">{t(c.sKey)}</p>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </button>
        ))}
      </section>
    </MobileShell>
  );
}
