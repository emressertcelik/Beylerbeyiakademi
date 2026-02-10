import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/roles";

/**
 * Server Component veya Server Action içinde
 * giriş yapmış kullanıcının rolünü döndürür.
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Rol bilgisi alınamadı:", error.message);
    return null;
  }

  return data?.role as UserRole;
}

/**
 * Server tarafında yetki kontrolü yapar.
 * Yetkisiz erişimde hata fırlatır.
 */
export async function requireRole(requiredRole: UserRole): Promise<UserRole> {
  const { hasMinimumRole, ROLE_LABELS } = await import("@/types/roles");
  const role = await getCurrentUserRole();

  if (!role || !hasMinimumRole(role, requiredRole)) {
    throw new Error(
      `Bu işlem için en az '${ROLE_LABELS[requiredRole]}' rolüne sahip olmanız gerekiyor.`
    );
  }

  return role;
}
