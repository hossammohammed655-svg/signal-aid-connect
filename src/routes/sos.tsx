import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Phone, Building2, Ambulance, Users } from "lucide-react";

export const Route = createFileRoute("/sos")({
  head: () => ({ meta: [{ title: "Emergency · إشارة حياة" }] }),
  component: SOS,
});

function SOS() {
  return (
    <div className="min-h-dvh w-full flex justify-center bg-muted/40">
      <div className="relative w-full max-w-[440px] min-h-dvh bg-gradient-emergency text-white overflow-hidden flex flex-col">
        <div className="absolute -top-20 -left-20 size-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-10 size-80 rounded-full bg-white/10 blur-3xl" />

        <header className="relative px-5 pt-12 pb-4 flex items-center justify-between">
          <Link to="/home" className="size-10 rounded-full glass border border-white/20 flex items-center justify-center" aria-label="Back">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.3em] opacity-80">Emergency Mode</p>
            <p dir="rtl" lang="ar" className="text-sm font-semibold">حالة طارئة</p>
          </div>
          <div className="size-10" />
        </header>

        <div className="relative flex-1 flex flex-col items-center justify-center px-6">
          <p className="text-center text-sm opacity-90 mb-6 text-balance">Hold the button for 3 seconds to alert hospitals, pharmacies and your emergency contacts.</p>

          <div className="relative flex items-center justify-center">
            <span className="absolute size-72 rounded-full bg-white/10 animate-pulse-ring" />
            <span className="absolute size-72 rounded-full bg-white/10 animate-pulse-ring [animation-delay:0.6s]" />
            <button className="relative size-56 rounded-full bg-white text-destructive font-bold text-2xl shadow-2xl flex flex-col items-center justify-center gap-1 active:scale-95 transition">
              <span className="text-5xl tracking-tight">SOS</span>
              <span className="text-xs uppercase tracking-[0.3em] text-destructive/70">Hold</span>
            </button>
          </div>

          <div className="mt-8 glass border border-white/20 rounded-2xl px-4 py-3 flex items-center gap-3">
            <MapPin className="size-4" />
            <div className="text-xs">
              <p className="font-semibold">Sharing live location</p>
              <p className="opacity-80">Riyadh · 24.7136°N, 46.6753°E</p>
            </div>
          </div>
        </div>

        <div className="relative px-5 pb-10 pt-4 grid grid-cols-2 gap-3">
          {[
            { icon: Ambulance, label: "Ambulance", sub: "997" },
            { icon: Building2, label: "Hospital", sub: "Nearest 1.2 km" },
            { icon: Phone, label: "Pharmacy", sub: "Al-Dawaa · 0.4 km" },
            { icon: Users, label: "Family", sub: "3 contacts" },
          ].map(({ icon: I, label, sub }) => (
            <button key={label} className="glass border border-white/20 rounded-2xl p-3 text-left flex items-center gap-3">
              <div className="size-10 rounded-xl bg-white/15 flex items-center justify-center">
                <I className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-[11px] opacity-80">{sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
