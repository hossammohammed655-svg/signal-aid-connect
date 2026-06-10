import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useLanguage } from "@/hooks/useLanguage";
import {
  translateSign,
  textToSign,
  type SignTranslateResult,
  type TextToSignResult,
  type TextToSignWord,
} from "@/lib/sign-translate.functions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  ArrowLeft,
  Camera,
  RefreshCw,
  Loader2,
  Languages,
  Play,
  Square,
  Type,
  ZoomIn,
  List,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/translate")({
  head: () => ({ meta: [{ title: "Sign Language Translation · إشارة حياة" }] }),
  component: Translate,
});

const ANALYZE_INTERVAL_MS = 2000;

function Translate() {
  const { t } = useLanguage();
  const [tab, setTab] = useState("sign-to-text");

  return (
    <div className="min-h-dvh w-full flex justify-center bg-muted/40">
      <div className="relative w-full max-w-[440px] min-h-dvh bg-background text-foreground overflow-hidden flex flex-col animate-fade-in">
        <header className="relative z-10 flex items-center justify-between px-5 pt-12 pb-3 bg-gradient-brand text-primary-foreground rounded-b-[2rem]">
          <Link to="/home" className="size-10 rounded-full glass border border-white/20 flex items-center justify-center" aria-label="Back">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="glass border border-white/20 rounded-full px-3 py-1.5 flex items-center gap-2 text-xs">
            <Languages className="size-3" /> {t("translate2.title")}
          </div>
          <div className="size-10" />
        </header>

        <Tabs value={tab} onValueChange={setTab} className="relative z-10 flex-1 flex flex-col px-5 pb-8 pt-4">
          <TabsList className="w-full h-auto p-1 bg-secondary rounded-2xl grid grid-cols-2 gap-1">
            <TabsTrigger
              value="sign-to-text"
              className="rounded-xl text-[11px] leading-tight py-2.5 px-2 data-[state=active]:bg-background data-[state=active]:text-primary whitespace-normal"
            >
              إشارة إلى نص / Sign to Text
            </TabsTrigger>
            <TabsTrigger
              value="text-to-sign"
              className="rounded-xl text-[11px] leading-tight py-2.5 px-2 data-[state=active]:bg-background data-[state=active]:text-primary whitespace-normal"
            >
              نص إلى إشارة / Text to Sign
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sign-to-text" className="flex-1 flex flex-col mt-4">
            <SignToTextTab t={t} isActive={tab === "sign-to-text"} />
          </TabsContent>
          <TabsContent value="text-to-sign" className="flex-1 flex flex-col mt-4">
            <TextToSignTab t={t} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function SignToTextTab({ t, isActive }: { t: (key: string) => string; isActive: boolean }) {
  const translate = useServerFn(translateSign);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyzingRef = useRef(false);

  const [facing, setFacing] = useState<"user" | "environment">("user");
  const [cameraOn, setCameraOn] = useState(false);
  const [liveActive, setLiveActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subtitle, setSubtitle] = useState<SignTranslateResult | null>(null);

  const analyzeFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || analyzingRef.current) return;
    const video = videoRef.current;
    if (video.videoWidth === 0) return;

    const canvas = canvasRef.current;
    const w = video.videoWidth;
    const h = video.videoHeight;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.75);

    analyzingRef.current = true;
    setAnalyzing(true);
    try {
      const r = await translate({ data: { imageBase64: dataUrl } });
      setSubtitle(r);
      setError(null);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : t("translate2.aiError"));
    } finally {
      analyzingRef.current = false;
      setAnalyzing(false);
    }
  }, [translate, t]);

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
      setCameraOn(true);
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
    if (!isActive) {
      setLiveActive(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((tr) => tr.stop());
        streamRef.current = null;
      }
      setCameraOn(false);
      setSubtitle(null);
    }
  }, [isActive]);

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((tr) => tr.stop());
    };
  }, []);

  useEffect(() => {
    if (!liveActive || !cameraOn) return;
    void analyzeFrame();
    const id = setInterval(() => void analyzeFrame(), ANALYZE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [liveActive, cameraOn, analyzeFrame]);

  async function switchCamera() {
    const next = facing === "user" ? "environment" : "user";
    setFacing(next);
    await startCamera(next);
  }

  async function toggleLive() {
    if (!cameraOn) {
      await startCamera();
    }
    setLiveActive((v) => !v);
  }

  function stopLive() {
    setLiveActive(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((tr) => tr.stop());
      streamRef.current = null;
    }
    setCameraOn(false);
    setSubtitle(null);
  }

  return (
    <>
      <div className="relative rounded-[2rem] overflow-hidden border border-white/15 bg-black aspect-[3/4]">
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className="absolute inset-0 size-full object-cover"
          style={{ transform: facing === "user" ? "scaleX(-1)" : undefined }}
        />
        <canvas ref={canvasRef} className="hidden" />

        {!cameraOn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center bg-black/60">
            <Camera className="size-16 text-white/40" strokeWidth={1.2} />
            <p className="text-sm text-white/70">{t("translate2.waiting")}</p>
          </div>
        )}

        {liveActive && (
          <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-destructive/90 px-3 py-1.5">
            <span className="size-2.5 rounded-full bg-white animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider">LIVE</span>
          </div>
        )}

        {analyzing && liveActive && (
          <div className="absolute top-4 right-4 size-8 rounded-full bg-black/50 flex items-center justify-center">
            <Loader2 className="size-4 animate-spin text-white/80" />
          </div>
        )}

        {subtitle && cameraOn && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent px-4 pt-10 pb-5">
            <p dir="rtl" className="text-center text-2xl font-bold leading-snug text-white drop-shadow-lg">
              {subtitle.text_ar || t("translate3.noSign")}
            </p>
            <p dir="ltr" className="text-center text-xl font-semibold leading-snug text-white/90 mt-1 drop-shadow-lg">
              {subtitle.text_en || t("translate3.noSign")}
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 rounded-2xl bg-destructive/15 border border-destructive/40 p-3 text-center">
          <p className="text-sm text-destructive font-medium">{error}</p>
        </div>
      )}

      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          onClick={switchCamera}
          disabled={!cameraOn}
          className="size-12 rounded-2xl border border-border bg-card flex items-center justify-center disabled:opacity-40"
          aria-label={t("translate2.switch")}
        >
          <RefreshCw className="size-5" />
        </button>

        <button
          onClick={liveActive ? () => setLiveActive(false) : toggleLive}
          className={cn(
            "rounded-2xl font-bold px-8 h-14 flex items-center gap-3 shadow-soft transition",
            liveActive ? "bg-destructive text-destructive-foreground" : "bg-gradient-brand text-primary-foreground",
          )}
        >
          {liveActive ? (
            <>
              <Square className="size-5 fill-current" />
              <span className="text-sm">STOP · إيقاف</span>
            </>
          ) : (
            <>
              <Play className="size-5 fill-current" />
              <span className="text-sm">START · بدء</span>
            </>
          )}
        </button>

        {cameraOn && !liveActive && (
          <button
            onClick={stopLive}
            className="size-12 rounded-2xl border border-border bg-card flex items-center justify-center text-xs"
            aria-label="Stop camera"
          >
            <Camera className="size-5" />
          </button>
        )}
      </div>
    </>
  );
}

