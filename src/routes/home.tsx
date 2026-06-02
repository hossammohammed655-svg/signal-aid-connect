import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { Hand, Siren, Stethoscope, Pill, Video, FileText, Bell, ChevronRight, Activity } from "lucide-react";

export const Route = createFileRoute("/home")({
  head: () => ({ meta: [{ title: "Home · إشارة حياة" }] }),
  component: Home,
});

const features = [
  { to: "/translate", label: "Sign Language", sub: "Live translation", icon: Hand, tone: "bg-gradient-brand text-primary-foreground" },
  { to: "/sos", label: "Emergency SOS", sub: "Tap for help", icon: Siren, tone: "bg-gradient-emergency text-white" },
  { to: "/symptoms", label: "Symptom Check", sub: "AI risk score", icon: Stethoscope, tone: "bg-success/30 text-foreground" },
  { to: "/drugs", label: "Drug & Food", sub: "Interactions", icon: Pill, tone: "bg-teal/20 text-foreground" },
] as const;

function Home() {
  return (
    <MobileShell>
      <div className="bg-gradient-brand text-primary-foreground rounded-b-[2rem] px-5 pt-12 pb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-aurora opacity-40" />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <p className="text-sm text-primary-foreground/80">Good morning</p>
            <h1 className="text-2xl font-bold mt-0.5">Layla Hassan</h1>
            <p dir="rtl" lang="ar" className="text-sm text-primary-foreground/80 mt-1">كيف نستطيع مساعدتك اليوم؟</p>
          </div>
          <button className="relative size-11 rounded-full glass border border-white/20 flex items-center justify-center" aria-label="Notifications">
            <Bell className="size-5" />
            <span className="absolute top-2 right-2 size-2 rounded-full bg-warning" />
          </button>
        </div>

        <div className="relative z-10 mt-6 glass rounded-2xl p-4 border border-white/20 flex items-center gap-3">
          <div className="size-11 rounded-xl bg-white/15 flex items-center justify-center">
            <Activity className="size-5 animate-heartbeat" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-primary-foreground/80">Today's vitals</p>
            <p className="text-base font-semibold">Heart 78 bpm · SpO₂ 98%</p>
          </div>
          <ChevronRight className="size-4 opacity-70" />
        </div>
      </div>

      <section className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">Quick actions</h2>
          <span dir="rtl" lang="ar" className="text-xs text-muted-foreground">إجراءات سريعة</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {features.map(({ to, label, sub, icon: Icon, tone }) => (
            <Link key={to} to={to} className={`relative rounded-3xl p-4 h-32 flex flex-col justify-between overflow-hidden shadow-soft ${tone}`}>
              <Icon className="size-7" />
              <div>
                <p className="font-semibold leading-tight">{label}</p>
                <p className="text-xs opacity-80">{sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-5 mt-7">
        <Link to="/sos" className="block bg-gradient-emergency text-white rounded-3xl p-5 shadow-soft relative overflow-hidden">
          <div className="absolute -right-6 -top-6 size-32 rounded-full bg-white/10 blur-2xl" />
          <div className="flex items-center gap-4 relative">
            <div className="relative">
              <div className="size-14 rounded-full bg-white/20 flex items-center justify-center">
                <Siren className="size-7 animate-heartbeat" />
              </div>
              <span className="absolute inset-0 rounded-full border-2 border-white/40 animate-pulse-ring" />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-widest opacity-80">Emergency</p>
              <p className="text-lg font-bold">Tap once for instant help</p>
              <p className="text-xs opacity-80">GPS · Hospital · Family</p>
            </div>
            <ChevronRight className="size-5" />
          </div>
        </Link>
      </section>

      <section className="px-5 mt-7">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">Continue learning</h2>
          <Link to="/videos" className="text-xs text-primary font-medium">See all</Link>
        </div>
        <div className="flex gap-3 overflow-x-auto -mx-5 px-5 pb-2 snap-x">
          {[
            { t: "CPR basics", c: "Dr. Yousef · 4 min", g: "from-teal to-primary" },
            { t: "Read prescriptions", c: "Pharmacist · 6 min", g: "from-primary to-turquoise" },
            { t: "Sign for symptoms", c: "Verified · 8 min", g: "from-turquoise to-teal" },
          ].map((v) => (
            <Link to="/videos" key={v.t} className="snap-start min-w-[68%] rounded-3xl overflow-hidden shadow-soft border border-border bg-card">
              <div className={`h-28 bg-gradient-to-br ${v.g} flex items-center justify-center text-primary-foreground`}>
                <Video className="size-8" />
              </div>
              <div className="p-3">
                <p className="font-semibold text-sm">{v.t}</p>
                <p className="text-xs text-muted-foreground">{v.c}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-5 mt-7">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">Recent session</h2>
          <Link to="/reports" className="text-xs text-primary font-medium">View all</Link>
        </div>
        <Link to="/reports" className="block rounded-3xl p-4 bg-card border border-border shadow-soft flex items-center gap-3">
          <div className="size-11 rounded-xl bg-success/30 text-foreground flex items-center justify-center">
            <FileText className="size-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Pharmacy consultation</p>
            <p className="text-xs text-muted-foreground">Yesterday · Pharmacist Noor</p>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </Link>
      </section>
    </MobileShell>
  );
}
