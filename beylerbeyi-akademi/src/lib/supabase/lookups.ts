import { createClient } from "@/lib/supabase/client";

/* ──────────────── Types ──────────────── */

export interface LookupItem {
  id: string;
  value: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Lookups {
  positions: LookupItem[];
  feet: LookupItem[];
  ageGroups: LookupItem[];
  seasons: LookupItem[];
  participationStatuses: LookupItem[];
}

type LookupTable =
  | "lookup_positions"
  | "lookup_feet"
  | "lookup_age_groups"
  | "lookup_seasons"
  | "lookup_participation_statuses";

/* ──────────────── Helpers ──────────────── */

function getClient() {
  return createClient();
}

function mapRow(row: Record<string, unknown>): LookupItem {
  return {
    id: row.id as string,
    value: row.value as string,
    sortOrder: (row.sort_order as number) ?? 0,
    isActive: (row.is_active as boolean) ?? true,
  };
}

/* ──────────────── Fetch ──────────────── */

async function fetchTable(table: LookupTable): Promise<LookupItem[]> {
  const { data, error } = await getClient()
    .from(table)
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

/** Tüm lookup tablolarını tek seferde çeker. */
export async function fetchAllLookups(): Promise<Lookups> {
  const [positions, feet, ageGroups, seasons, participationStatuses] = await Promise.all([
    fetchTable("lookup_positions"),
    fetchTable("lookup_feet"),
    fetchTable("lookup_age_groups"),
    fetchTable("lookup_seasons"),
    fetchTable("lookup_participation_statuses"),
  ]);
  return { positions, feet, ageGroups, seasons, participationStatuses };
}

/** Tek tablo çekmek için (opsiyonel). */
export async function fetchPositions()  { return fetchTable("lookup_positions");  }
export async function fetchFeet()       { return fetchTable("lookup_feet");       }
export async function fetchAgeGroups()  { return fetchTable("lookup_age_groups"); }
export async function fetchSeasons()    { return fetchTable("lookup_seasons");    }
export async function fetchParticipationStatuses() { return fetchTable("lookup_participation_statuses"); }

/* ──────────────── CRUD ──────────────── */

export async function addLookupItem(
  table: LookupTable,
  value: string,
  sortOrder: number
): Promise<LookupItem> {
  const { data, error } = await getClient()
    .from(table)
    .insert({ value, sort_order: sortOrder, is_active: true })
    .select()
    .single();
  if (error) throw error;
  return mapRow(data);
}

export async function updateLookupItem(
  table: LookupTable,
  id: string,
  updates: { value?: string; sortOrder?: number; isActive?: boolean }
): Promise<LookupItem> {
  const payload: Record<string, unknown> = {};
  if (updates.value !== undefined) payload.value = updates.value;
  if (updates.sortOrder !== undefined) payload.sort_order = updates.sortOrder;
  if (updates.isActive !== undefined) payload.is_active = updates.isActive;

  const { data, error } = await getClient()
    .from(table)
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return mapRow(data);
}

export async function deleteLookupItem(
  table: LookupTable,
  id: string
): Promise<void> {
  const { error } = await getClient().from(table).delete().eq("id", id);
  if (error) throw error;
}
