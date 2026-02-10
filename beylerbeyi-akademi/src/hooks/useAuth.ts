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
  const loadingRef = useRef(false);
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
          // AbortError sessizce geç
          if (error.message?.includes("AbortError") || error.message?.includes("aborted")) {
            return null;
          }
          console.error("Rol bilgisi alınamadı:", error.message);
          return null;
        }

        return data?.role as UserRole;
      } catch (err) {
        // AbortError veya diğer hatalar
        if (err instanceof DOMException && err.name === "AbortError") {
          return null;
        }
        return null;
      }
    },
    []
  );

  const loadUser = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      const { data: { session } } = await supabase.auth.getSession();

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
    } catch (err) {
      // AbortError sessizce geç
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      if (mountedRef.current) {
        setState({ user: null, role: null, loading: false });
      }
    } finally {
      loadingRef.current = false;
    }
  }, [fetchRole]);

  // Route değişikliğinde yeniden yükle
  useEffect(() => {
    loadUser();
  }, [pathname, loadUser]);

  useEffect(() => {
    mountedRef.current = true;

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

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [fetchRole]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setState({ user: null, role: null, loading: false });
    window.location.href = "/login";
  };

  return {
    ...state,
    signOut,
  };
}
