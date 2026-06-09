import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { useLanguage } from "@/hooks/useLanguage";
import { BrandMark } from "@/components/BrandLogo";
import { User, Award } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About · إشارة حياة" }] }),
  component: About,
});

const teamMembers = [
  "Israa Mohamed Abdelhakiem",
  "Islam Samy Hamed",
  "Islam Hatem Ahmed",
  "Kerollos Magdy Romany",
  "Mahmoud Ramadan Ali",
  "Mariam Mageid Sedrak",
  "Mahmoud Moustafa Aly",
  "Heba Allah Karam Kamal",
  "Kareem Samir Elkasrawy",
  "Marina Talaat Rashed",
  "Mario Medhat Girgis",
];

function About() {
  const { t, isRTL } = useLanguage();

  return (
    <MobileShell>
      <div className="px-5 pt-12 pb-6 text-center">
        <BrandMark className="mx-auto size-24 mb-4" />
        <h1 className="text-3xl font-bold text-teal tracking-tight">
          {isRTL ? "إشارة حياة" : "Sign of Life"}
          <span className="mx-2 opacity-50">/</span>
          {isRTL ? "Sign of Life" : "إشارة حياة"}
        </h1>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2 leading-relaxed">
          {t("about.description")}
        </p>
      </div>

      {/* Supervisor */}
      <section className="px-5 mt-4">
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-3 px-1">
          {t("about.supervisorTitle")}
        </h2>
        <div className="rounded-3xl p-5 flex items-center gap-4 border border-yellow-500/30 bg-gradient-to-r from-yellow-500/15 to-amber-500/15">
          <div className="size-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white shadow-lg shrink-0">
            <Award className="size-7" />
          </div>
          <div>
            <p className="text-base font-bold text-foreground">{t("about.supervisorName")}</p>
            <div className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30">
              <span className="size-1.5 rounded-full bg-yellow-500" />
              <span className="text-[11px] font-semibold text-yellow-600 dark:text-yellow-400">{t("about.supervisorBadge")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Team Members */}
      <section className="px-5 mt-6">
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-3 px-1">
          {t("about.teamTitle")}
        </h2>
        <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-soft">
          {teamMembers.map((name, i) => (
            <div key={name} className={`flex items-center gap-3 p-4 ${i > 0 ? "border-t border-border" : ""}`}>
              <div className="size-10 rounded-xl bg-secondary text-primary flex items-center justify-center shrink-0">
                <User className="size-5" />
              </div>
              <p className="text-sm font-semibold text-foreground">{name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* App Info */}
      <section className="px-5 mt-6 pb-10">
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-3 px-1">
          {t("about.infoTitle")}
        </h2>
        <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-soft">
          <div className="flex items-center justify-between p-4">
            <p className="text-sm text-muted-foreground">{t("about.version")}</p>
            <p className="text-sm font-semibold text-foreground">1.0.0</p>
          </div>
          <div className="border-t border-border flex items-center justify-between p-4">
            <p className="text-sm text-muted-foreground">{t("about.platform")}</p>
            <p className="text-sm font-semibold text-foreground">Android + Web</p>
          </div>
          <div className="border-t border-border flex items-center justify-between p-4">
            <p className="text-sm text-muted-foreground">{t("about.builtWith")}</p>
            <p className="text-sm font-semibold text-foreground">React, Supabase, Lovable AI</p>
          </div>
        </div>
      </section>
    </MobileShell>
  );
}
