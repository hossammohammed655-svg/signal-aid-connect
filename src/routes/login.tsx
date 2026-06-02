import { createFileRoute, Link } from "@tanstack/react-router";
import { BrandMark } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Fingerprint } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in · إشارة حياة" }] }),
  component: Login,
});

function Login() {
  return (
    <div className="min-h-dvh w-full flex justify-center bg-muted/40">
      <div className="relative w-full max-w-[440px] min-h-dvh bg-background flex flex-col">
        <div className="bg-gradient-brand text-primary-foreground rounded-b-[2.5rem] px-6 pt-14 pb-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-aurora opacity-50" />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <BrandMark />
            <div className="text-center">
              <h1 dir="rtl" lang="ar" className="text-3xl font-bold">مرحباً بك</h1>
              <p className="text-primary-foreground/80 text-sm mt-1">Welcome back to Signs of Life</p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-6 pt-8 pb-8 flex flex-col gap-5">
          <div className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input placeholder="Email or phone" className="h-14 pl-11 rounded-2xl bg-secondary border-0" />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input type="password" placeholder="Password" className="h-14 pl-11 rounded-2xl bg-secondary border-0" />
            </div>
          </div>

          <button className="text-xs text-primary self-end font-medium">Forgot password?</button>

          <Button asChild className="h-14 rounded-2xl bg-gradient-brand text-primary-foreground shadow-soft text-base font-semibold">
            <Link to="/home">Sign in</Link>
          </Button>

          <button className="flex items-center justify-center gap-2 h-12 rounded-2xl border border-border text-sm font-medium">
            <Fingerprint className="size-4 text-teal" /> Sign in with Face ID
          </button>

          <div className="flex items-center gap-3 my-2">
            <span className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or continue with</span>
            <span className="flex-1 h-px bg-border" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {["Google", "Apple", "X"].map((p) => (
              <button key={p} className="h-12 rounded-2xl border border-border text-sm font-medium hover:bg-secondary">{p}</button>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-auto">
            New here? <Link to="/home" className="text-primary font-semibold">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
