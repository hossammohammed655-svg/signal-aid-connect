import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  user_type: "patient" | "pharmacist";
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setTimeout(() => {
          void loadProfile(s.user.id);
        }, 0);
      } else {
        setProfile(null);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) void loadProfile(data.session.user.id);
      setLoading(false);
    });

    async function loadProfile(uid: string) {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, phone, user_type")
        .eq("id", uid)
        .maybeSingle();
      if (data) setProfile(data as Profile);
    }

    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, user, profile, loading };
}
