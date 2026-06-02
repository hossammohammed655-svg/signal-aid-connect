import { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Activity, Video, FileText, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/symptoms", label: "Symptoms", icon: Activity },
  { to: "/videos", label: "Learn", icon: Video },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function MobileShell({ children, hideNav = false }: { children: ReactNode; hideNav?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-dvh w-full flex justify-center bg-muted/40">
      <div className="relative w-full max-w-[440px] min-h-dvh bg-background flex flex-col overflow-hidden">
        <main className="flex-1 pb-28">{children}</main>
        {!hideNav && (
          <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-[420px] z-40">
            <div className="glass border border-border/60 rounded-3xl px-2 py-2 shadow-soft flex items-center justify-between">
              {tabs.map(({ to, label, icon: Icon }) => {
                const active = pathname === to || (to === "/home" && pathname === "/");
                return (
                  <Link
                    key={to}
                    to={to}
                    className={cn(
                      "flex flex-col items-center justify-center gap-0.5 rounded-2xl px-3 py-2 min-w-12 transition-all",
                      active ? "bg-gradient-brand text-primary-foreground shadow-sog" : "text-muted-foreground"
                    )}
                    aria-label={label}
                  >
                    <Icon className="size-5" strokeWidth={active ? 2.4 : 2} />
                    <span className={cn("text-[10px] font-medium", active ? "opacity-100" : "opacity-70")}>{label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}

export function ScreenHeader({
  title, subtitle, action, gradient = false,
}: { title: string; subtitle?: string; action?: ReactNode; gradient?: boolean }) {
  return (
    <header className={cn("px-5 pt-12 pb-5", gradient && "bg-gradient-brand text-primary-foreground rounded-b-[2rem]")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-balance">{title}</h1>
          {subtitle && <p className={cn("text-sm mt-1", gradient ? "text-primary-foreground/80" : "text-muted-foreground")}>{subtitle}</p>}
        </div>
        {action}
      </div>
    </header>
  );
}
