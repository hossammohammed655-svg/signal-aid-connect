import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { OnboardingTutorial } from "@/components/OnboardingTutorial";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

type TutorialContextValue = {
  openTutorial: () => void;
};

const TutorialContext = createContext<TutorialContextValue | null>(null);

export function useTutorial() {
  const ctx = useContext(TutorialContext);
  if (!ctx) throw new Error("useTutorial must be used within TutorialProvider");
  return ctx;
}

export function TutorialProvider({ children }: { children: ReactNode }) {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [forced, setForced] = useState(false);
  const [completing, setCompleting] = useState(false);

  const shouldShow =
    !loading && !completing && !!user && !!profile && (!profile.has_seen_tutorial || forced);

  const finishTutorial = useCallback(async () => {
    if (!user || completing) return;
    setCompleting(true);
    try {
      await supabase.from("profiles").update({ has_seen_tutorial: true }).eq("id", user.id);
      await refreshProfile();
      setForced(false);
      navigate({ to: "/home", replace: true });
    } finally {
      setCompleting(false);
    }
  }, [user, completing, refreshProfile, navigate]);

  const openTutorial = useCallback(() => {
    setForced(true);
  }, []);

  useEffect(() => {
    if (!forced && profile?.has_seen_tutorial) {
      setCompleting(false);
    }
  }, [forced, profile?.has_seen_tutorial]);

  const value = useMemo(() => ({ openTutorial }), [openTutorial]);

  return (
    <TutorialContext.Provider value={value}>
      {children}
      {shouldShow && <OnboardingTutorial onDone={finishTutorial} />}
    </TutorialContext.Provider>
  );
}
