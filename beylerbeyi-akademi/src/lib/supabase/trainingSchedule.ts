import { createClient } from "./client";
import {
  TrainingSchedule,
  TrainingDetailItem,
  UpsertTrainingSchedule,
  TrainingAttendance,
  AttendanceStatus,
  PlayerSummary,
} from "@/types/trainingSchedule";

function getClient() {
  return createClient();
}

// ─────────────────────────────────────────────────────────────
// Fetch
// ─────────────────────────────────────────────────────────────

/** Belirtilen sezon + tarih aralığındaki tüm program satırlarını döner */
export async function fetchSchedulesForWeek(
  season: string,
  startDate: string,
  endDate: string
): Promise<TrainingSchedule[]> {
  const { data, error } = await getClient()
    .from("training_schedules")
    .select("*")
    .eq("season", season)
    .gte("training_date", startDate)
    .lte("training_date", endDate)
    .order("training_date", { ascending: true });

  if (error) throw error;
  return (data ?? []) as TrainingSchedule[];
}

/** Belirtilen schedule_id'lere ait tüm detay kalemlerini döner */
export async function fetchDetailItemsByScheduleIds(
  scheduleIds: string[]
): Promise<TrainingDetailItem[]> {
  if (scheduleIds.length === 0) return [];

  const { data, error } = await getClient()
    .from("training_detail_items")
    .select("*")
    .in("schedule_id", scheduleIds)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as TrainingDetailItem[];
}

// ─────────────────────────────────────────────────────────────
// Upsert / Delete
// ─────────────────────────────────────────────────────────────

/** Program satırı oluştur veya güncelle (season + age_group + date UNIQUE) */
export async function upsertSchedule(
  payload: UpsertTrainingSchedule
): Promise<TrainingSchedule> {
  const { data, error } = await getClient()
    .from("training_schedules")
    .upsert(
      {
        season: payload.season,
        age_group: payload.age_group,
        training_date: payload.training_date,
        schedule_type: payload.schedule_type,
        training_time: payload.training_time ?? null,
        cell_label: payload.cell_label ?? null,
      },
      { onConflict: "season,age_group,training_date" }
    )
    .select()
    .single();

  if (error) throw error;
  return data as TrainingSchedule;
}

/** Belirtilen schedule'ın tüm detay kalemlerini sil ve yeniden ekle */
export async function replaceDetailItems(
  scheduleId: string,
  items: string[]
): Promise<TrainingDetailItem[]> {
  const client = getClient();

  const { error: delError } = await client
    .from("training_detail_items")
    .delete()
    .eq("schedule_id", scheduleId);
  if (delError) throw delError;

  if (items.length === 0) return [];

  const rows = items
    .filter((c) => c.trim() !== "")
    .map((content, idx) => ({
      schedule_id: scheduleId,
      sort_order: idx,
      content: content.trim(),
    }));

  if (rows.length === 0) return [];

  const { data, error: insError } = await client
    .from("training_detail_items")
    .insert(rows)
    .select();
  if (insError) throw insError;

  return (data ?? []) as TrainingDetailItem[];
}

/** Programı ve bağlı tüm detay kalemlerini sil */
export async function deleteSchedule(scheduleId: string): Promise<void> {
  const { error } = await getClient()
    .from("training_schedules")
    .delete()
    .eq("id", scheduleId);
  if (error) throw error;
}

// ─────────────────────────────────────────────────────────────
// Antrenman haftası numarası (training_week_configs)
// ─────────────────────────────────────────────────────────────

/** Belirtilen sezon + hafta başı için antrenman hafta numarasını döner */
export async function fetchTrainingWeekNumber(
  season: string,
  weekStartDate: string
): Promise<number | null> {
  const { data, error } = await getClient()
    .from("training_week_configs")
    .select("training_week_number")
    .eq("season", season)
    .eq("week_start_date", weekStartDate)
    .maybeSingle();
  if (error) throw error;
  return data?.training_week_number ?? null;
}

/** Antrenman hafta numarasını kaydet (upsert) */
export async function upsertTrainingWeekNumber(
  season: string,
  weekStartDate: string,
  trainingWeekNumber: number
): Promise<void> {
  const { error } = await getClient()
    .from("training_week_configs")
    .upsert(
      { season, week_start_date: weekStartDate, training_week_number: trainingWeekNumber },
      { onConflict: "season,week_start_date" }
    );
  if (error) throw error;
}

// ─────────────────────────────────────────────────────────────
// Antrenman sıra sayacı
// ─────────────────────────────────────────────────────────────

