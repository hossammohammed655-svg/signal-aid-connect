import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, MapPin, Phone, Building2, Ambulance, Plus, Pencil, Trash2, X, Loader2, Users } from "lucide-react";

export const Route = createFileRoute("/sos")({
  head: () => ({ meta: [{ title: "Emergency · إشارة حياة" }] }),
  component: SOS,
});

type Contact = { id: string; name: string; phone: string };

const COUNTDOWN_SECONDS = 5;

function buildWaMessage(lat: number, lng: number): string {
  return (
    `🚨 طوارئ - أحتاج مساعدة فورية / EMERGENCY - I need immediate help\n` +
    `موقعي / My location: https://maps.google.com/?q=${lat},${lng}`
  );
}

function openExternal(url: string) {
  // Works inside Android WebView and browsers.
  try {
    window.location.href = url;
  } catch {
    window.open(url, "_blank");
  }
}

function SOS() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [editing, setEditing] = useState<Contact | "new" | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load contacts
  useEffect(() => {
    if (!user) return;
    void (async () => {
      const { data } = await supabase
        .from("emergency_contacts")
        .select("id, name, phone")
        .order("created_at", { ascending: true });
      setContacts((data as Contact[]) ?? []);
    })();
  }, [user]);

  // Get GPS once on mount
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setLocationError(t("sos2.locationError"));
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocationError(t("sos2.locationError"));
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 30_000 },
    );
  }, [t]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  function startCountdown() {
    if (countdown !== null) return;
    // refresh location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { enableHighAccuracy: true, timeout: 8_000 },
      );
    }
    setCountdown(COUNTDOWN_SECONDS);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c === null) return null;
        if (c <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          fireSOS();
          return null;
        }
        return c - 1;
      });
    }, 1000);
  }

  function cancelCountdown() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setCountdown(null);
  }

  function fireSOS() {
    const c = coords;
    if (!c) {
      setLocationError(t("sos2.locationError"));
      return;
    }
    const msg = buildWaMessage(c.lat, c.lng);
    const encoded = encodeURIComponent(msg);
    // If we have contacts, open WA per contact with phone in URL; otherwise generic share.
    if (contacts.length === 0) {
      openExternal(`https://wa.me/?text=${encoded}`);
      return;
    }
    // Open the first contact directly; queue the rest in new tabs.
    contacts.forEach((contact, idx) => {
      const phoneDigits = contact.phone.replace(/[^\d]/g, "");
      const url = `https://wa.me/${phoneDigits}?text=${encoded}`;
      if (idx === 0) {
        openExternal(url);
      } else {
        setTimeout(() => window.open(url, "_blank"), 300 * idx);
      }
    });
  }

  function openEdit(c: Contact | "new") {
    setEditing(c);
    setFormError(null);
    if (c === "new") {
      setName("");
      setPhone("");
    } else {
      setName(c.name);
      setPhone(c.phone);
    }
  }

  async function saveContact() {
    if (!user) return;
    if (!name.trim() || !phone.trim()) {
      setFormError(t("sos2.contactError"));
      return;
    }
    if (editing === "new") {
      const { data, error } = await supabase
        .from("emergency_contacts")
        .insert({ user_id: user.id, name: name.trim(), phone: phone.trim() })
        .select("id, name, phone")
        .single();
      if (error) { setFormError(error.message); return; }
      if (data) setContacts((cs) => [...cs, data as Contact]);
    } else if (editing) {
      const { error } = await supabase
        .from("emergency_contacts")
        .update({ name: name.trim(), phone: phone.trim() })
        .eq("id", editing.id);
      if (error) { setFormError(error.message); return; }
      setContacts((cs) => cs.map((c) => (c.id === editing.id ? { ...c, name: name.trim(), phone: phone.trim() } : c)));
    }
    setEditing(null);
  }

  async function deleteContact(id: string) {
    if (!confirm(t("sos2.confirmDelete"))) return;
    await supabase.from("emergency_contacts").delete().eq("id", id);
    setContacts((cs) => cs.filter((c) => c.id !== id));
  }

  return (
    <div className="min-h-dvh w-full flex justify-center bg-muted/40">
      <div className="relative w-full max-w-[440px] min-h-dvh bg-gradient-emergency text-white overflow-hidden flex flex-col">
        <div className="absolute -top-20 -left-20 size-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-10 size-80 rounded-full bg-white/10 blur-3xl" />

        <header className="relative px-5 pt-12 pb-4 flex items-center justify-between">
          <Link to="/home" className="size-10 rounded-full glass border border-white/20 flex items-center justify-center" aria-label="Back">
            <ArrowLeft className="size-5" />
          </Link>
          <p className="text-[10px] uppercase tracking-[0.3em] opacity-80">{t("sos2.title")} · {t("sos.mode")}</p>
          <div className="size-10" />
        </header>

        <div className="relative px-5 pb-6 flex flex-col items-center">
          <p className="text-center text-sm opacity-90 mb-5 text-balance">{t("sos2.subtitle")}</p>

          <div className="relative flex items-center justify-center my-4">
            {countdown === null ? (
              <>
                <span className="absolute size-72 rounded-full bg-white/10 animate-pulse-ring" />
                <button
                  onClick={startCountdown}
                  className="relative size-52 rounded-full bg-white text-destructive font-bold shadow-2xl flex flex-col items-center justify-center gap-1 active:scale-95 transition"
                >
                  <span className="text-5xl tracking-tight">SOS</span>
                  <span className="text-xs uppercase tracking-[0.3em] text-destructive/70">{t("sos2.press")}</span>
                </button>
              </>
            ) : (
              <div className="relative size-52 rounded-full bg-white text-destructive shadow-2xl flex flex-col items-center justify-center gap-2">
                <p className="text-xs uppercase tracking-widest opacity-70">{t("sos2.sending")}</p>
                <p className="text-6xl font-extrabold tabular-nums">{countdown}</p>
                <button
                  onClick={cancelCountdown}
                  className="mt-1 px-4 h-9 rounded-full bg-destructive text-white text-xs font-semibold"
                >
                  {t("sos2.cancel")}
                </button>
              </div>
            )}
          </div>

          <div className="glass border border-white/20 rounded-2xl px-4 py-3 flex items-center gap-3 mt-2">
            <MapPin className="size-4" />
            <div className="text-xs">
              <p className="font-semibold">{t("sos.location")}</p>
              <p className="opacity-80">
                {locating ? t("sos2.locating") :
                  coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` :
                  locationError || t("sos2.locating")}
              </p>
            </div>
          </div>
        </div>

        <div className="relative px-5 pb-4 grid grid-cols-1 gap-2.5">
          <a href="tel:123" className="glass border border-white/20 rounded-2xl p-3 flex items-center gap-3 active:scale-[0.99] transition">
            <div className="size-10 rounded-xl bg-white/15 flex items-center justify-center"><Ambulance className="size-5" /></div>
            <p className="text-sm font-semibold">{t("sos2.callAmbulance")}</p>
          </a>
          <a href="tel:122" className="glass border border-white/20 rounded-2xl p-3 flex items-center gap-3 active:scale-[0.99] transition">
            <div className="size-10 rounded-xl bg-white/15 flex items-center justify-center"><Phone className="size-5" /></div>
            <p className="text-sm font-semibold">{t("sos2.callPolice")}</p>
          </a>
          <a
            href={coords ? `https://www.google.com/maps/search/hospital/@${coords.lat},${coords.lng},15z` : "https://www.google.com/maps/search/hospital"}
            target="_blank"
            rel="noopener noreferrer"
            className="glass border border-white/20 rounded-2xl p-3 flex items-center gap-3 active:scale-[0.99] transition"
          >
            <div className="size-10 rounded-xl bg-white/15 flex items-center justify-center"><Building2 className="size-5" /></div>
            <p className="text-sm font-semibold">{t("sos2.findHospital")}</p>
          </a>
        </div>

        {/* Emergency contacts */}
        <div className="relative px-5 pb-10 pt-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users className="size-4" />
              <p className="text-sm font-semibold">{t("sos2.contacts")}</p>
            </div>
            <button
              onClick={() => openEdit("new")}
              disabled={contacts.length >= 5}
              className="text-xs font-semibold rounded-full bg-white text-destructive px-3 h-8 flex items-center gap-1 disabled:opacity-50"
            >
              <Plus className="size-3.5" /> {t("sos2.addContact")}
            </button>
          </div>
          <p className="text-[11px] opacity-75 mb-3">{t("sos2.contactsHelp")}</p>

          {contacts.length === 0 ? (
            <p className="text-xs opacity-80 glass border border-white/20 rounded-2xl p-3">{t("sos2.noContacts")}</p>
          ) : (
            <ul className="space-y-2">
              {contacts.map((c) => (
                <li key={c.id} className="glass border border-white/20 rounded-2xl p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{c.name}</p>
                    <p dir="ltr" className="text-[11px] opacity-80 truncate">{c.phone}</p>
                  </div>
                  <button onClick={() => openEdit(c)} aria-label={t("sos2.edit")} className="size-8 rounded-lg bg-white/15 flex items-center justify-center"><Pencil className="size-4" /></button>
                  <button onClick={() => deleteContact(c.id)} aria-label={t("sos2.delete")} className="size-8 rounded-lg bg-white/15 flex items-center justify-center"><Trash2 className="size-4" /></button>
                </li>
              ))}
            </ul>
          )}
          {contacts.length >= 5 && (
            <p className="text-[11px] opacity-80 mt-2">{t("sos2.maxContacts")}</p>
          )}
        </div>

        {/* Edit/Add modal */}
        {editing !== null && (
          <div className="absolute inset-0 z-50 bg-black/50 flex items-end justify-center" onClick={() => setEditing(null)}>
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[440px] bg-background text-foreground rounded-t-3xl p-5 space-y-4 animate-fade-in"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold">{editing === "new" ? t("sos2.addContact") : t("sos2.edit")}</p>
                <button onClick={() => setEditing(null)} aria-label="Close" className="size-8 rounded-full bg-secondary flex items-center justify-center"><X className="size-4" /></button>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">{t("sos2.contactName")} · الاسم</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 px-4 rounded-2xl bg-secondary border-0 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">{t("sos2.contactPhone")} · الهاتف</label>
                <input
                  type="tel"
                  dir="ltr"
                  placeholder="+9665XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-12 px-4 rounded-2xl bg-secondary border-0 outline-none"
                />
              </div>
              {formError && <p className="text-sm text-destructive">{formError}</p>}
              <div className="flex gap-2 pt-2">
                <button onClick={() => setEditing(null)} className="flex-1 h-12 rounded-2xl border border-border font-semibold">{t("sos2.cancelEdit")}</button>
                <button onClick={saveContact} className="flex-1 h-12 rounded-2xl bg-gradient-brand text-primary-foreground font-semibold">{t("sos2.save")}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
