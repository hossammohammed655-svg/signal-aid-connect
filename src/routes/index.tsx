import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { BrandMark, BrandName } from "@/components/BrandLogo";
import { useLanguage } from "@/hooks/useLanguage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "إشارة حياة · Signs of Life" },
      { name: "description", content: "AI-powered patient–pharmacist communication for deaf and speech-impaired users." },
    ],
  }),
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => navigate({ to: "/login" }), 2800);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-dvh w-full flex justify-center bg-muted/40">
      <div className="relative w-full max-w-[440px] min-h-dvh bg-gradient-brand overflow-hidden flex flex-col items-center justify-center text-primary-foreground">
        <div className="absolute inset-0 bg-gradient-aurora opacity-60" />
        <div className="absolute top-10 -left-10 size-64 rounded-full bg-white/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-10 -right-10 size-72 rounded-full bg-white/10 blur-3xl animate-pulse [animation-delay:0.6s]" />

        <div className="relative z-10 flex flex-col items-center gap-8 animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-white/20 blur-2xl animate-ping" />
            <BrandMark className="size-56 relative animate-pulse" />
          </div>
          <div className="text-center animate-fade-in [animation-delay:0.3s]">
            <h1 className="text-6xl font-bold tracking-tight">{t("splash.title")}</h1>
          </div>
          <p className="max-w-[280px] text-center text-sm text-primary-foreground/80 text-balance animate-fade-in [animation-delay:0.6s]">
            {t("splash.subtitle")}
          </p>
        </div>

        <div className="absolute bottom-10 flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-white/80 animate-pulse" />
          <span className="size-1.5 rounded-full bg-white/40 animate-pulse [animation-delay:0.2s]" />
          <span className="size-1.5 rounded-full bg-white/40 animate-pulse [animation-delay:0.4s]" />
        </div>

        <Link to="/login" className="sr-only">Continue</Link>
        <BrandName className="sr-only" />
      </div>
    </div>
  );
}
