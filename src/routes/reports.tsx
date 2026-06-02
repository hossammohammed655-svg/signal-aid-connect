import { createFileRoute } from "@tanstack/react-router";
import { MobileShell, ScreenHeader } from "@/components/MobileShell";
import { Download, FileText, Share2, ChevronRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports · إشارة حياة" }] }),
  component: Reports,
});

const timeline = [
  { date: "Today", t: "Pharmacy consultation", who: "Pharmacist Noor", tags: ["Atorvastatin", "Diet"] },
  { date: "Yesterday", t: "Sign language session", who: "Dr. Yousef", tags: ["Headache", "Sleep"] },
  { date: "May 28", t: "Emergency triage", who: "Auto · SOS", tags: ["Chest pain", "Resolved"] },
  { date: "May 22", t: "Symptom check", who: "AI assistant", tags: ["Fever", "Low risk"] },
];

function Reports() {
  return (
    <MobileShell>
      <ScreenHeader title="Reports" subtitle="Auto-generated medical summaries" />

      <section className="px-5">
        <div className="rounded-3xl p-5 bg-gradient-brand text-primary-foreground shadow-soft relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-aurora opacity-40" />
          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest opacity-80">
                <Sparkles className="size-3" /> AI Summary · Today
              </div>
              <p className="text-lg font-bold mt-1">Pharmacy consultation</p>
              <p className="text-sm opacity-90 mt-1 text-balance">Discussed evening dosage of Atorvastatin. Advised to avoid grapefruit. Patient reported mild muscle aches — monitor for 7 days.</p>
            </div>
          </div>
          <div className="relative flex gap-2 mt-4">
            <button className="flex-1 h-10 rounded-xl bg-white text-primary text-sm font-semibold flex items-center justify-center gap-2"><Download className="size-4" /> Export PDF</button>
            <button className="size-10 rounded-xl glass border border-white/20 flex items-center justify-center" aria-label="Share"><Share2 className="size-4" /></button>
          </div>
        </div>
      </section>

      <section className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">Session history</h2>
          <span dir="rtl" lang="ar" className="text-xs text-muted-foreground">السجل الطبي</span>
        </div>

        <div className="relative pl-5">
          <span className="absolute left-1.5 top-2 bottom-2 w-px bg-border" />
          <div className="space-y-4">
            {timeline.map((s) => (
              <div key={s.t} className="relative">
                <span className="absolute -left-[18px] top-4 size-3 rounded-full bg-gradient-brand ring-4 ring-background" />
                <div className="rounded-2xl bg-card border border-border p-4 shadow-soft">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.date}</p>
                  <div className="flex items-center justify-between mt-1">
                    <div>
                      <p className="font-semibold text-sm">{s.t}</p>
                      <p className="text-xs text-muted-foreground">{s.who}</p>
                    </div>
                    <FileText className="size-4 text-muted-foreground" />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {s.tags.map((t) => (
                      <span key={t} className="text-[10px] px-2 py-1 rounded-full bg-secondary text-secondary-foreground">{t}</span>
                    ))}
                  </div>
                  <button className="mt-3 text-xs text-primary font-medium flex items-center gap-1">View full report <ChevronRight className="size-3" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MobileShell>
  );
}
