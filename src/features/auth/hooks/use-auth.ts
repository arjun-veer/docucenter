"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "../store";
import type { User } from "@/lib/types";

export function useAuth() {
  const { user, isLoading, setUser, setLoading, logout } = useAuthStore();
  const supabase = createClient();

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (authUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, full_name, avatar_url, college_id")
          .eq("user_id", authUser.id)
          .single();

        if (profile) {
          setUser({
            id: authUser.id,
            email: authUser.email || "",
            role: profile.role as User["role"],
            fullName: profile.full_name,
            avatarUrl: profile.avatar_url,
            collegeId: profile.college_id,
          });
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          logout();
        } else if (session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, full_name, avatar_url, college_id")
            .eq("user_id", session.user.id)
            .single();

          if (profile) {
            setUser({
              id: session.user.id,
              email: session.user.email || "",
              role: profile.role as User["role"],
              fullName: profile.full_name,
              avatarUrl: profile.avatar_url,
              collegeId: profile.college_id,
            });
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, isLoading, logout: () => supabase.auth.signOut().then(() => logout()) };
}
