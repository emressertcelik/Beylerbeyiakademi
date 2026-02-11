import { createClient } from "./client";
import { Match, MatchPlayerStat, MatchStatus } from "@/types/match";

function getClient() {
  return createClient();
}

// ===== DB → Frontend Mapping =====

interface DbMatchPlayerStat {
  id: string;
  match_id: string;
  player_id: string;
  player_name: string;
  jersey_number: number;
  position: string;
  minutes_played: number;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  goals_conceded: number;
  clean_sheet: boolean;
  rating: number | null;
}

interface DbMatch {
  id: string;
  date: string;
  season: string;
  age_group: string;
  opponent: string;
  home_away: string;
  status: string;
  score_home: number;
  score_away: number;
  result: string;
  venue: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  match_player_stats: DbMatchPlayerStat[];
}

function mapDbToMatch(db: DbMatch): Match {
  const stats: MatchPlayerStat[] = (db.match_player_stats ?? []).map((s) => ({
    playerId: s.player_id,
    playerName: s.player_name,
    jerseyNumber: s.jersey_number,
    position: s.position,
    minutesPlayed: s.minutes_played,
    goals: s.goals,
    assists: s.assists,
    yellowCards: s.yellow_cards,
    redCards: s.red_cards,
    goalsConceded: s.goals_conceded,
    cleanSheet: s.clean_sheet,
    rating: s.rating ?? undefined,
  }));

  return {
    id: db.id,
    date: db.date,
    season: db.season,
    ageGroup: db.age_group,
    opponent: db.opponent,
    homeAway: db.home_away as "home" | "away",
    status: (db.status || "played") as MatchStatus,
    scoreHome: db.score_home,
    scoreAway: db.score_away,
    result: db.result as Match["result"],
    venue: db.venue || undefined,
    notes: db.notes || undefined,
    playerStats: stats,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

// ===== FETCH =====

export async function fetchMatches(): Promise<Match[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("matches")
    .select(`
      *,
      match_player_stats ( * )
    `)
    .order("date", { ascending: false });

  if (error) throw error;
  return (data as unknown as DbMatch[]).map(mapDbToMatch);
}

// ===== CREATE =====

export async function createMatch(match: Match): Promise<Match> {
  const supabase = getClient();

  // 1) Maçı ekle
  const { data: newMatch, error: matchErr } = await supabase
    .from("matches")
    .insert({
      id: match.id,
      date: match.date,
      season: match.season,
      age_group: match.ageGroup,
      opponent: match.opponent,
      home_away: match.homeAway,
      status: match.status,
      score_home: match.scoreHome,
      score_away: match.scoreAway,
      result: match.result,
      venue: match.venue || null,
      notes: match.notes || null,
    })
    .select()
    .single();

  if (matchErr) throw matchErr;

  // 2) Oyuncu istatistiklerini ekle
  if (match.playerStats.length > 0) {
    const statsRows = match.playerStats.map((s) => ({
      match_id: newMatch.id,
      player_id: s.playerId,
      player_name: s.playerName,
      jersey_number: s.jerseyNumber,
      position: s.position,
      minutes_played: s.minutesPlayed,
      goals: s.goals,
      assists: s.assists,
      yellow_cards: s.yellowCards,
      red_cards: s.redCards,
      goals_conceded: s.goalsConceded,
      clean_sheet: s.cleanSheet,
      rating: s.rating ?? null,
    }));

    const { error: statsErr } = await supabase
      .from("match_player_stats")
      .insert(statsRows);

    if (statsErr) throw statsErr;
  }

  // 3) Tam maçı geri getir
  const { data: full, error: fetchErr } = await supabase
    .from("matches")
    .select(`*, match_player_stats ( * )`)
    .eq("id", newMatch.id)
    .single();

  if (fetchErr) throw fetchErr;
  return mapDbToMatch(full as unknown as DbMatch);
}

// ===== UPDATE =====

export async function updateMatch(match: Match): Promise<Match> {
  const supabase = getClient();

  // 1) Maç bilgilerini güncelle
  const { error: matchErr } = await supabase
    .from("matches")
    .update({
      date: match.date,
      season: match.season,
      age_group: match.ageGroup,
      opponent: match.opponent,
      home_away: match.homeAway,
      status: match.status,
      score_home: match.scoreHome,
      score_away: match.scoreAway,
      result: match.result,
      venue: match.venue || null,
      notes: match.notes || null,
    })
    .eq("id", match.id);

  if (matchErr) throw matchErr;

  // 2) Eski istatistikleri sil, yenilerini ekle (replace strategy)
  const { error: delErr } = await supabase
    .from("match_player_stats")
    .delete()
    .eq("match_id", match.id);

  if (delErr) throw delErr;

  if (match.playerStats.length > 0) {
    const statsRows = match.playerStats.map((s) => ({
      match_id: match.id,
      player_id: s.playerId,
      player_name: s.playerName,
      jersey_number: s.jerseyNumber,
      position: s.position,
      minutes_played: s.minutesPlayed,
      goals: s.goals,
      assists: s.assists,
      yellow_cards: s.yellowCards,
      red_cards: s.redCards,
      goals_conceded: s.goalsConceded,
      clean_sheet: s.cleanSheet,
      rating: s.rating ?? null,
    }));

    const { error: statsErr } = await supabase
      .from("match_player_stats")
      .insert(statsRows);

    if (statsErr) throw statsErr;
  }

  // 3) Tam maçı geri getir
  const { data: full, error: fetchErr } = await supabase
    .from("matches")
    .select(`*, match_player_stats ( * )`)
    .eq("id", match.id)
    .single();

  if (fetchErr) throw fetchErr;
  return mapDbToMatch(full as unknown as DbMatch);
}

// ===== DELETE =====

export async function deleteMatch(matchId: string): Promise<void> {
  const supabase = getClient();
  // match_player_stats CASCADE ile otomatik silinir
  const { error } = await supabase
    .from("matches")
    .delete()
    .eq("id", matchId);

  if (error) throw error;
}
