// Excel'deki özel durum kısaltmaları
export const PLAYER_STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: "Aktif", color: "text-[#116329]", bg: "bg-[#dafbe1]" },
  played: { label: "Oynadı", color: "text-[#116329]", bg: "bg-[#dafbe1]" },
  S: { label: "Sakat", color: "text-[#c4111d]", bg: "bg-[#fff1f0]" },
  KY: { label: "Kadro Dışı", color: "text-[#9a6700]", bg: "bg-[#fff8c5]" },
  SA: { label: "Sakatlık", color: "text-[#cf222e]", bg: "bg-[#ffebe9]" },
  DNP: { label: "Oynamadı", color: "text-[#57606a]", bg: "bg-[#f0f0f0]" },
  C: { label: "Cezalı", color: "text-[#8250df]", bg: "bg-[#fbefff]" },
  KD: { label: "Kadro Dışı", color: "text-[#9a6700]", bg: "bg-[#fff8c5]" },
  IZ: { label: "İzinli", color: "text-[#0969da]", bg: "bg-[#ddf4ff]" },
};

export const POSITION_COLORS: Record<string, { border: string; bg: string; text: string; avatar: string }> = {
  Kaleci: { border: "border-l-[#f59e0b]", bg: "bg-[#f59e0b]/10", text: "text-[#f59e0b]", avatar: "from-[#f59e0b] to-[#d97706]" },
  Defans: { border: "border-l-[#0969da]", bg: "bg-[#0969da]/10", text: "text-[#0969da]", avatar: "from-[#0969da] to-[#0550ae]" },
  "Orta Saha": { border: "border-l-[#1b6e2a]", bg: "bg-[#1b6e2a]/10", text: "text-[#1b6e2a]", avatar: "from-[#1b6e2a] to-[#145220]" },
  Forvet: { border: "border-l-[#c4111d]", bg: "bg-[#c4111d]/10", text: "text-[#c4111d]", avatar: "from-[#c4111d] to-[#a50e18]" },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Player {
  id: string;
  tc_no?: string;
  first_name: string;
  last_name: string;
  jersey_number: number;
  position: string;
  foot?: string;
  birth_date?: string;
  photo_url?: string;
  phone?: string;
  parent_phone?: string;
  blood_type?: string;
  height?: number;
  weight?: number;
  school?: string;
  status: string;
  previous_teams?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  technical?: Record<string, number>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  physical?: Record<string, number>;
}

export interface PlayerMatchStat {
  player_id: string;
  match_id: string;
  match_week: number;
  minutes_played: number;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  status: string;
}

export interface Match {
  id: string;
  week: number;
  date: string;
  opponent: string;
  venue: string;
  home_score: number;
  away_score: number;
  is_home: boolean;
  status: string;
}
