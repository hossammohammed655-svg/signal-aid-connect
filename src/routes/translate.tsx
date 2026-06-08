import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useLanguage } from "@/hooks/useLanguage";
import { translateSign, type SignTranslateResult } from "@/lib/sign-translate.functions";
import { ArrowLeft, Camera, RefreshCw, Loader2, Languages, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/translate")({
  head: () => ({ meta: [{ title: "Sign Language Translation · إشارة حياة" }] }),
  component: Translate,
});

function Translate() {
  const { t } = useLanguage();
  const translate = useServerFn(translateSign);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facing, setFacing] = useState<"user" | "environment">("user");
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SignTranslateResult | null>(null);
  const [snapshot, setSnapshot] = useState<string | null>(null);

  async function startCamera(mode: "user" | "environment" = facing) {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(t("translate3.permDenied"));
      return;
    }
    try {
      if (streamRef.current) streamRef.current.getTracks().forEach((tr) => tr.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setActive(true);
    } catch (e) {
      console.error(e);
      const name = (e as { name?: string })?.name;
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setError(t("translate3.permDenied"));
      } else {
        setError(t("translate2.cameraError"));
      }
    }
  }

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((tr) => tr.stop());
    };
  }, []);

  async function switchCamera() {
    const next = facing === "user" ? "environment" : "user";
    setFacing(next);
    await startCamera(next);
  }

  async function capture() {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setSnapshot(dataUrl);
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const r = await translate({ data: { imageBase64: dataUrl } });
      setResult(r);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : t("translate2.aiError"));
    } finally {
      setLoading(false);
    }
  }

  function retake() {
    setSnapshot(null);
    setResult(null);
    setError(null);
  }

  return (
    <div className="min-h-dvh w-full flex justify-center bg-black">
      <div className="relative w-full max-w-[440px] min-h-dvh bg-neutral-950 text-white overflow-hidden flex flex-col animate-fade-in">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/30 via-turquoise/20 to-black pointer-events-none" />

        <header className="relative z-10 flex items-center justify-between px-5 pt-12 pb-4">
          <Link to="/home" className="size-10 rounded-full glass border border-white/20 flex items-center justify-center" aria-label="Back">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="glass border border-white/20 rounded-full px-3 py-1.5 flex items-center gap-2 text-xs">
            <Languages className="size-3" /> {t("translate2.title")}
          </div>
          <button
            onClick={switchCamera}
            disabled={!active}
            className="size-10 rounded-full glass border border-white/20 flex items-center justify-center disabled:opacity-40"
            aria-label={t("translate2.switch")}
          >
            <RefreshCw className="size-5" />
          </button>
        </header>

        <div className="relative flex-1 px-5 pb-6">
          <div className="relative rounded-[2rem] overflow-hidden border border-white/15 bg-black aspect-[3/4]">
            {snapshot ? (
              <img src={snapshot} alt="Captured" className="absolute inset-0 size-full object-cover" />
            ) : (
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="absolute inset-0 size-full object-cover"
                style={{ transform: facing === "user" ? "scaleX(-1)" : undefined }}
              />
            )}
            <canvas ref={canvasRef} className="hidden" />

            {!active && !snapshot && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
                <Camera className="size-16 text-white/40" strokeWidth={1.2} />
                <p className="text-sm text-white/70">{t("translate2.waiting")}</p>
                <button
                  onClick={() => startCamera()}
                  className="rounded-2xl bg-white text-primary font-semibold px-6 py-3 text-sm shadow-glow"
                >
                  {t("translate2.start")}
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 rounded-2xl bg-destructive/15 border border-destructive/40 p-3 text-center">
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}

          {(loading || result) && (
            <div className="mt-5 rounded-3xl bg-card text-foreground p-5 shadow-soft animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{t("translate2.result")}</p>
                {result && !loading && (
                  <span
                    className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full ${
                      result.confidence === "HIGH"
                        ? "bg-success/20 text-success-foreground"
                        : result.confidence === "MEDIUM"
                          ? "bg-warning/20 text-foreground"
                          : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {t("translate3.confidence")}: {t(`translate3.conf.${result.confidence}`)}
                  </span>
                )}
              </div>
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  {t("translate2.translating")}
                </div>
              ) : result ? (
                <div className="space-y-2">
                  <p dir="rtl" className="text-right text-2xl font-bold leading-snug">{result.text_ar || t("translate3.noSign")}</p>
                  <p dir="ltr" className="text-left text-2xl font-bold leading-snug">{result.text_en || t("translate3.noSign")}</p>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="relative z-10 px-5 pb-10 pt-2">
          <div className="flex items-center justify-center gap-6">
            {snapshot ? (
              <button
                onClick={retake}
                className="rounded-2xl glass border border-white/20 px-6 h-14 flex items-center gap-2 text-sm font-semibold"
              >
                <RotateCcw className="size-5" /> {t("translate2.retake")}
              </button>
            ) : (
              <button
                onClick={capture}
                disabled={!active || loading}
                className="rounded-2xl bg-white text-primary font-bold px-6 h-16 flex items-center gap-3 shadow-glow disabled:opacity-50"
              >
                {loading ? <Loader2 className="size-6 animate-spin" /> : <Camera className="size-6" />}
                <span className="text-sm">{t("translate2.capture")} · التقط وترجم</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
