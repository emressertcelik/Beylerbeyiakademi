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
