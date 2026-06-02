import { createFileRoute, Link } from "@tanstack/react-router";
import { useLanguage } from "@/hooks/useLanguage";
import { ArrowLeft, Camera, Mic, RefreshCw, Languages, Volume2, Hand } from "lucide-react";

export const Route = createFileRoute("/translate")({
  head: () => ({ meta: [{ title: "Sign Language Translation · إشارة حياة" }] }),
  component: Translate,
});

function Translate() {
  const { t } = useLanguage();
  return (
    <div className="min-h-dvh w-full flex justify-center bg-black">
      <div className="relative w-full max-w-[440px] min-h-dvh bg-neutral-950 text-white overflow-hidden flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/30 via-turquoise/20 to-black" />
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(circle at 30% 30%, rgba(57,139,196,0.4), transparent 50%), radial-gradient(circle at 80% 70%, rgba(54,86,187,0.4), transparent 50%)" }} />

        <header className="relative z-10 flex items-center justify-between px-5 pt-12 pb-4">
          <Link to="/home" className="size-10 rounded-full glass border border-white/20 flex items-center justify-center" aria-label={t("common.back")}>
            <ArrowLeft className="size-5" />
          </Link>
          <div className="glass border border-white/20 rounded-full px-3 py-1.5 flex items-center gap-2 text-xs">
            <span className="size-2 rounded-full bg-success animate-pulse" /> {t("translate.live")}
          </div>
          <button className="size-10 rounded-full glass border border-white/20 flex items-center justify-center" aria-label={t("translate.switchCam")}>
            <RefreshCw className="size-5" />
          </button>
        </header>

        <div className="relative flex-1 flex items-center justify-center px-5">
          <div className="absolute inset-x-5 top-0 bottom-40 rounded-[2.5rem] border border-white/15 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <Hand className="size-40 text-white/10" strokeWidth={1.2} />
            </div>
            <div className="absolute inset-4 rounded-[2rem] border-2 border-dashed border-teal/60" />
            <div className="absolute top-4 left-4 right-4 flex justify-between text-[10px] uppercase tracking-widest text-white/70">
              <span>{t("translate.hands")}</span>
              <span>{t("translate.langs")}</span>
            </div>
            <div className="absolute bottom-4 left-4 right-4 glass border border-white/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/70 mb-1">
                <Languages className="size-3" /> {t("translate.subtitles")}
              </div>
              <p className="text-lg font-semibold leading-snug">"{t("translate.demoEn")}"</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 px-5 pb-10 pt-4">
          <div className="flex items-center justify-center gap-6">
            <button className="size-14 rounded-2xl glass border border-white/20 flex items-center justify-center" aria-label="Voice">
              <Volume2 className="size-6" />
            </button>
            <button className="size-20 rounded-full bg-white text-primary flex items-center justify-center shadow-glow" aria-label="Capture">
              <Camera className="size-8" />
            </button>
            <button className="size-14 rounded-2xl glass border border-white/20 flex items-center justify-center" aria-label="Mic">
              <Mic className="size-6" />
            </button>
          </div>
          <p className="text-center text-xs text-white/60 mt-4">{t("translate.hint")}</p>
        </div>
      </div>
    </div>
  );
}