function TextToSignTab({ t }: { t: (key: string) => string }) {
  const toSign = useServerFn(textToSign);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TextToSignResult | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [textScale, setTextScale] = useState(1);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => setCurrentIndex(carouselApi.selectedScrollSnap());
    carouselApi.on("select", onSelect);
    onSelect();
    return () => { carouselApi.off("select", onSelect); };
  }, [carouselApi]);

  async function handleSubmit() {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setShowAll(false);
    setCurrentIndex(0);
    try {
      const r = await toSign({ data: { text: input.trim() } });
      setResult(r);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : t("translate2.aiError"));
    } finally {
      setLoading(false);
    }
  }

  const total = result?.words.length ?? 0;

  return (
    <div className="flex flex-col gap-4 flex-1">
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground flex items-center gap-2">
          <Type className="size-3.5" /> اكتب كلمة أو جملة / Type a word or sentence
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          placeholder="مثال: أحتاج مساعدة / Example: I need help"
          className="w-full rounded-2xl bg-secondary border border-border px-4 py-3 text-sm outline-none resize-none placeholder:text-muted-foreground"
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !input.trim()}
          className="w-full rounded-2xl bg-gradient-brand text-primary-foreground font-bold py-3.5 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="size-5 animate-spin" /> : <Languages className="size-5" />}
          {loading ? t("translate2.translating") : "ترجم إلى إشارة / Translate to Sign"}
        </button>
      </div>

      {error && (
        <div className="rounded-2xl bg-destructive/15 border border-destructive/40 p-3 text-center">
          <p className="text-sm text-destructive font-medium">{error}</p>
        </div>
      )}

      {result && total > 0 && (
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">
              Word {currentIndex + 1} of {total} · كلمة {currentIndex + 1} من {total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTextScale((s) => Math.min(s + 0.15, 2))}
                className="size-9 rounded-xl border border-border bg-card flex items-center justify-center"
                aria-label="Increase text size"
              >
                <ZoomIn className="size-4" />
              </button>
              <button
                onClick={() => setShowAll((v) => !v)}
                className="h-9 px-3 rounded-xl border border-border bg-card flex items-center gap-1.5 text-xs font-semibold"
              >
                <List className="size-3.5" />
                {showAll ? "Cards · بطاقات" : "Show All · عرض الكل"}
              </button>
            </div>
          </div>

          {showAll ? (
            <div className="flex-1 overflow-y-auto space-y-3 max-h-[50vh] pr-1">
              {result.words.map((w, i) => (
                <WordCard key={i} word={w} scale={textScale} index={i} total={total} compact />
              ))}
              {result.full_sentence_tip && (
                <div className="rounded-2xl bg-primary/20 border border-primary/30 p-4">
                  <p className="text-xs uppercase tracking-wider text-white/60 mb-1">Sentence tip · نصيحة</p>
                  <p className="text-sm leading-relaxed">{result.full_sentence_tip}</p>
                </div>
              )}
            </div>
          ) : (
            <>
              <Carousel setApi={setCarouselApi} className="w-full">
                <CarouselContent>
                  {result.words.map((w, i) => (
                    <CarouselItem key={i}>
                      <WordCard word={w} scale={textScale} index={i} total={total} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="-left-1 border-border bg-card text-foreground hover:bg-secondary" />
                <CarouselNext className="-right-1 border-border bg-card text-foreground hover:bg-secondary" />
              </Carousel>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => carouselApi?.scrollPrev()}
                  disabled={currentIndex === 0}
                  className="size-10 rounded-full border border-border bg-card flex items-center justify-center disabled:opacity-30"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  onClick={() => carouselApi?.scrollNext()}
                  disabled={currentIndex >= total - 1}
                  className="size-10 rounded-full border border-border bg-card flex items-center justify-center disabled:opacity-30"
                >
                  <ChevronRight className="size-5" />
                </button>
              </div>
              {result.full_sentence_tip && (
                <div className="rounded-2xl bg-primary/20 border border-primary/30 p-3">
                  <p className="text-xs text-white/60 mb-1">💡 {result.full_sentence_tip}</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function WordCard({
  word,
  scale,
  index,
  total,
  compact = false,
}: {
  word: TextToSignWord;
  scale: number;
  index: number;
  total: number;
  compact?: boolean;
}) {
  const baseSize = compact ? 28 : 36;
  const emojiSize = compact ? 48 : 72;

  return (
    <div className={cn("rounded-3xl border border-border bg-card p-5 shadow-soft", compact && "p-4")}>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
        {index + 1} / {total}
      </p>
      <p
        className="font-bold text-center leading-tight"
        style={{ fontSize: `${baseSize * scale}px` }}
        dir="auto"
      >
        {word.word_ar || word.word}
      </p>
      <p className="text-center text-muted-foreground mt-1" style={{ fontSize: `${(baseSize - 8) * scale}px` }} dir="ltr">
        {word.word_en}
      </p>
      <p
        className="text-center my-4 leading-none select-none"
        style={{ fontSize: `${emojiSize * scale}px` }}
        aria-hidden
      >
        {word.emoji_representation}
      </p>
      <div className="space-y-2 text-sm">
        <InfoRow label="Fingers · الأصابع" value={word.fingers} />
        <InfoRow label="Hand shape · شكل اليد" value={word.hand_shape} />
        <InfoRow label="Movement · الحركة" value={word.movement} />
        {word.tip && (
          <div className="rounded-xl bg-yellow-500/15 border border-yellow-500/30 p-3 mt-2">
            <p className="text-[10px] uppercase tracking-wider text-yellow-400/80 mb-1">Memory tip · تلميح</p>
            <p className="text-sm leading-relaxed">{word.tip}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}
