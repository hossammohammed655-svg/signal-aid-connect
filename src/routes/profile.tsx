import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Globe, Moon, ShieldCheck, HeartPulse, ChevronRight, Settings, LogOut, Accessibility } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile · إشارة حياة" }] }),
  component: Profile,
});

function Profile() {
  const { t, lang, setLang, isRTL } = useLanguage();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  const stats = [
    { l: t("profile.sessions"), v: "24" },
    { l: t("profile.reports"), v: "12" },
    { l: t("profile.saved"), v: "8" },
  ];

  const careItems = [
    { icon: HeartPulse, label: t("profile.medical"), sub: t("profile.conditions") },
    { icon: ShieldCheck, label: t("profile.emergency"), sub: t("profile.3people") },
    { icon: Accessibility, label: t("profile.accessibility"), sub: t("profile.signCaptions") },
  ];

  const prefItems = [
    { icon: Globe, label: t("profile.language"), sub: isRTL ? t("profile.arabic") : t("profile.english"), onClick: () => setLang(isRTL ? "en" : "ar") },
    { icon: Moon, label: t("profile.appearance"), sub: t("profile.system") },
    { icon: Bell, label: t("profile.notifications"), sub: t("profile.on") },
  ];

  return (
    <MobileShell>
      <div className="bg-gradient-brand text-primary-foreground rounded-b-[2rem] px-5 pt-12 pb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-aurora opacity-40" />
        <div className="relative flex items-center justify-between">
          <h1 className="text-xl font-bold">{t("profile.title")}</h1>
          <Link to="/login" className="size-10 rounded-full glass border border-white/20 flex items-center justify-center" aria-label={t("profile.settings")}><Settings className="size-5" /></Link>
        </div>
        <div className="relative mt-5 flex items-center gap-4">
          <div className="relative">
            <div className="size-20 rounded-3xl bg-white/20 border border-white/30 flex items-center justify-center text-2xl font-bold">L</div>
            <span className="absolute -bottom-1 -right-1 size-6 rounded-full bg-success border-2 border-background flex items-center justify-center text-[10px] font-bold text-success-foreground">✓</span>
          </div>
          <div>
            <p className="text-xl font-bold">{t("profile.name")}</p>
            <p className="text-sm text-primary-foreground/80">{t("profile.email")}</p>
            <p className="text-xs text-primary-foreground/70 mt-0.5">{t("profile.memberSince")}</p>
          </div>
        </div>
        <div className="relative mt-5 grid grid-cols-3 gap-2">
          {stats.map((s) => (
            <div key={s.l} className="glass border border-white/20 rounded-2xl py-3 text-center">
              <p className="text-lg font-bold">{s.v}</p>
              <p className="text-[10px] uppercase tracking-widest opacity-80">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      <section className="px-5 mt-6 space-y-6">
        <div>
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-2 px-1">{t("profile.care")}</h2>
          <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-soft">
            {careItems.map(({ icon: Icon, label, sub }, i) => (
              <button key={label} className={`w-full flex items-center gap-3 p-4 text-left ${i > 0 ? "border-t border-border" : ""}`}>
                <div className="size-10 rounded-xl bg-secondary text-primary flex items-center justify-center">
                  <Icon className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-2 px-1">{t("profile.preferences")}</h2>
          <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-soft">
            {prefItems.map(({ icon: Icon, label, sub, onClick }, i) => (
              <button key={label} onClick={onClick} className={`w-full flex items-center gap-3 p-4 text-left ${i > 0 ? "border-t border-border" : ""}`}>
                <div className="size-10 rounded-xl bg-secondary text-primary flex items-center justify-center">
                  <Icon className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>

        <button className="w-full rounded-2xl py-4 flex items-center justify-center gap-2 text-destructive font-semibold border border-destructive/30 bg-destructive/5">
          <LogOut className="size-4" /> {t("profile.signout")}
        </button>
      </section>
    </MobileShell>
  );
}
