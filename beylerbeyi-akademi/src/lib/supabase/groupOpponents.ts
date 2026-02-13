// groupOpponents.ts
// Supabase'den grup rakiplerini çekmek ve eklemek için fonksiyonlar
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export interface GroupOpponent {
  id: string;
  season: string;
  age_group: string;
  group_number: number;
  opponent: string;
  created_at: string;
  updated_at: string;
}

export async function fetchGroupOpponents(season: string, age_group: string, group_number?: number): Promise<GroupOpponent[]> {
  let query = supabase
    .from("group_opponents")
    .select("*")
    .eq("season", season)
    .eq("age_group", age_group);
  if (group_number !== undefined) {
    query = query.eq("group_number", group_number);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data as GroupOpponent[];
}

export async function addGroupOpponent(opponent: Omit<GroupOpponent, "id" | "created_at" | "updated_at">): Promise<GroupOpponent> {
  const { data, error } = await supabase
    .from("group_opponents")
    .insert([opponent])
    .select()
    .single();
  if (error) throw error;
  return data as GroupOpponent;
}

export async function deleteGroupOpponent(id: string): Promise<void> {
  const { error } = await supabase
    .from("group_opponents")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
