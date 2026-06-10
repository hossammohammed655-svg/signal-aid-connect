import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MobileShell, ScreenHeader } from "@/components/MobileShell";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useTutorial } from "@/contexts/TutorialContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { User, Phone, Mail, LogOut, Globe, Info, GraduationCap, Bell } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile · إشارة حياة" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { t, lang, setLang, isRTL } = useLanguage();
  const { user, profile, refreshProfile } = useAuth();
  const { openTutorial } = useTutorial();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [userType, setUserType] = useState<"patient" | "pharmacist">("patient");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setUserType(profile.user_type || "patient");
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, full_name: fullName, phone, user_type: userType });
    setLoading(false);
    if (error) {
      toast.error(t("login.err.generic"));
    } else {
      toast.success(t("register.success"));
      await refreshProfile();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  return (
    <MobileShell>
      <ScreenHeader
        title={t("profile.title")}
        subtitle={t("profile.settings")}
        gradient
      />

      <div className="px-5 space-y-4 pb-28">
        {/* Profile Card */}
        <Card className="rounded-3xl border-border/60 shadow-soft">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="size-16 rounded-2xl bg-gradient-brand text-primary-foreground flex items-center justify-center">
                <User className="size-7" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-lg truncate">{profile?.full_name || user?.email?.split("@")[0]}</p>
                <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t("profile.memberSince")}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-5">
              <StatCard label={t("profile.sessions")} value="12" />
              <StatCard label={t("profile.reports")} value="5" />
              <StatCard label={t("profile.saved")} value="3" />
            </div>
          </CardContent>
        </Card>

        {/* Account Section */}
        <Card className="rounded-3xl border-border/60 shadow-soft">
          <CardHeader className="px-5 pt-4 pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <User className="size-4" /> {t("profile.care")}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{t("register.fullName")}</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-12 rounded-2xl bg-secondary border-0"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Mail className="size-3" /> {t("register.email")}
              </Label>
              <Input
                value={user?.email || ""}
                disabled
                className="h-12 rounded-2xl bg-muted border-0 text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Phone className="size-3" /> {t("register.phone")}
              </Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12 rounded-2xl bg-secondary border-0"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{t("register.userType")}</Label>
              <Select value={userType} onValueChange={(v) => setUserType(v as "patient" | "pharmacist")}>
                <SelectTrigger className="h-12 rounded-2xl bg-secondary border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">{t("register.patient")}</SelectItem>
                  <SelectItem value="pharmacist">{t("register.pharmacist")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-full h-12 rounded-2xl bg-gradient-brand text-primary-foreground font-semibold"
            >
              {loading ? "..." : t("drugs2.save") || "حفظ / Save"}
            </Button>
          </CardContent>
        </Card>

        {/* Preferences Section */}
        <Card className="rounded-3xl border-border/60 shadow-soft">
          <CardHeader className="px-5 pt-4 pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Globe className="size-4" /> {t("profile.preferences")}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-3">
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="w-full rounded-2xl bg-secondary p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Globe className="size-4 text-muted-foreground" />
                <span className="text-sm">{t("profile.language")}</span>
              </div>
              <span className="text-xs font-semibold text-primary">
                {lang === "en" ? t("profile.arabic") : t("profile.english")}
              </span>
            </button>

            <button
              onClick={openTutorial}
              className="w-full rounded-2xl bg-secondary p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <GraduationCap className="size-4 text-muted-foreground" />
                <div className="text-left">
                  <p className="text-sm">{t("profile.showTutorial")}</p>
                  <p className="text-xs text-muted-foreground">{t("profile.showTutorialSub")}</p>
                </div>
              </div>
            </button>
          </CardContent>
        </Card>

        {/* App Section */}
        <Card className="rounded-3xl border-border/60 shadow-soft">
          <CardHeader className="px-5 pt-4 pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Info className="size-4" /> {t("profile.about")}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <button
              onClick={() => navigate({ to: "/about" })}
              className="w-full rounded-2xl bg-secondary p-4 flex items-center gap-3 text-left"
            >
              <div className="size-10 rounded-xl bg-gradient-brand text-primary-foreground flex items-center justify-center text-sm font-bold">
                SoL
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{isRTL ? "إشارة حياة" : "Signs of Life"}</p>
                <p className="text-xs text-muted-foreground">v1.0.0</p>
              </div>
            </button>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button
          variant="destructive"
          onClick={handleLogout}
          className="w-full h-12 rounded-2xl font-semibold flex items-center gap-2"
        >
          <LogOut className="size-4" />
          {t("profile.signout")}
        </Button>
      </div>
    </MobileShell>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-secondary p-3 text-center">
      <p className="font-bold text-lg">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
