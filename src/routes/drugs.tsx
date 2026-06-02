import { createFileRoute } from "@tanstack/react-router";
import { MobileShell, ScreenHeader } from "@/components/MobileShell";
import { Input } from "@/components/ui/input";
import { Search, Pill, AlertTriangle, ShieldCheck, Apple, Coffee, Wine } from "lucide-react";

export const Route = createFileRoute("/drugs")({
  head: () => ({ meta: [{ title: "Drug Interactions · إشارة حياة" }] }),
  component: Drugs,
});

const interactions = [
  { food: "Grapefruit", icon: Apple, level: "high", note: "Increases drug concentration · risk of overdose" },
  { food: "Coffee / Caffeine", icon: Coffee, level: "moderate", note: "May reduce absorption · take 2 hours apart" },
  { food: "Alcohol", icon: Wine, level: "high", note: "Severe liver toxicity risk · avoid completely" },
];

const tone = {
  high: "bg-destructive/15 text-destructive border-destructive/30",
  moderate: "bg-warning/20 text-warning-foreground border-warning/40",
  low: "bg-success/25 text-success-foreground border-success/40",
} as const;

function Drugs() {
  return (
    <MobileShell>
      <ScreenHeader title="Drug & Food" subtitle="Check interactions before you take it" />

      <section className="px-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input defaultValue="Atorvastatin 20mg" className="h-14 pl-11 rounded-2xl bg-secondary border-0 font-medium" />
        </div>
      </section>

      <section className="px-5 mt-5">
        <div className="rounded-3xl p-5 bg-gradient-card border border-border shadow-soft">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center">
              <Pill className="size-6" />
            </div>
            <div>
              <p className="font-semibold">Atorvastatin · 20mg</p>
              <p className="text-xs text-muted-foreground">Statin · Cholesterol</p>
            </div>
            <span className="ml-auto text-[10px] uppercase tracking-widest text-success font-semibold">Verified</span>
          </div>
          <p className="text-sm text-muted-foreground mt-3">Lowers LDL cholesterol. Take once daily in the evening with water.</p>
        </div>
      </section>

      <section className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">Food interactions</h2>
          <span dir="rtl" lang="ar" className="text-xs text-muted-foreground">تداخلات غذائية</span>
        </div>
        <div className="space-y-3">
          {interactions.map(({ food, icon: Icon, level, note }) => (
            <div key={food} className={`rounded-2xl p-4 border flex items-start gap-3 ${tone[level as keyof typeof tone]}`}>
              <div className="size-10 rounded-xl bg-background/60 flex items-center justify-center">
                <Icon className="size-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">{food}</p>
                  <span className="text-[10px] uppercase tracking-widest font-bold opacity-80">{level}</span>
                </div>
                <p className="text-xs mt-0.5 opacity-90">{note}</p>
              </div>
              <AlertTriangle className="size-4 opacity-70" />
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 mt-6">
        <h2 className="text-base font-semibold mb-3">Safe to combine</h2>
        <div className="rounded-2xl p-4 bg-success/20 border border-success/40 flex items-center gap-3">
          <ShieldCheck className="size-5 text-success-foreground" />
          <p className="text-sm">Vitamin D, paracetamol, most leafy greens — no known interactions.</p>
        </div>
      </section>
    </MobileShell>
  );
}
