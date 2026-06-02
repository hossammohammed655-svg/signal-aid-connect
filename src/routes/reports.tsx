import { createFileRoute } from "@tanstack/react-router";
import { MobileShell, ScreenHeader } from "@/components/MobileShell";
import { useLanguage } from "@/hooks/useLanguage";
import { Download, FileText, Share2, ChevronRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports · إشارة حياة" }] }),
  component: Reports,
});

function Reports() {
  const { t } = useLanguage();

  const timeline = [
    { dateKey: "reports.today", tKey: "reports.consult", whoKey: "reports.noor", tags: ["Atorvastatin", "Diet"] },
    { dateKey: "reports.yesterday", tKey: "reports.signSession", whoKey: "reports.drYousef", tags: [t("reports.headache"), t("reports.sleep")] },
    { dateKey: "reports.may28", tKey: "reports.emergencyTriage", whoKey: "reports.autoSos", tags: [t("reports.chestPain"), t("reports.resolved")] },
    { dateKey: "reports.may22", tKey: "reports.symptomCheck", whoKey: "reports.aiAssistant", tags: [t("reports.fever"), t("reports.lowRisk")] },
  ];

  return (
    <MobileShell>
      <ScreenHeader title={t("reports.title")} subtitle={t("reports.subtitle")} />

      <section className="px-5">
        <div className="rounded-3xl p-5 bg-gradient-brand text-primary-foreground shadow-soft relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-aurora opacity-40" />
          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest opacity-80">
                <Sparkles className="size-3" /> {t("reports.aiSummary")}
              </div>
              <p className="text-lg font-bold mt-1">{t("reports.consult")}</p>
              <p className="text-sm opacity-90 mt-1 text-balance">{t("reports.consultDesc")}</p>
            </div>
          </div>
          <div className="relative flex gap-2 mt-4">
            <button className="flex-1 h-10 rounded-xl bg-white text-primary text-sm font-semibold flex items-center justify-center gap-2"><Download className="size-4" /> {t("reports.export")}</button>
            <button className="size-10 rounded-xl glass border border-white/20 flex items-center justify-center" aria-label={t("reports.share")}><Share2 className="size-4" /></button>
          </div>
        </div>
      </section>

      <section className="px-5 mt-6">
        <h2 className="text-base font-semibold mb-3">{t("reports.history")}</h2>

        <div className="relative pl-5">
          <span className="absolute left-1.5 top-2 bottom-2 w-px bg-border" />
          <div className="space-y-4">
            {timeline.map((s) => (
              <div key={s.tKey} className="relative">
                <span className="absolute -left-[18px] top-4 size-3 rounded-full bg-gradient-brand ring-4 ring-background" />
                <div className="rounded-2xl bg-card border border-border p-4 shadow-soft">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{t(s.dateKey)}</p>
                  <div className="flex items-center justify-between mt-1">
                    <div>
                      <p className="font-semibold text-sm">{t(s.tKey)}</p>
                      <p className="text-xs text-muted-foreground">{t(s.whoKey)}</p>
                    </div>
                    <FileText className="size-4 text-muted-foreground" />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {s.tags.map((tag) => (
                      <span key={tag} className="text-[10px] px-2 py-1 rounded-full bg-secondary text-secondary-foreground">{tag}</span>
                    ))}
                  </div>
                  <button className="mt-3 text-xs text-primary font-medium flex items-center gap-1">{t("reports.viewFull")} <ChevronRight className="size-3" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MobileShell>
  );
}
