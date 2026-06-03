import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { BrandMark } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { Lock, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password · إشارة حياة" }] }),
  component: ResetPassword,
});

function ResetPassword() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validLink, setValidLink] = useState<boolean | null>(null);

  useEffect(() => {
    const hash = window.location.hash;
    setValidLink(hash.includes("type=recovery"));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!password || !confirm) {
      setError(t("register.err.required"));
      return;
    }
    if (password.length < 6) {
      setError(t("reset.err.length"));
      return;
    }
    if (password !== confirm) {
      setError(t("reset.err.match"));
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setSuccess(true);
    setTimeout(() => {
      navigate({ to: "/login" });
    }, 2000);
  }

  if (validLink === null) {
    return (
      <div className="min-h-dvh w-full flex justify-center bg-muted/40">
        <div className="relative w-full max-w-[440px] min-h-dvh bg-background flex items-center justify-center">
          <p className="text-sm text-muted-foreground">...</p>
        </div>
      </div>
    );
  }

  if (validLink === false) {
    return (
      <div className="min-h-dvh w-full flex justify-center bg-muted/40">
        <div className="relative w-full max-w-[440px] min-h-dvh bg-background flex flex-col px-6 pt-14 pb-8">
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
            <p className="text-sm text-destructive font-medium">{t("reset.invalid")}</p>
            <Link
              to="/forgot-password"
              className="text-sm text-primary font-medium"
            >
              {t("forgot.title")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh w-full flex justify-center bg-muted/40">
      <div className="relative w-full max-w-[440px] min-h-dvh bg-background flex flex-col">
        <div className="bg-gradient-brand text-primary-foreground rounded-b-[2.5rem] px-6 pt-14 pb-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-aurora opacity-50" />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <BrandMark />
            <div className="text-center">
              <h1 className="text-2xl font-bold">{t("reset.title")}</h1>
              <p className="text-xs opacity-90 mt-1 px-4">{t("reset.subtitle")}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-6 pt-8 pb-8 flex flex-col gap-5">
          {success ? (
            <div className="flex flex-col items-center gap-4 text-center mt-8">
              <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="size-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">{t("reset.success")}</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col gap-5">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("reset.password")}
                  className="h-14 pl-11 rounded-2xl bg-secondary border-0"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder={t("reset.confirm")}
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
                {loading ? "..." : t("reset.update")}
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
