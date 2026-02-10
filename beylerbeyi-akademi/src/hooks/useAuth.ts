"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { UserRole } from "@/types/roles";

interface AuthState {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
}

const supabase = createClient();

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    loading: true,
  });

  const mountedRef = useRef(true);
  const pathname = usePathname();

  const fetchRole = useCallback(
    async (userId: string): Promise<UserRole | null> => {
      try {
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
      } catch {
        return null;
      }
    },
    []
  );

  const loadUser = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mountedRef.current) return;

      if (session?.user) {
        const role = await fetchRole(session.user.id);
        if (mountedRef.current) {
          setState({ user: session.user, role, loading: false });
        }
      } else {
        if (mountedRef.current) {
          setState({ user: null, role: null, loading: false });
        }
      }
    } catch {
      if (mountedRef.current) {
        setState({ user: null, role: null, loading: false });
      }
    }
  }, [fetchRole]);

  // Route değiştiğinde (geri tuşu dahil) yeniden yükle
  useEffect(() => {
    loadUser();
  }, [pathname, loadUser]);

  useEffect(() => {
    mountedRef.current = true;

    // Auth state değişiklikleri
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mountedRef.current) return;
      if (event === "INITIAL_SESSION") return;

      if (session?.user) {
        const role = await fetchRole(session.user.id);
        if (mountedRef.current) {
          setState({ user: session.user, role, loading: false });
        }
      } else {
        if (mountedRef.current) {
          setState({ user: null, role: null, loading: false });
        }
      }
    });

    // Geri tuşu (popstate) handler
    const handlePopState = () => {
      setState((prev) => ({ ...prev, loading: true }));
      loadUser();
    };

    window.addEventListener("popstate", handlePopState);

    // Sayfa visibility değişikliği (tab'a geri dönme)
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadUser();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchRole, loadUser]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setState({ user: null, role: null, loading: false });
    window.location.href = "/login";
  };

  return {
    ...state,
    signOut,
  };
}
