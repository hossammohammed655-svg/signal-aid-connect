import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BrandMark } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { Mail, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot password · إشارة حياة" }] }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError(t("register.err.required"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t("register.err.email"));
      return;
    }

    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: `${window.location.origin}/reset-password` }
    );
    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  }

  return (
    <div className="min-h-dvh w-full flex justify-center bg-muted/40">
      <div className="relative w-full max-w-[440px] min-h-dvh bg-background flex flex-col">
        <div className="bg-gradient-brand text-primary-foreground rounded-b-[2.5rem] px-6 pt-14 pb-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-aurora opacity-50" />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <BrandMark />
            <div className="text-center">
              <h1 className="text-2xl font-bold">{t("forgot.title")}</h1>
              <p className="text-xs opacity-90 mt-1 px-4">{t("forgot.subtitle")}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-6 pt-8 pb-8 flex flex-col gap-5">
          {sent ? (
            <div className="flex flex-col items-center gap-4 text-center mt-8">
              <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="size-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">{t("forgot.sent")}</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col gap-5">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("forgot.email")}
                  className="h-14 pl-11 rounded-2xl bg-secondary border-0"
                />
              </div>

              {error && (
                <p className="text-sm text-destructive font-medium text-center">{error}</p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="h-14 rounded-2xl bg-gradient-brand text-primary-foreground shadow-soft text-base font-semibold"
              >
                {loading ? "..." : t("forgot.send")}
              </Button>
            </form>
          )}

          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground mt-auto"
          >
            <ArrowLeft className="size-4" />
            {t("forgot.back")}
          </Link>
        </div>
      </div>
    </div>
  );
}
