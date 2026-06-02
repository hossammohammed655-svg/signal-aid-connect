import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import logoAsset from "@/assets/main-logo.png.asset.json";

export function BrandMark({ className }: { className?: string }) {
  return (
    <div className={cn("relative size-16 flex items-center justify-center", className)}>
      <img
        src={logoAsset.url}
        alt="Signs of Life logo"
        className="size-full object-contain drop-shadow-lg"
      />
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

export function BrandLogoFull({ className }: { className?: string }) {
  return (
    <img
      src={logoAsset.url}
      alt="إشارة حياة · Sign of Life"
      className={cn("object-contain", className)}
    />
  );
}
