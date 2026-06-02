import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

export function BrandMark({ className }: { className?: string }) {
  return (
    <div className={cn("relative size-16 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow", className)}>
      <svg viewBox="0 0 48 48" className="size-9 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 26h7l3-8 5 16 4-12 3 6h18" />
        <circle cx="38" cy="14" r="3" fill="currentColor" stroke="none" className="animate-heartbeat origin-center" />
      </svg>
      <span className="absolute -inset-1 rounded-2xl border border-white/20 animate-pulse-ring pointer-events-none" />
    </div>
  );
}

export function BrandName({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const { t } = useLanguage();
  const sizes = { sm: "text-lg", md: "text-2xl", lg: "text-4xl" } as const;
  return (
    <div className={cn("flex flex-col items-center gap-0.5", className)}>
      <h1 className={cn("font-bold tracking-tight", sizes[size])}>
        {t("splash.title")}
      </h1>
    </div>
  );
}
