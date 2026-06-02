import { createFileRoute } from "@tanstack/react-router";
import { MobileShell, ScreenHeader } from "@/components/MobileShell";
import { Play, BadgeCheck, Clock, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/videos")({
  head: () => ({ meta: [{ title: "Learn · إشارة حياة" }] }),
  component: Videos,
});

const featured = { t: "How to use an EpiPen", c: "Dr. Mona Al-Salem · Pharmacist", d: "5:24", g: "from-primary via-turquoise to-teal" };
const categories = ["All", "Emergency", "Medication", "Sign Lang.", "Pediatric"];
const videos = [
  { t: "Reading prescription labels", c: "Pharmacist Noor", d: "4:12", g: "from-teal to-primary" },
  { t: "CPR for adults", c: "Red Crescent", d: "6:08", g: "from-destructive to-primary" },
  { t: "Signing common symptoms", c: "Verified Interpreter", d: "8:42", g: "from-turquoise to-teal" },
  { t: "Diabetes daily care", c: "Dr. Khaled", d: "5:50", g: "from-success to-teal" },
];

function Videos() {
  return (
    <MobileShell>
      <ScreenHeader title="Learn" subtitle="Pharmacist-verified medical videos" />

      <section className="px-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Search lessons" className="h-12 pl-11 rounded-2xl bg-secondary border-0" />
        </div>
      </section>

      <section className="px-5 mt-5">
        <div className={`relative rounded-3xl overflow-hidden h-52 bg-gradient-to-br ${featured.g} text-white p-5 flex flex-col justify-between shadow-soft`}>
          <div className="absolute inset-0 bg-gradient-aurora opacity-40" />
          <div className="relative flex items-center justify-between">
            <span className="glass border border-white/20 rounded-full px-3 py-1 text-[10px] uppercase tracking-widest">Featured</span>
            <span className="glass border border-white/20 rounded-full px-3 py-1 text-[10px] flex items-center gap-1"><BadgeCheck className="size-3" /> Verified</span>
          </div>
          <div className="relative">
            <p className="text-xl font-bold leading-tight">{featured.t}</p>
            <p className="text-xs text-white/80 mt-1">{featured.c}</p>
            <div className="mt-3 flex items-center gap-3">
              <button className="size-12 rounded-full bg-white text-primary flex items-center justify-center shadow-glow" aria-label="Play"><Play className="size-5 fill-current ml-0.5" /></button>
              <span className="text-xs flex items-center gap-1"><Clock className="size-3" /> {featured.d}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 mt-5">
        <div className="flex gap-2 overflow-x-auto -mx-5 px-5 pb-1">
          {categories.map((c, i) => (
            <button key={c} className={`px-4 h-9 rounded-full text-xs font-medium whitespace-nowrap ${i === 0 ? "bg-gradient-brand text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{c}</button>
          ))}
        </div>
      </section>

      <section className="px-5 mt-5 grid grid-cols-2 gap-3">
        {videos.map((v) => (
          <div key={v.t} className="rounded-2xl overflow-hidden bg-card border border-border shadow-soft">
            <div className={`relative h-24 bg-gradient-to-br ${v.g} flex items-center justify-center`}>
              <Play className="size-7 text-white fill-white" />
              <span className="absolute bottom-1.5 right-1.5 text-[10px] glass border border-white/20 rounded px-1.5 py-0.5 text-white">{v.d}</span>
            </div>
            <div className="p-3">
              <p className="text-sm font-semibold leading-tight">{v.t}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1"><BadgeCheck className="size-3 text-teal" />{v.c}</p>
            </div>
          </div>
        ))}
      </section>
    </MobileShell>
  );
}
