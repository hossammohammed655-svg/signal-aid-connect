import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Mail, Lock, Fingerprint } from "lucide-react";


export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in · إشارة حياة" }] }),
  component: Login,
});

function Login() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/home", replace: true });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError(t("login.err.required"));
      return;
    }
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (signInError) {
      const msg = signInError.message.toLowerCase();
      if (msg.includes("invalid") || msg.includes("credentials")) {
        setError(t("login.err.invalid"));
      } else {
        setError(signInError.message || t("login.err.generic"));
      }
      return;
    }
    navigate({ to: "/home", replace: true });
  }

  return (
    <div className="min-h-dvh w-full flex justify-center bg-muted/40">
      <div className="relative w-full max-w-[440px] min-h-dvh bg-background flex flex-col">
        <div className="bg-gradient-brand text-primary-foreground rounded-b-[2.5rem] px-6 pt-14 pb-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-aurora opacity-50" />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <BrandMark />
            <div className="text-center">
              <h1 className="text-3xl font-bold">{t("login.welcome")}</h1>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="flex-1 px-6 pt-8 pb-8 flex flex-col gap-5">
          <div className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("login.email")}
                className="h-14 pl-11 rounded-2xl bg-secondary border-0"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("login.password")}
                className="h-14 pl-11 rounded-2xl bg-secondary border-0"
              />
            </div>
          </div>

          <Link to="/forgot-password" className="text-xs text-primary self-end font-medium">{t("login.forgot")}</Link>

          {error && (
            <p className="text-sm text-destructive font-medium text-center">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="h-14 rounded-2xl bg-gradient-brand text-primary-foreground shadow-soft text-base font-semibold"
          >
            {loading ? t("login.signingIn") : t("login.signin")}
          </Button>

          <button type="button" className="flex items-center justify-center gap-2 h-12 rounded-2xl border border-border text-sm font-medium">
            <Fingerprint className="size-4 text-teal" /> {t("login.faceid")}
          </button>

          <div className="flex items-center gap-3 my-2">
            <span className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">{t("login.or")}</span>
            <span className="flex-1 h-px bg-border" />
          </div>

          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={async () => {
                setError(null);
                const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/home` });
                if (r.error) setError(t("social.error"));
              }}
              className="h-12 rounded-2xl border border-border text-sm font-semibold hover:bg-secondary flex items-center justify-center gap-2"
            >
              <svg viewBox="0 0 24 24" className="size-4"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
              {t("social.google")}
            </button>
            <button
              type="button"
              onClick={async () => {
                setError(null);
                const r = await lovable.auth.signInWithOAuth("apple", { redirect_uri: `${window.location.origin}/home` });
                if (r.error) setError(t("social.error"));
              }}
              className="h-12 rounded-2xl border border-border bg-foreground text-background text-sm font-semibold hover:opacity-90 flex items-center justify-center gap-2"
            >
              <svg viewBox="0 0 24 24" className="size-4" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
              {t("social.apple")}
            </button>
          </div>


          <p className="text-center text-sm text-muted-foreground mt-auto">
            {t("login.new")} <Link to="/register" className="text-primary font-semibold">{t("login.create")}</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
