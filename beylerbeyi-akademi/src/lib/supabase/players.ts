import { createClient } from "./client";
import { Player, SkillLog, BodyLog } from "@/types/player";

// Her çağrıda taze client oluştur (auth state güncel kalsın)
function getClient() {
  return createClient();
}

// ===== DB → Frontend Mapping =====

interface TacticalRow {
  positioning: number; passing: number; crossing: number; shooting: number;
  dribbling: number; heading: number; tackling: number; marking: number; game_reading: number;
}

interface AthleticRow {
  speed: number; strength: number; stamina: number; agility: number;
  jumping: number; balance: number; flexibility: number;
}

interface DbPlayer {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  age_group: string;
  position: string;
  foot: string;
  jersey_number: number;
  height: number;
  weight: number;
  seasons: string[];
  photo: string | null;
  phone: string | null;
  parent_phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  player_previous_teams: { id: string; team_name: string; years: string; sort_order: number }[] | { id: string; team_name: string; years: string; sort_order: number };
  player_tactical_skills: TacticalRow[] | TacticalRow | null;
  player_athletic_skills: AthleticRow[] | AthleticRow | null;
}

// Supabase UNIQUE FK'da tek object, normal FK'da array dönebilir — ikisini de handle et
function extractFirst<T>(data: T[] | T | null | undefined): T | undefined {
  if (!data) return undefined;
  if (Array.isArray(data)) return data[0];
  return data;
}

function mapDbToPlayer(db: DbPlayer): Player {
  const tactical = extractFirst(db.player_tactical_skills);
  const athletic = extractFirst(db.player_athletic_skills);
  const prevTeams = db.player_previous_teams
    ? (Array.isArray(db.player_previous_teams) ? db.player_previous_teams : [db.player_previous_teams])
    : [];

  return {
    id: db.id,
    firstName: db.first_name,
    lastName: db.last_name,
    birthDate: db.birth_date,
    ageGroup: db.age_group as Player["ageGroup"],
    position: db.position as Player["position"],
    foot: db.foot as Player["foot"],
    jerseyNumber: db.jersey_number,
    height: db.height,
    weight: db.weight,
    seasons: db.seasons || [],
    photo: db.photo || undefined,
    phone: db.phone || undefined,
    parentPhone: db.parent_phone || undefined,
    notes: db.notes || undefined,
    previousTeams: prevTeams
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((pt) => ({ team: pt.team_name, years: pt.years })),
    stats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, goalsConceded: 0, cleanSheets: 0, minutesPlayed: 0 },
    tactical: tactical
      ? { positioning: tactical.positioning, passing: tactical.passing, crossing: tactical.crossing, shooting: tactical.shooting, dribbling: tactical.dribbling, heading: tactical.heading, tackling: tactical.tackling, marking: tactical.marking, gameReading: tactical.game_reading }
      : { positioning: 5, passing: 5, crossing: 5, shooting: 5, dribbling: 5, heading: 5, tackling: 5, marking: 5, gameReading: 5 },
    athletic: athletic
      ? { speed: athletic.speed, strength: athletic.strength, stamina: athletic.stamina, agility: athletic.agility, jumping: athletic.jumping, balance: athletic.balance, flexibility: athletic.flexibility }
      : { speed: 5, strength: 5, stamina: 5, agility: 5, jumping: 5, balance: 5, flexibility: 5 },
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

// ===== FETCH =====

export async function fetchPlayers(): Promise<Player[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Oyuncular yüklenirken hata:", error);
    throw error;
  }

  return (data as unknown as DbPlayer[]).map(mapDbToPlayer);
}

// ===== CREATE =====

export async function createPlayer(player: Player): Promise<Player> {
  const supabase = getClient();
  // 1) Insert player
  const { data: inserted, error: playerError } = await supabase
    .from("players")
    .insert({
      first_name: player.firstName,
      last_name: player.lastName,
      birth_date: player.birthDate,
      age_group: player.ageGroup,
      position: player.position,
      foot: player.foot,
      jersey_number: player.jerseyNumber,
      height: player.height,
      weight: player.weight,
      seasons: player.seasons,
      photo: player.photo || null,
      phone: player.phone || null,
      parent_phone: player.parentPhone || null,
      notes: player.notes || null,
    })
    .select()
    .single();

  if (playerError || !inserted) {
    console.error("Oyuncu oluşturulurken hata:", playerError);
    throw playerError;
  }

  const playerId = inserted.id;

  // 2) Insert previous teams
  if (player.previousTeams && player.previousTeams.length > 0) {
    const teamsToInsert = player.previousTeams.map((pt, i) => ({
      player_id: playerId,
      team_name: pt.team,
      years: pt.years,
      sort_order: i,
    }));
    const { error: teamsError } = await supabase
      .from("player_previous_teams")
      .insert(teamsToInsert);
    if (teamsError) console.error("Önceki takımlar eklenirken hata:", teamsError);
  }

  // 3) Update tactical skills (trigger zaten oluşturdu, güncelle)
  const { error: tacticalError } = await supabase
    .from("player_tactical_skills")
    .update({
      positioning: player.tactical.positioning,
      passing: player.tactical.passing,
      crossing: player.tactical.crossing,
      shooting: player.tactical.shooting,
      dribbling: player.tactical.dribbling,
      heading: player.tactical.heading,
      tackling: player.tactical.tackling,
      marking: player.tactical.marking,
      game_reading: player.tactical.gameReading,
    })
    .eq("player_id", playerId);
  if (tacticalError) console.error("Taktik beceriler güncellenirken hata:", tacticalError);

  // 4) Update athletic skills (trigger zaten oluşturdu, güncelle)
  const { error: athleticError } = await supabase
    .from("player_athletic_skills")
    .update({
      speed: player.athletic.speed,
      strength: player.athletic.strength,
      stamina: player.athletic.stamina,
      agility: player.athletic.agility,
      jumping: player.athletic.jumping,
      balance: player.athletic.balance,
      flexibility: player.athletic.flexibility,
    })
    .eq("player_id", playerId);
  if (athleticError) console.error("Atletik beceriler güncellenirken hata:", athleticError);

  // Tam veriyi geri çek
  return await fetchPlayerById(playerId);
}

