import { createFileRoute } from "@tanstack/react-router";
import { MobileShell, ScreenHeader } from "@/components/MobileShell";
import { useLanguage } from "@/hooks/useLanguage";
import { Input } from "@/components/ui/input";
import { Search, Pill, AlertTriangle, ShieldCheck, Apple, Coffee, Wine } from "lucide-react";

export const Route = createFileRoute("/drugs")({
  head: () => ({ meta: [{ title: "Drug Interactions · إشارة حياة" }] }),
  component: Drugs,
});

const interactions = [
  { foodKey: "drugs.grapefruit", icon: Apple, level: "high", noteKey: "drugs.grapefruitNote" },
  { foodKey: "drugs.coffee", icon: Coffee, level: "moderate", noteKey: "drugs.coffeeNote" },
  { foodKey: "drugs.alcohol", icon: Wine, level: "high", noteKey: "drugs.alcoholNote" },
];

const tone = {
  high: "bg-destructive/15 text-destructive border-destructive/30",
  moderate: "bg-warning/20 text-warning-foreground border-warning/40",
  low: "bg-success/25 text-success-foreground border-success/40",
} as const;

function Drugs() {
  const { t } = useLanguage();
  return (
    <MobileShell>
      <ScreenHeader title={t("drugs.title")} subtitle={t("drugs.subtitle")} />

      <section className="px-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input defaultValue={t("drugs.search")} className="h-14 pl-11 rounded-2xl bg-secondary border-0 font-medium" />
        </div>
      </section>

      <section className="px-5 mt-5">
        <div className="rounded-3xl p-5 bg-gradient-card border border-border shadow-soft">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center">
              <Pill className="size-6" />
            </div>
            <div>
              <p className="font-semibold">{t("drugs.drugName")}</p>
              <p className="text-xs text-muted-foreground">{t("drugs.drugType")}</p>
            </div>
            <span className="ml-auto text-[10px] uppercase tracking-widest text-success font-semibold">{t("drugs.verified")}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-3">{t("drugs.drugDesc")}</p>
        </div>
      </section>

      <section className="px-5 mt-6">
        <h2 className="text-base font-semibold mb-3">{t("drugs.foodInteractions")}</h2>
        <div className="space-y-3">
          {interactions.map(({ foodKey, icon: Icon, level, noteKey }) => (
            <div key={foodKey} className={`rounded-2xl p-4 border flex items-start gap-3 ${tone[level as keyof typeof tone]}`}>
              <div className="size-10 rounded-xl bg-background/60 flex items-center justify-center">
                <Icon className="size-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">{t(foodKey)}</p>
                  <span className="text-[10px] uppercase tracking-widest font-bold opacity-80">{level}</span>
                </div>
                <p className="text-xs mt-0.5 opacity-90">{t(noteKey)}</p>
              </div>
              <AlertTriangle className="size-4 opacity-70" />
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 mt-6">
        <h2 className="text-base font-semibold mb-3">{t("drugs.safe")}</h2>
        <div className="rounded-2xl p-4 bg-success/20 border border-success/40 flex items-center gap-3">
          <ShieldCheck className="size-5 text-success-foreground" />
          <p className="text-sm">{t("drugs.safeNote")}</p>
        </div>
      </section>
    </MobileShell>
  );
}
