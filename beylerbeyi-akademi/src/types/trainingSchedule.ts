export type ScheduleType = "normal" | "izin" | "mac" | "ozel";

export interface TrainingSchedule {
  id: string;
  season: string;               // '2025-2026'
  age_group: string;
  training_date: string;        // 'YYYY-MM-DD'
  schedule_type: ScheduleType;
  training_time: string | null;
  cell_label: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  items?: TrainingDetailItem[];
}

export interface TrainingDetailItem {
  id: string;
  schedule_id: string;
  sort_order: number;
  content: string;
  created_at: string;
}

export interface UpsertTrainingSchedule {
  season: string;
  age_group: string;
  training_date: string;
  schedule_type: ScheduleType;
  training_time?: string | null;
  cell_label?: string | null;
}

export type AttendanceStatus = "geldi" | "gelmedi" | "izinli" | "sakat";

export interface TrainingAttendance {
  id: string;
  schedule_id: string;
  player_id: string;
  status: AttendanceStatus;
  created_at: string;
  updated_at: string;
}

export interface PlayerSummary {
  id: string;
  first_name: string;
  last_name: string;
  jersey_number: number;
  position: string;
}
