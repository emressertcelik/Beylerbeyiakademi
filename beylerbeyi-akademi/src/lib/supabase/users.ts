import { createClient } from "./client";
import { UserRole } from "@/types/userRole";

export interface SupabaseUser {
  id: string;
  email: string;
  role?: UserRole | "rolsüz";
  age_group?: string | null;
}

// Tüm kullanıcıları ve rollerini getir (auth.users + user_roles left join)
// Eğer ageGroup parametresi verilirse, sadece o yaş grubundaki kullanıcıları döner
export async function fetchAllUsersWithRoles(ageGroup?: string): Promise<SupabaseUser[]> {
  const supabase = createClient();
  let query = supabase
    .from("app_users")
    .select("id, email, role, age_group");
  if (ageGroup) {
    query = query.eq("age_group", ageGroup);
  }
  const { data, error } = await query;
  if (error || !data) return [];
  return data.map((row: any) => ({
    id: row.id,
    email: row.email,
    role: row.role || "rolsüz",
    age_group: row.age_group || null,
  }));
}

// Yeni kullanıcı oluştur ve role ata
export async function inviteUserWithRole(email: string, role: UserRole, age_group?: string | null): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  // Kullanıcıyı davet et
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email);
  if (error || !data?.user) return { success: false, error: error?.message };
  // user_roles tablosuna ekle
  const insertData: { user_id: string; role: UserRole; age_group?: string } = { user_id: data.user.id, role };
  if (age_group) insertData.age_group = age_group;
  const { error: roleError } = await supabase
    .from("user_roles")
    .insert([insertData]);
  if (roleError) return { success: false, error: roleError.message };
  return { success: true };
}

// Kullanıcı rolünü güncelle
export async function updateUserRole(user_id: string, role: UserRole): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("user_roles")
    .update({ role })
    .eq("user_id", user_id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// Kullanıcı yaş grubunu güncelle
export async function updateUserAgeGroup(user_id: string, age_group: string | null): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("user_roles")
    .update({ age_group })
    .eq("user_id", user_id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}
