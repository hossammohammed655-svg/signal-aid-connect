import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
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

          <div className="grid grid-cols-3 gap-2">
            {["Google", "Apple", "X"].map((p) => (
              <button type="button" key={p} className="h-12 rounded-2xl border border-border text-sm font-medium hover:bg-secondary">{p}</button>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-auto">
            {t("login.new")} <Link to="/register" className="text-primary font-semibold">{t("login.create")}</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
