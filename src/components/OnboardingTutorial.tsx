import { useState } from "react";
import { BrandMark } from "@/components/BrandLogo";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const STEPS = [
  {
    icon: "👋",
    title: "مرحباً بك في إشارة حياة / Welcome to Sign of Life",
    text: "تطبيقك الذكي للتواصل الصحي\nYour smart healthcare communication app\nLet us show you around!",
  },
  {
    icon: "🤟",
    title: "ترجمة لغة الإشارة / Sign Language Translation",
    text: "استخدم الكاميرا لترجمة لغة الإشارة إلى نص فوري\nUse your camera to translate sign language to text in real-time.\nYou can also type text and see how to sign it!",
  },
  {
    icon: "🚨",
    title: "نظام الطوارئ / Emergency SOS",
    text: "في حالة الطوارئ اضغط الزر الأحمر\nIn an emergency, press the red button.\nYour GPS location will be sent to your emergency contacts and emergency services automatically!",
  },
  {
    icon: "🩺",
    title: "فحص الأعراض / Symptom Checker",
    text: "اختر أعراضك واحصل على تقييم ذكاء اصطناعي فوري\nSelect your symptoms and get an instant AI risk assessment.\nGreen = Low risk, Yellow = Moderate, Red = Emergency",
  },
  {
    icon: "💊",
    title: "التفاعلات الدوائية / Drug Interactions",
    text: "ابحث عن أي دواء لمعرفة التفاعلات الخطيرة مع الطعام\nSearch any medication to see dangerous food interactions\nand get safety advice instantly",
  },
  {
    icon: "📱",
    title: "جهات الاتصال الطارئة / Emergency Contacts",
    text: "أضف أرقام أهلك وأصدقائك في صفحة الطوارئ\nAdd your family and friends numbers in the SOS page.\nThey will be notified automatically in any emergency!",
  },
  {
    icon: "📋",
    title: "التقارير الطبية / Medical Reports",
    text: "كل فحوصاتك محفوظة تلقائياً\nAll your AI consultations are saved automatically.\nExport them as PDF to share with your doctor anytime!",
  },
  {
    icon: "✅",
    title: "أنت جاهز! / You're All Set!",
    text: "يمكنك الآن استخدام إشارة حياة بكل ميزاته\nYou can now use all features of Sign of Life.\nStay safe and healthy! 💙",
    isFinal: true,
  },
] as const;

type Props = {
  onDone: () => void;
};

export function OnboardingTutorial({ onDone }: Props) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [animKey, setAnimKey] = useState(0);

  const current = STEPS[step];
  const isFirst = step === 0;
  const isFinal = "isFinal" in current && current.isFinal;

  function goTo(next: number, dir: "forward" | "back") {
    setDirection(dir);
    setStep(next);
    setAnimKey((k) => k + 1);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[oklch(0.10_0.03_265)]/85 backdrop-blur-sm">
      <div className="relative w-full max-w-[400px]">
        <div className="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl bg-gradient-to-br from-[oklch(0.14_0.04_268)] via-[oklch(0.18_0.05_270)] to-[oklch(0.12_0.04_265)] text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-teal/10 to-turquoise/20 pointer-events-none" />

          <button
            type="button"
            onClick={onDone}
            className="absolute top-4 right-4 z-10 text-xs font-semibold text-white/70 hover:text-white px-3 py-1.5 rounded-full border border-white/20 bg-white/5 transition"
          >
            تخطي / Skip
          </button>

          <div className="relative px-6 pt-10 pb-6 flex flex-col items-center min-h-[420px]">
            <BrandMark className="size-14 mb-4" />

            <div
              key={animKey}
              className={cn(
                "flex flex-col items-center text-center flex-1 w-full",
                direction === "forward" ? "animate-slide-in-right" : "animate-slide-in-left",
              )}
            >
              <span className="text-6xl mb-4 select-none" aria-hidden>
                {current.icon}
              </span>
              <h2 className="text-lg font-bold leading-snug text-balance px-2">{current.title}</h2>
              <p className="mt-4 text-sm text-white/80 leading-relaxed whitespace-pre-line max-w-[320px]">
                {current.text}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 mt-6 mb-5">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "rounded-full transition-all duration-300",
                    i === step ? "size-2.5 bg-teal" : "size-2 bg-white/25",
                  )}
                />
              ))}
            </div>

            <div className="flex items-center gap-3 w-full">
              {!isFirst && (
                <button
                  type="button"
                  onClick={() => goTo(step - 1, "back")}
                  className="flex-1 h-12 rounded-2xl border border-white/20 bg-white/5 font-semibold text-sm flex items-center justify-center gap-1.5 hover:bg-white/10 transition"
                >
                  <ChevronLeft className="size-4" />
                  السابق / Back
                </button>
              )}

              {isFinal ? (
                <button
                  type="button"
                  onClick={onDone}
                  className={cn(
                    "h-12 rounded-2xl bg-success text-success-foreground font-bold text-sm shadow-lg hover:opacity-90 transition",
                    isFirst ? "w-full" : "flex-[2]",
                  )}
                >
                  ابدأ الآن / Get Started
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => goTo(step + 1, "forward")}
                  className={cn(
                    "h-12 rounded-2xl bg-gradient-brand text-primary-foreground font-bold text-sm shadow-glow flex items-center justify-center gap-1.5 hover:opacity-90 transition",
                    isFirst ? "w-full" : "flex-[2]",
                  )}
                >
                  التالي / Next
                  <ChevronRight className="size-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onDone}
          className="absolute -top-2 -right-2 size-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/80 hover:bg-white/20 transition md:hidden"
          aria-label="Skip tutorial"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
