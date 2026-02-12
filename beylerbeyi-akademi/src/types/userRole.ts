export type UserRole = "yonetici" | "antrenor" | "oyuncu";

export interface UserRoleInfo {
  user_id: string;
  role: UserRole;
  age_group?: string | null;
}
