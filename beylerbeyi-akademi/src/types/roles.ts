export type UserRole = "oyuncu" | "antrenor" | "yonetici";

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

// Her rolün Türkçe karşılığı
export const ROLE_LABELS: Record<UserRole, string> = {
  oyuncu: "Oyuncu",
  antrenor: "Antrenör",
  yonetici: "Yönetici",
};

// Rol hiyerarşisi (yüksek sayı = daha fazla yetki)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  oyuncu: 0,
  antrenor: 1,
  yonetici: 2,
};

/**
 * Kullanıcının belirli bir role sahip olup olmadığını kontrol eder.
 * Hiyerarşik kontrol: yonetici her şeye erişebilir.
 */
export function hasMinimumRole(
  userRole: UserRole,
  requiredRole: UserRole
): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
