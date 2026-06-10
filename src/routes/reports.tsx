import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileShell, ScreenHeader } from "@/components/MobileShell";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Download, FileText, ChevronDown, ChevronUp, Loader2, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports · إشارة حياة" }] }),
  component: Reports,
});

type Session = {
  id: string;
  symptoms: string[];
  risk_level: "LOW" | "MODERATE" | "EMERGENCY";
  explanation_ar: string;
  explanation_en: string;
  recommendation: string;
  created_at: string;
};

const RISK_DOT: Record<string, string> = {
  LOW: "bg-success",
  MODERATE: "bg-warning",
  EMERGENCY: "bg-destructive",
};

const RISK_BG: Record<string, string> = {
  LOW: "bg-success/10 border-success/30",
  MODERATE: "bg-warning/10 border-warning/30",
  EMERGENCY: "bg-destructive/10 border-destructive/30",
};

function Reports() {
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const { data, error } = await supabase
        .from("symptom_sessions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) console.error(error);
      setSessions((data as Session[]) ?? []);
    })();
  }, [user]);

  const exportPdf = () => {
    if (!sessions) return;
    const doc = new jsPDF();
    const name = profile?.full_name || user?.email || "User";
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;

    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Isharet Hayah / اشارة حياة", pageWidth / 2, 18, { align: "center" });
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Signs of Life Health Report", pageWidth / 2, 26, { align: "center" });

    let y = 38;
    doc.setFontSize(10);
    doc.text(`${t("reports3.user")} / User: ${name}`, margin, y); y += 6;
    doc.text(`${t("reports3.exportedAt")} / Export date: ${new Date().toLocaleString()}`, margin, y); y += 10;

    doc.setFont("helvetica", "bold");
    doc.setFillColor(15, 23, 42);
    doc.setTextColor(255, 255, 255);
    doc.rect(margin, y - 5, pageWidth - margin * 2, 8, "F");
    doc.text(`${t("reports3.colDate")}`, margin + 2, y);
    doc.text(`${t("reports3.colSymptoms")}`, 52, y);
    doc.text(`${t("reports3.colRisk")}`, 120, y);
    doc.text(`${t("reports3.colRec")}`, 145, y);
    y += 6;
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "normal");

    sessions.forEach((s) => {
      if (y > 265) { doc.addPage(); y = 20; }
      const date = new Date(s.created_at).toLocaleDateString();
      const syms = s.symptoms.join(", ");
      const rec = t(`sym.rec.${s.recommendation}`) || s.recommendation;
      const symLines = doc.splitTextToSize(syms, 62);
      const recLines = doc.splitTextToSize(rec, 48);
      const rows = Math.max(symLines.length, recLines.length, 1);
      doc.text(date, margin + 2, y);
      doc.text(symLines, 52, y);
      doc.text(s.risk_level, 120, y);
      doc.text(recLines, 145, y);
      y += rows * 5 + 4;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y - 2, pageWidth - margin, y - 2);
    });

    if (y > 250) { doc.addPage(); y = 20; } else { y += 12; }
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    const disclaimerEn =
      "This report is AI-generated and is not a substitute for professional medical advice. Always consult a qualified healthcare provider.";
    const disclaimerAr =
      "هذا التقرير مُولَّد بالذكاء الاصطناعي وليس بديلاً عن الاستشارة الطبية المتخصصة. استشر دائماً مقدم رعاية صحية مؤهل.";
    doc.text(doc.splitTextToSize(`EN: ${disclaimerEn}`, pageWidth - margin * 2), margin, y);
    y += doc.splitTextToSize(`EN: ${disclaimerEn}`, pageWidth - margin * 2).length * 4 + 4;
    doc.text(doc.splitTextToSize(`AR: ${disclaimerAr}`, pageWidth - margin * 2), margin, y);

    doc.save(`isharet-hayah-report-${Date.now()}.pdf`);
  };


  return (
    <MobileShell>
      <ScreenHeader title={t("reports2.title")} subtitle={t("reports2.subtitle")} />

      <section className="px-5">
        <button
          onClick={exportPdf}
          disabled={!sessions || sessions.length === 0}
          className="w-full rounded-2xl bg-gradient-brand text-primary-foreground py-3.5 flex items-center justify-center gap-2 shadow-soft font-semibold disabled:opacity-50"
        >
          <Download className="size-4" /> {t("reports2.export")} · تصدير PDF
        </button>
      </section>

      <section className="px-5 mt-6">
        {sessions === null ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="size-5 animate-spin me-2" /> {t("reports2.loading")}
          </div>
        ) : sessions.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-8 text-center space-y-3 animate-fade-in">
            <div className="mx-auto size-14 rounded-2xl bg-secondary flex items-center justify-center">
              <Inbox className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">{t("reports2.empty")}</p>
            <p dir="rtl" className="text-sm text-muted-foreground">لا توجد جلسات بعد. ابدأ بفحص الأعراض.</p>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in">
            {sessions.map((s) => {
              const isOpen = expanded === s.id;
              return (
                <div
                  key={s.id}
                  className={cn("rounded-2xl border shadow-soft overflow-hidden", RISK_BG[s.risk_level])}
                >
                  <button
                    onClick={() => setExpanded(isOpen ? null : s.id)}
                    className="w-full p-4 flex items-start gap-3 text-left"
                  >
                    <span className={cn("mt-1 size-3 rounded-full shrink-0", RISK_DOT[s.risk_level])} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        {new Date(s.created_at).toLocaleString()}
                      </p>
                      <p className="font-semibold text-sm mt-0.5 truncate">
                        {t(`sym.risk.${s.risk_level}`)} · {s.symptoms.slice(0, 3).join(", ")}
                        {s.symptoms.length > 3 ? "…" : ""}
                      </p>
                    </div>
                    {isOpen ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 space-y-3 text-sm border-t border-border/40 pt-3 animate-fade-in">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{t("reports2.symptoms")}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {s.symptoms.map((sym) => (
                            <span key={sym} className="text-[11px] px-2 py-1 rounded-full bg-background border border-border">{sym}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{t("reports2.explanation")}</p>
                        <p dir="rtl" className="text-right leading-relaxed">{s.explanation_ar}</p>
                        <p dir="ltr" className="text-left leading-relaxed mt-1">{s.explanation_en}</p>
                      </div>
                      <div className="rounded-xl bg-background/60 border border-border/40 p-3 flex items-center gap-2">
                        <FileText className="size-4 text-primary" />
                        <p className="text-sm font-semibold">{t(`sym.rec.${s.recommendation}`) || s.recommendation}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </MobileShell>
  );
}
