"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { UserRole } from "@/types/roles";

interface AuthState {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    loading: true,
  });

  const supabase = createClient();

  const fetchRole = useCallback(
    async (userId: string): Promise<UserRole | null> => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Rol bilgisi alınamadı:", error.message);
        return null;
      }

      return data?.role as UserRole;
    },
    [supabase]
  );

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const role = await fetchRole(user.id);
        setState({ user, role, loading: false });
      } else {
        setState({ user: null, role: null, loading: false });
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const role = await fetchRole(session.user.id);
        setState({ user: session.user, role, loading: false });
      } else {
        setState({ user: null, role: null, loading: false });
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchRole]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setState({ user: null, role: null, loading: false });
  };

  return {
    ...state,
    signOut,
  };
}