// ===== UPDATE =====

export async function updatePlayer(player: Player): Promise<Player> {
  const supabase = getClient();
  // 1) Update player row
  const { error: playerError } = await supabase
    .from("players")
    .update({
      first_name: player.firstName,
      last_name: player.lastName,
      birth_date: player.birthDate,
      age_group: player.ageGroup,
      position: player.position,
      foot: player.foot,
      jersey_number: player.jerseyNumber,
      height: player.height,
      weight: player.weight,
      seasons: player.seasons,
      photo: player.photo || null,
      phone: player.phone || null,
      parent_phone: player.parentPhone || null,
      notes: player.notes || null,
    })
    .eq("id", player.id);

  if (playerError) {
    console.error("Oyuncu güncellenirken hata:", playerError);
    throw playerError;
  }

  // 2) Previous teams: sil ve yeniden yaz
  await supabase
    .from("player_previous_teams")
    .delete()
    .eq("player_id", player.id);

  if (player.previousTeams && player.previousTeams.length > 0) {
    const teamsToInsert = player.previousTeams.map((pt, i) => ({
      player_id: player.id,
      team_name: pt.team,
      years: pt.years,
      sort_order: i,
    }));
    await supabase
      .from("player_previous_teams")
      .insert(teamsToInsert);
  }

  // 3) Tactical skills
  const { error: tacticalErr } = await supabase
    .from("player_tactical_skills")
    .update({
      positioning: player.tactical.positioning,
      passing: player.tactical.passing,
      crossing: player.tactical.crossing,
      shooting: player.tactical.shooting,
      dribbling: player.tactical.dribbling,
      heading: player.tactical.heading,
      tackling: player.tactical.tackling,
      marking: player.tactical.marking,
      game_reading: player.tactical.gameReading,
    })
    .eq("player_id", player.id);
  if (tacticalErr) {
    console.error("Taktik beceriler güncellenirken hata:", tacticalErr);
    throw tacticalErr;
  }

  // 4) Athletic skills
  const { error: athleticErr } = await supabase
    .from("player_athletic_skills")
    .update({
      speed: player.athletic.speed,
      strength: player.athletic.strength,
      stamina: player.athletic.stamina,
      agility: player.athletic.agility,
      jumping: player.athletic.jumping,
      balance: player.athletic.balance,
      flexibility: player.athletic.flexibility,
    })
    .eq("player_id", player.id);
  if (athleticErr) {
    console.error("Atletik beceriler güncellenirken hata:", athleticErr);
    throw athleticErr;
  }

  return await fetchPlayerById(player.id);
}

// ===== DELETE =====

export async function deletePlayer(playerId: string): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase
    .from("players")
    .delete()
    .eq("id", playerId);

  if (error) {
    console.error("Oyuncu silinirken hata:", error);
    throw error;
  }
}

// ===== FETCH BY ID =====

async function fetchPlayerById(playerId: string): Promise<Player> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("players")
    .select(`
      *,
      player_previous_teams ( id, team_name, years, sort_order ),
      player_tactical_skills ( positioning, passing, crossing, shooting, dribbling, heading, tackling, marking, game_reading ),
      player_athletic_skills ( speed, strength, stamina, agility, jumping, balance, flexibility )
    `)
    .eq("id", playerId)
    .single();

  if (error || !data) {
    console.error("Oyuncu çekilirken hata:", error);
    throw error;
  }

  return mapDbToPlayer(data as unknown as DbPlayer);
}

// ===== SKILL LOGS =====

export async function fetchSkillLogs(playerId: string): Promise<SkillLog[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("player_skill_logs")
    .select("id, player_id, category, skill_name, old_value, new_value, changed_at")
    .eq("player_id", playerId)
    .order("changed_at", { ascending: false });

  if (error) {
    console.error("Beceri logları yüklenirken hata:", error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    playerId: row.player_id,
    category: row.category as SkillLog["category"],
    skillName: row.skill_name,
    oldValue: row.old_value,
    newValue: row.new_value,
    changedAt: row.changed_at,
  }));
}

// ===== BODY LOGS =====

export async function fetchBodyLogs(playerId: string): Promise<BodyLog[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("player_body_logs")
    .select("id, player_id, measurement, old_value, new_value, changed_at")
    .eq("player_id", playerId)
    .order("changed_at", { ascending: false });

  if (error) {
    console.error("Boy/kilo logları yüklenirken hata:", error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    playerId: row.player_id,
    measurement: row.measurement as BodyLog["measurement"],
    oldValue: row.old_value,
    newValue: row.new_value,
    changedAt: row.changed_at,
  }));
}