/** Belirtilen sezon içinde, verilen tarihe kadar tüm normal antrenmanları döner */
export async function fetchNormalSessionsUpTo(
  season: string,
  endDate: string
): Promise<Array<{ age_group: string; training_date: string }>> {
  const { data, error } = await getClient()
    .from("training_schedules")
    .select("age_group, training_date")
    .eq("season", season)
    .eq("schedule_type", "normal")
    .lte("training_date", endDate)
    .order("training_date", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Array<{ age_group: string; training_date: string }>;
}

// ─────────────────────────────────────────────────────────────
// Antrenman sayacı offset
// ─────────────────────────────────────────────────────────────

/** Sezon bazında yaş grubu offset'lerini döner */
export async function fetchSessionOffsets(
  season: string
): Promise<Record<string, number>> {
  const { data, error } = await getClient()
    .from("training_session_offsets")
    .select("age_group, offset")
    .eq("season", season);
  if (error) throw error;
  const map: Record<string, number> = {};
  (data ?? []).forEach((row: { age_group: string; offset: number }) => {
    map[row.age_group] = row.offset;
  });
  return map;
}

// ─────────────────────────────────────────────────────────────
// Yoklama (training_attendance)
// ─────────────────────────────────────────────────────────────

/** Belirtilen yaş grubundaki tüm oyuncuları döner */
export async function fetchPlayersByAgeGroupAndSeason(
  ageGroup: string,
  _season: string
): Promise<PlayerSummary[]> {
  const { data, error } = await getClient()
    .from("players")
    .select("id, first_name, last_name, jersey_number, position")
    .eq("age_group", ageGroup)
    .eq("status", "active")
    .order("jersey_number", { ascending: true });
  if (error) throw error;
  return (data ?? []) as PlayerSummary[];
}

/** Belirtilen schedule için tüm yoklama kayıtlarını döner */
export async function fetchAttendanceByScheduleId(
  scheduleId: string
): Promise<TrainingAttendance[]> {
  const { data, error } = await getClient()
    .from("training_attendance")
    .select("*")
    .eq("schedule_id", scheduleId);
  if (error) throw error;
  return (data ?? []) as TrainingAttendance[];
}

/** Oyuncunun yoklama durumunu kaydet veya güncelle */
export async function upsertAttendance(
  scheduleId: string,
  playerId: string,
  status: AttendanceStatus
): Promise<void> {
  const { error } = await getClient()
    .from("training_attendance")
    .upsert(
      { schedule_id: scheduleId, player_id: playerId, status },
      { onConflict: "schedule_id,player_id" }
    );
  if (error) throw error;
}

/** Oyuncunun sezon bazlı antrenman katılım istatistiklerini döner */
export async function fetchPlayerAttendanceStats(
  playerId: string,
  ageGroup: string,
  season: string
): Promise<{ total: number; geldi: number; gelmedi: number; izinli: number; sakat: number }> {
  const client = getClient();

  const { data: schedules, error: sErr } = await client
    .from("training_schedules")
    .select("id")
    .eq("season", season)
    .eq("age_group", ageGroup)
    .eq("schedule_type", "normal");

  if (sErr) throw sErr;
  const ids = (schedules ?? []).map((s: { id: string }) => s.id);
  const total = ids.length;

  if (total === 0) return { total: 0, geldi: 0, gelmedi: 0, izinli: 0, sakat: 0 };

  const { data: att, error: aErr } = await client
    .from("training_attendance")
    .select("status")
    .eq("player_id", playerId)
    .in("schedule_id", ids);

  if (aErr) throw aErr;

  const counts = { geldi: 0, gelmedi: 0, izinli: 0, sakat: 0 };
  (att ?? []).forEach((r: { status: string }) => {
    if (r.status in counts) counts[r.status as keyof typeof counts]++;
  });

  return { total, ...counts };
}

/** Sezon bazında tüm oyuncuların antrenman katılım özetini döner (toplu sorgu) */
export async function fetchSeasonAttendanceSummary(
  season: string
): Promise<{
  totalByAgeGroup: Record<string, number>;
  playerStats: Record<string, { geldi: number; gelmedi: number; izinli: number; sakat: number }>;
}> {
  const client = getClient();

  const { data: schedules, error: sErr } = await client
    .from("training_schedules")
    .select("id, age_group")
    .eq("season", season)
    .eq("schedule_type", "normal");

  if (sErr) throw sErr;
  if (!schedules || schedules.length === 0)
    return { totalByAgeGroup: {}, playerStats: {} };

  const totalByAgeGroup: Record<string, number> = {};
  const scheduleIds: string[] = [];
  schedules.forEach((s: { id: string; age_group: string }) => {
    totalByAgeGroup[s.age_group] = (totalByAgeGroup[s.age_group] ?? 0) + 1;
    scheduleIds.push(s.id);
  });

  const { data: att, error: aErr } = await client
    .from("training_attendance")
    .select("player_id, status")
    .in("schedule_id", scheduleIds);

  if (aErr) throw aErr;

  const playerStats: Record<string, { geldi: number; gelmedi: number; izinli: number; sakat: number }> = {};
  (att ?? []).forEach((r: { player_id: string; status: string }) => {
    if (!playerStats[r.player_id])
      playerStats[r.player_id] = { geldi: 0, gelmedi: 0, izinli: 0, sakat: 0 };
    const s = r.status as keyof (typeof playerStats)[string];
    if (s in playerStats[r.player_id]) playerStats[r.player_id][s]++;
  });

  return { totalByAgeGroup, playerStats };
}

/** Oyuncunun yoklama kaydını sil (durumu sıfırla) */
export async function deleteAttendance(
  scheduleId: string,
  playerId: string
): Promise<void> {
  const { error } = await getClient()
    .from("training_attendance")
    .delete()
    .eq("schedule_id", scheduleId)
    .eq("player_id", playerId);
  if (error) throw error;
}
