import { createFileRoute } from "@tanstack/react-router";
import { MobileShell, ScreenHeader } from "@/components/MobileShell";
import { useLanguage } from "@/hooks/useLanguage";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Thermometer, HeartPulse, Brain, Wind, Stethoscope, AlertTriangle,
  Activity, Eye, Pill, Soup, Ear, Sparkles, ShieldCheck, Loader2, RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { checkSymptoms, type SymptomResult } from "@/lib/symptom-check.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/symptoms")({
  head: () => ({ meta: [{ title: "Symptom Checker · إشارة حياة" }] }),
  component: Symptoms,
});


const SYMPTOMS = [
  { id: "headache", labelKey: "sym.s.headache", icon: Brain, value: "headache" },
  { id: "fever", labelKey: "sym.s.fever", icon: Thermometer, value: "fever" },
  { id: "chestPain", labelKey: "sym.s.chestPain", icon: HeartPulse, value: "chest pain" },
  { id: "breath", labelKey: "sym.s.breath", icon: Wind, value: "shortness of breath" },
  { id: "nausea", labelKey: "sym.s.nausea", icon: Soup, value: "nausea" },
  { id: "dizziness", labelKey: "sym.s.dizziness", icon: AlertTriangle, value: "dizziness" },
  { id: "stomach", labelKey: "sym.s.stomach", icon: Pill, value: "stomach pain" },
  { id: "back", labelKey: "sym.s.back", icon: Activity, value: "back pain" },
  { id: "fatigue", labelKey: "sym.s.fatigue", icon: Sparkles, value: "fatigue" },
  { id: "throat", labelKey: "sym.s.throat", icon: Ear, value: "sore throat" },
  { id: "cough", labelKey: "sym.s.cough", icon: Stethoscope, value: "cough" },
  { id: "vision", labelKey: "sym.s.vision", icon: Eye, value: "blurred vision" },
];

const RISK_STYLES: Record<SymptomResult["risk_level"], string> = {
  LOW: "bg-success/15 border-success/40 text-success-foreground",
  MODERATE: "bg-warning/15 border-warning/40 text-warning-foreground",
  EMERGENCY: "bg-destructive/15 border-destructive/50 text-destructive-foreground",
};

const RISK_DOT: Record<SymptomResult["risk_level"], string> = {
  LOW: "bg-success",
  MODERATE: "bg-warning",
  EMERGENCY: "bg-destructive",
};

function Symptoms() {
  const { t, isRTL } = useLanguage();
  const check = useServerFn(checkSymptoms);

  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SymptomResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const onCheck = async () => {
    setError(null);
    setResult(null);
    if (selected.length === 0) {
      setError(t("sym.empty"));
      return;
    }
    setLoading(true);
    try {
      const values = SYMPTOMS.filter((s) => selected.includes(s.id)).map((s) => s.value);
      const r = await check({ data: { symptoms: values } });
      setResult(r);
      // Save session to database
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        await supabase.from("symptom_sessions").insert({
          user_id: userData.user.id,
          symptoms: values,
          risk_level: r.risk_level,
          explanation_ar: r.explanation_ar,
          explanation_en: r.explanation_en,
          recommendation: r.recommendation,
        });
      }
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : t("sym.error"));
    } finally {
      setLoading(false);
    }
  };


  const onClear = () => {
    setSelected([]);
    setResult(null);
    setError(null);
  };

  return (
    <MobileShell>
      <ScreenHeader title={t("sym.title")} subtitle={t("sym.subtitle")} />

      <section className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">{t("sym.select")}</h2>
          {selected.length > 0 && (
            <button
              onClick={onClear}
              className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground"
            >
              <RotateCcw className="size-3" /> {t("sym.clear")}
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {SYMPTOMS.map(({ id, labelKey, icon: Icon }) => {
            const active = selected.includes(id);
            return (
              <button
                key={id}
                onClick={() => toggle(id)}
                className={cn(
                  "rounded-3xl p-4 border text-left transition-all",
                  active
                    ? "bg-gradient-brand text-primary-foreground border-transparent shadow-soft"
                    : "bg-card border-border hover:border-primary/40"
                )}
              >
                <Icon className="size-6 mb-3" />
                <p className="font-semibold text-sm leading-tight">{t(labelKey)}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="px-5 mt-6">
        <button
          onClick={onCheck}
          disabled={loading}
          className="w-full rounded-2xl bg-gradient-brand text-primary-foreground font-semibold py-4 flex items-center justify-center gap-2 shadow-soft disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              {t("sym.checking")}
            </>
          ) : (
            <>
              <Sparkles className="size-5" />
              {t("sym.check")} · فحص الأعراض
            </>
          )}
        </button>
        {error && (
          <p className="mt-3 text-sm text-destructive text-center">{error}</p>
        )}
      </section>

      {result && (
        <section className="px-5 mt-6 space-y-4">
          <div className={cn("rounded-3xl border p-5 shadow-soft", RISK_STYLES[result.risk_level])}>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-80">
              <span className={cn("size-2 rounded-full", RISK_DOT[result.risk_level])} />
              {t("sym.result")}
            </div>
            <div className="mt-2 flex items-baseline justify-between gap-3">
              <p className="text-2xl font-bold">{t(`sym.risk.${result.risk_level}`)}</p>
              <p className="text-sm opacity-80">{t("sym.risk")}</p>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <p dir="rtl" className="text-right leading-relaxed">{result.explanation_ar}</p>
              <p dir="ltr" className="text-left leading-relaxed">{result.explanation_en}</p>
            </div>

            <div className="mt-4 rounded-2xl bg-background/40 border border-border/40 p-3 flex items-center gap-3">
              <ShieldCheck className="size-5 shrink-0" />
              <div className="flex-1">
                <p className="text-[11px] uppercase tracking-wider opacity-70">{t("sym.recommendation")}</p>
                <p className="font-semibold text-sm">{t(`sym.rec.${result.recommendation}`)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-muted/40 p-4 text-xs text-muted-foreground space-y-1.5">
            <p dir="rtl" className="text-right">هذا ليس بديلاً عن الاستشارة الطبية المتخصصة</p>
            <p dir="ltr" className="text-left">This is not a substitute for professional medical advice</p>
          </div>
        </section>
      )}

      {!result && !loading && (
        <p className={cn("px-5 mt-6 text-[11px] text-muted-foreground", isRTL ? "text-right" : "text-left")}>
          {t("sym.disclaimer")}
        </p>
      )}
    </MobileShell>
  );
}
