import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { BrandMark, BrandName } from "@/components/BrandLogo";

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
  useEffect(() => {
    const t = setTimeout(() => navigate({ to: "/login" }), 2400);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="min-h-dvh w-full flex justify-center bg-muted/40">
      <div className="relative w-full max-w-[440px] min-h-dvh bg-gradient-brand overflow-hidden flex flex-col items-center justify-center text-primary-foreground">
        <div className="absolute inset-0 bg-gradient-aurora opacity-60" />
        <div className="absolute top-10 -left-10 size-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-10 -right-10 size-72 rounded-full bg-white/10 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center gap-6 animate-float">
          <BrandMark className="size-24" />
          <div className="text-center">
            <h1 dir="rtl" lang="ar" className="text-5xl font-bold tracking-tight">إشارة حياة</h1>
            <p className="mt-2 uppercase tracking-[0.35em] text-xs text-primary-foreground/80">Signs of Life</p>
          </div>
          <p className="max-w-[260px] text-center text-sm text-primary-foreground/80 text-balance">
            Bridging silence and care through AI-powered healthcare communication.
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
