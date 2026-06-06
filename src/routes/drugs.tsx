import { createFileRoute } from "@tanstack/react-router";
import { MobileShell, ScreenHeader } from "@/components/MobileShell";
import { useLanguage } from "@/hooks/useLanguage";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Search, Pill, ShieldCheck, AlertTriangle, AlertOctagon, Clock, Loader2, Sparkles, Utensils, FlaskConical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { checkDrugInteractions, type DrugCheckResult, type InteractionItem } from "@/lib/drug-check.functions";

export const Route = createFileRoute("/drugs")({
  head: () => ({ meta: [{ title: "Drug Interactions · إشارة حياة" }] }),
  component: Drugs,
});

const COMMON_MEDS = [
  "Paracetamol", "Ibuprofen", "Aspirin", "Amoxicillin", "Metformin",
  "Atorvastatin", "Lisinopril", "Omeprazole", "Warfarin", "Simvastatin",
  "Levothyroxine", "Ciprofloxacin", "Azithromycin", "Loratadine", "Sertraline",
];

const LEVEL_STYLE: Record<InteractionItem["level"], { card: string; dot: string; Icon: typeof AlertOctagon }> = {
  DANGER: {
    card: "bg-destructive/10 border-destructive/40 text-foreground",
    dot: "bg-destructive text-destructive-foreground",
    Icon: AlertOctagon,
  },
  CAUTION: {
    card: "bg-warning/10 border-warning/40 text-foreground",
    dot: "bg-warning text-warning-foreground",
    Icon: AlertTriangle,
  },
  SAFE: {
    card: "bg-success/10 border-success/40 text-foreground",
    dot: "bg-success text-success-foreground",
    Icon: ShieldCheck,
  },
};

function Drugs() {
  const { t, isRTL } = useLanguage();
  const check = useServerFn(checkDrugInteractions);

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DrugCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMMON_MEDS.slice(0, 8);
    return COMMON_MEDS.filter((m) => m.toLowerCase().includes(q)).slice(0, 8);
  }, [query]);

  const runCheck = async (med: string) => {
    setSelected(med);
    setQuery(med);
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const r = await check({ data: { medication: med } });
      setResult(r);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : t("drugs2.error"));
    } finally {
      setLoading(false);
    }
  };

  const food = result?.interactions.filter((i) => i.category === "food") ?? [];
  const drugs = result?.interactions.filter((i) => i.category === "drug") ?? [];

  return (
    <MobileShell>
      <ScreenHeader title={t("drugs2.title")} subtitle={t("drugs2.subtitle")} />

      <section className="px-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("drugs2.search")}
            className="pl-9 rounded-2xl h-12 bg-card border-border"
          />
        </div>

        <div className="mt-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{t("drugs2.suggestions")}</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((m) => {
              const active = selected === m;
              return (
                <button
                  key={m}
                  onClick={() => runCheck(m)}
                  className={cn(
                    "px-3 py-2 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5",
                    active
                      ? "bg-gradient-brand text-primary-foreground border-transparent shadow-soft"
                      : "bg-card border-border hover:border-primary/40"
                  )}
                >
                  <Pill className="size-3.5" />
                  {m}
                </button>
              );
            })}
          </div>
        </div>

        {query.trim() && !suggestions.includes(query.trim()) && (
          <button
            onClick={() => runCheck(query.trim())}
            disabled={loading}
            className="mt-4 w-full rounded-2xl bg-gradient-brand text-primary-foreground font-semibold py-3.5 flex items-center justify-center gap-2 shadow-soft disabled:opacity-70"
          >
            <Sparkles className="size-5" />
            {t("drugs2.check")} · {query.trim()}
          </button>
        )}
      </section>

      {loading && (
        <div className="px-5 mt-8 flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-6 animate-spin text-primary" />
          <p className="text-sm">{t("drugs2.checking")}</p>
        </div>
      )}

      {error && !loading && (
        <p className="px-5 mt-6 text-sm text-destructive text-center">{error}</p>
      )}

      {!loading && !result && !error && (
        <p className={cn("px-5 mt-6 text-sm text-muted-foreground", isRTL ? "text-right" : "text-left")}>
          {t("drugs2.empty")}
        </p>
      )}

      {result && !loading && (
        <section className="px-5 mt-6 space-y-5">
          {/* Timing */}
          <div className="rounded-3xl border border-border/60 bg-gradient-brand text-primary-foreground p-5 shadow-soft">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-80">
              <Clock className="size-4" /> {t("drugs2.timing")}
            </div>
            <p className="mt-2 font-bold text-lg">{result.medication}</p>
            <div className="mt-3 space-y-2 text-sm">
              <p dir="rtl" className="text-right leading-relaxed">{result.timing_ar}</p>
              <p dir="ltr" className="text-left leading-relaxed opacity-90">{result.timing_en}</p>
            </div>
          </div>

          {food.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2 text-base font-semibold mb-3">
                <Utensils className="size-4" /> {t("drugs2.foodInter")}
              </h2>
              <div className="space-y-3">
                {food.map((i, idx) => <InteractionCard key={`f-${idx}`} item={i} t={t} />)}
              </div>
            </div>
          )}

          {drugs.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2 text-base font-semibold mb-3">
                <FlaskConical className="size-4" /> {t("drugs2.drugInter")}
              </h2>
              <div className="space-y-3">
                {drugs.map((i, idx) => <InteractionCard key={`d-${idx}`} item={i} t={t} />)}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-border/60 bg-muted/40 p-4 text-xs text-muted-foreground space-y-1.5">
            <p dir="rtl" className="text-right">استشر طبيبك أو صيدلانيك قبل تناول أي دواء</p>
            <p dir="ltr" className="text-left">Consult your doctor or pharmacist before taking any medication</p>
          </div>
        </section>
      )}
    </MobileShell>
  );
}

function InteractionCard({ item, t }: { item: InteractionItem; t: (k: string) => string }) {
  const s = LEVEL_STYLE[item.level];
  const { Icon } = s;
  return (
    <div className={cn("rounded-3xl border p-4 shadow-soft", s.card)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="font-bold text-base leading-tight">{item.name_en}</p>
          <p dir="rtl" className="text-sm opacity-80 mt-0.5 text-right">{item.name_ar}</p>
        </div>
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold", s.dot)}>
          <Icon className="size-3" />
          {t(`drugs2.level.${item.level}`)}
        </span>
      </div>

      <div className="mt-3 space-y-2 text-sm">
        <p dir="rtl" className="text-right leading-relaxed">{item.reason_ar}</p>
        <p dir="ltr" className="text-left leading-relaxed opacity-90">{item.reason_en}</p>
      </div>

      <div className="mt-3 rounded-2xl bg-background/60 border border-border/40 p-3">
        <p className="text-[11px] uppercase tracking-wider opacity-70 mb-1">{t("drugs2.advice")}</p>
        <p dir="rtl" className="text-right text-sm">{item.advice_ar}</p>
        <p dir="ltr" className="text-left text-sm opacity-90 mt-0.5">{item.advice_en}</p>
      </div>
    </div>
  );
}
