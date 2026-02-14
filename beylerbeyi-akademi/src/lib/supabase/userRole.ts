import { createClient } from "./client";
import { UserRoleInfo } from "@/types/userRole";

export async function fetchCurrentUserRole(): Promise<UserRoleInfo | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("user_roles")
    .select("user_id, role, age_group")
    .eq("user_id", user.id)
    .single();
  if (error || !data) return null;
  return data as UserRoleInfo;
}

export async function fetchCurrentUserEmail(): Promise<string | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("app_users")
    .select("email")
    .eq("id", user.id)
    .single();
  if (error || !data) return user.email ?? null;
  return data.email;
}
