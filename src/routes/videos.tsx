import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileShell, ScreenHeader } from "@/components/MobileShell";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { Play, BadgeCheck, Loader2, Inbox, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/videos")({
  head: () => ({ meta: [{ title: "Learn · إشارة حياة" }] }),
  component: Videos,
});

type Video = {
  id: string;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  video_url: string;
  thumbnail_url: string | null;
  category: string;
  is_verified: boolean;
};

const CATS = ["all", "emergency", "pharmacy", "sign_language", "general"] as const;

function Videos() {
  const { t, isRTL } = useLanguage();
  const [videos, setVideos] = useState<Video[] | null>(null);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<(typeof CATS)[number]>("all");

  useEffect(() => {
    void (async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) console.error(error);
      setVideos((data as Video[]) ?? []);
    })();
  }, []);

  const filtered = (videos ?? []).filter((v) => {
    const matchesCat = cat === "all" || v.category === cat;
    const q = query.trim().toLowerCase();
    const matchesQ = !q || v.title_en.toLowerCase().includes(q) || v.title_ar.toLowerCase().includes(q);
    return matchesCat && matchesQ;
  });

  return (
    <MobileShell>
      <ScreenHeader title={t("videos.title")} subtitle={t("videos.subtitle")} />

      <section className="px-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder={t("videos.search")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-12 pl-11 rounded-2xl bg-secondary border-0"
          />
        </div>
      </section>

      <section className="px-5 mt-4">
        <div className="flex gap-2 overflow-x-auto -mx-5 px-5 pb-1">
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-4 h-9 rounded-full text-xs font-medium whitespace-nowrap ${
                cat === c ? "bg-gradient-brand text-primary-foreground" : "bg-secondary text-secondary-foreground"
              }`}
            >
              {t(`videos2.cat.${c}`)}
            </button>
          ))}
        </div>
      </section>

      <section className="px-5 mt-5">
        {videos === null ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="size-5 animate-spin me-2" /> {t("videos2.loading")}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-8 text-center space-y-3 animate-fade-in">
            <div className="mx-auto size-14 rounded-2xl bg-secondary flex items-center justify-center">
              <Inbox className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">{t("videos2.empty")}</p>
            <p dir="rtl" className="text-sm text-muted-foreground">لا توجد مقاطع فيديو بعد.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 animate-fade-in">
            {filtered.map((v) => (
              <a
                key={v.id}
                href={v.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl overflow-hidden bg-card border border-border shadow-soft block"
              >
                <div className="relative h-24 bg-gradient-to-br from-primary to-turquoise flex items-center justify-center overflow-hidden">
                  {v.thumbnail_url && (
                    <img
                      src={v.thumbnail_url}
                      alt={isRTL ? v.title_ar : v.title_en}
                      loading="lazy"
                      className="absolute inset-0 size-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/30" />
                  <Play className="relative size-7 text-white fill-white" />
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold leading-tight line-clamp-2">
                    {isRTL ? v.title_ar : v.title_en}
                  </p>
                  {v.is_verified && (
                    <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                      <BadgeCheck className="size-3 text-teal" /> {t("videos.verified")}
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </MobileShell>
  );
}
