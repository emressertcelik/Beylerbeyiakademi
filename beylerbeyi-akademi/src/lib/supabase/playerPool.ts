import { createClient } from "./client";
import { ScoutedPlayer, TrialPlayer, TrialStatus } from "@/types/playerPool";

function getClient() {
  return createClient();
}

// ===== DB → Frontend Mapping =====

interface DbScoutedPlayer {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  current_team: string | null;
  position: string | null;
  reference_person: string | null;
  recorded_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface DbTrialPlayer extends DbScoutedPlayer {
  trial_age_group: string | null;
  trial_date: string | null;
  trial_season: string | null;
  status: TrialStatus;
}

function mapDbToScouted(db: DbScoutedPlayer): ScoutedPlayer {
  return {
    id: db.id,
    firstName: db.first_name,
    lastName: db.last_name,
    birthDate: db.birth_date,
    currentTeam: db.current_team || undefined,
    position: db.position || undefined,
    referencePerson: db.reference_person || undefined,
    recordedBy: db.recorded_by || undefined,
    notes: db.notes || undefined,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

function mapDbToTrial(db: DbTrialPlayer): TrialPlayer {
  return {
    id: db.id,
    firstName: db.first_name,
    lastName: db.last_name,
    birthDate: db.birth_date,
    currentTeam: db.current_team || undefined,
    position: db.position || undefined,
    referencePerson: db.reference_person || undefined,
    recordedBy: db.recorded_by || undefined,
    notes: db.notes || undefined,
    trialAgeGroup: db.trial_age_group || undefined,
    trialDate: db.trial_date || undefined,
    trialSeason: db.trial_season || undefined,
    status: db.status || "beklemede",
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

// ===== SCOUTED PLAYERS =====

export async function fetchScoutedPlayers(): Promise<ScoutedPlayer[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("scouted_players")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("İzlenen oyuncular yüklenirken hata:", error);
    throw error;
  }

  return (data as DbScoutedPlayer[]).map(mapDbToScouted);
}

export async function createScoutedPlayer(
  player: Omit<ScoutedPlayer, "id" | "createdAt" | "updatedAt">
): Promise<ScoutedPlayer> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("scouted_players")
    .insert({
      first_name: player.firstName,
      last_name: player.lastName,
      birth_date: player.birthDate,
      current_team: player.currentTeam || null,
      position: player.position || null,
      reference_person: player.referencePerson || null,
      recorded_by: player.recordedBy || null,
      notes: player.notes || null,
    })
    .select()
    .single();

  if (error || !data) {
    console.error("İzlenen oyuncu oluşturulurken hata:", error);
    throw error;
  }

  return mapDbToScouted(data as DbScoutedPlayer);
}

export async function updateScoutedPlayer(
  player: Omit<ScoutedPlayer, "createdAt" | "updatedAt">
): Promise<ScoutedPlayer> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("scouted_players")
    .update({
      first_name: player.firstName,
      last_name: player.lastName,
      birth_date: player.birthDate,
      current_team: player.currentTeam || null,
      position: player.position || null,
      reference_person: player.referencePerson || null,
      recorded_by: player.recordedBy || null,
      notes: player.notes || null,
    })
    .eq("id", player.id)
    .select()
    .single();

  if (error || !data) {
    console.error("İzlenen oyuncu güncellenirken hata:", error);
    throw error;
  }

  return mapDbToScouted(data as DbScoutedPlayer);
}

export async function deleteScoutedPlayer(id: string): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase
    .from("scouted_players")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("İzlenen oyuncu silinirken hata:", error);
    throw error;
  }
}

// ===== TRIAL PLAYERS =====

export async function fetchTrialPlayers(): Promise<TrialPlayer[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("trial_players")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Deneme oyuncuları yüklenirken hata:", error);
    throw error;
  }

  return (data as DbTrialPlayer[]).map(mapDbToTrial);
}

export async function createTrialPlayer(
  player: Omit<TrialPlayer, "id" | "createdAt" | "updatedAt">
): Promise<TrialPlayer> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("trial_players")
    .insert({
      first_name: player.firstName,
      last_name: player.lastName,
      birth_date: player.birthDate,
      current_team: player.currentTeam || null,
      position: player.position || null,
      reference_person: player.referencePerson || null,
      recorded_by: player.recordedBy || null,
      notes: player.notes || null,
      trial_age_group: player.trialAgeGroup || null,
      trial_date: player.trialDate || null,
      trial_season: player.trialSeason || null,
      status: player.status,
    })
    .select()
    .single();

  if (error || !data) {
    console.error("Deneme oyuncusu oluşturulurken hata:", error);
    throw error;
  }

  return mapDbToTrial(data as DbTrialPlayer);
}

export async function updateTrialPlayer(
  player: Omit<TrialPlayer, "createdAt" | "updatedAt">
): Promise<TrialPlayer> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("trial_players")
    .update({
      first_name: player.firstName,
      last_name: player.lastName,
      birth_date: player.birthDate,
      current_team: player.currentTeam || null,
      position: player.position || null,
      reference_person: player.referencePerson || null,
      recorded_by: player.recordedBy || null,
      notes: player.notes || null,
      trial_age_group: player.trialAgeGroup || null,
      trial_date: player.trialDate || null,
      trial_season: player.trialSeason || null,
      status: player.status,
    })
    .eq("id", player.id)
    .select()
    .single();

  if (error || !data) {
    console.error("Deneme oyuncusu güncellenirken hata:", error);
    throw error;
  }

  return mapDbToTrial(data as DbTrialPlayer);
}

export async function deleteTrialPlayer(id: string): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase
    .from("trial_players")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Deneme oyuncusu silinirken hata:", error);
    throw error;
  }
}
