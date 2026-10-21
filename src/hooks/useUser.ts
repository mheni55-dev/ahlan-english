"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  image: string | null;
}

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function loadUser() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .maybeSingle();

      if (data) {
        setUser(data);
      } else {
        // The profile row is missing — fall back to the auth account so the
        // UI stays consistent with the session.
        const metadata = (authUser.user_metadata ?? {}) as Record<string, unknown>;
        setUser({
          id: authUser.id,
          name: typeof metadata.name === "string" ? metadata.name : "",
          email: authUser.email ?? "",
          role: metadata.role === "admin" ? "admin" : "student",
          phone: typeof metadata.phone === "string" ? metadata.phone : null,
          image: null,
        });
      }
      setLoading(false);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}

export function useSignOut() {
  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }, []);

  return signOut;
}
