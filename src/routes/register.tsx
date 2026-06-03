import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BrandMark } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Lock, User, Phone, Stethoscope } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account · إشارة حياة" }] }),
  component: Register,
});

function Register() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [userType, setUserType] = useState<"patient" | "pharmacist">("patient");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !phone.trim() || !password || !confirm) {
      setError(t("register.err.required"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t("register.err.email"));
      return;
    }
    if (password.length < 6) {
      setError(t("register.err.password"));
      return;
    }
    if (password !== confirm) {
      setError(t("register.err.match"));
      return;
    }

    setLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/home`,
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
          user_type: userType,
        },
      },
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    toast.success(t("register.success"));
    navigate({ to: "/home" });
  }

  return (
    <div className="min-h-dvh w-full flex justify-center bg-muted/40">
      <div className="relative w-full max-w-[440px] min-h-dvh bg-background flex flex-col">
        <div className="bg-gradient-brand text-primary-foreground rounded-b-[2.5rem] px-6 pt-12 pb-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-aurora opacity-50" />
          <div className="relative z-10 flex flex-col items-center gap-3">
            <BrandMark />
            <div className="text-center">
              <h1 className="text-2xl font-bold">{t("register.title")}</h1>
              <p className="text-xs opacity-90 mt-1 px-4">{t("register.subtitle")}</p>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="flex-1 px-6 pt-6 pb-8 flex flex-col gap-3">
          <FieldIcon icon={<User className="size-4" />}>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t("register.fullName")}
              className="h-13 ps-11 rounded-2xl bg-secondary border-0"
            />
          </FieldIcon>

          <FieldIcon icon={<Mail className="size-4" />}>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("register.email")}
              className="h-13 ps-11 rounded-2xl bg-secondary border-0"
            />
          </FieldIcon>

          <FieldIcon icon={<Phone className="size-4" />}>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t("register.phone")}
              className="h-13 ps-11 rounded-2xl bg-secondary border-0"
            />
          </FieldIcon>

          <FieldIcon icon={<Lock className="size-4" />}>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("register.password")}
              className="h-13 ps-11 rounded-2xl bg-secondary border-0"
            />
          </FieldIcon>

          <FieldIcon icon={<Lock className="size-4" />}>
            <Input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder={t("register.confirmPassword")}
              className="h-13 ps-11 rounded-2xl bg-secondary border-0"
            />
          </FieldIcon>

          <FieldIcon icon={<Stethoscope className="size-4" />}>
            <Select value={userType} onValueChange={(v) => setUserType(v as "patient" | "pharmacist")}>
              <SelectTrigger className="h-13 ps-11 rounded-2xl bg-secondary border-0">
                <SelectValue placeholder={t("register.userType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="patient">{t("register.patient")}</SelectItem>
                <SelectItem value="pharmacist">{t("register.pharmacist")}</SelectItem>
              </SelectContent>
            </Select>
          </FieldIcon>

          {error && (
            <p className="text-sm text-destructive font-medium text-center mt-1">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="h-14 mt-2 rounded-2xl bg-gradient-brand text-primary-foreground shadow-soft text-base font-semibold"
          >
            {loading ? "..." : t("register.create")}
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-auto pt-4">
            {t("register.have")}{" "}
            <Link to="/login" className="text-primary font-semibold">
              {t("register.signin")}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function FieldIcon({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
        {icon}
      </div>
      {children}
    </div>
  );
}
