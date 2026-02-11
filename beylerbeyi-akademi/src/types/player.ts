export type Position =
  | "Kaleci"
  | "Defans"
  | "Orta Saha"
  | "Forvet";

export type Foot = "Sağ" | "Sol" | "Her İkisi";

export type AgeGroup = "U14" | "U15" | "U16" | "U17" | "U19";

export interface PlayerStats {
  matches: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  goalsConceded: number; // kaleci için
  cleanSheets: number;   // kaleci için
  minutesPlayed: number;
}

export interface TacticalSkills {
  positioning: number;     // Pozisyon alma (1-10)
  passing: number;         // Pas (1-10)
  crossing: number;        // Orta (1-10)
  shooting: number;        // Şut (1-10)
  dribbling: number;       // Dribling (1-10)
  heading: number;         // Kafa vuruşu (1-10)
  tackling: number;        // Top kesme (1-10)
  marking: number;         // Adam markajı (1-10)
  gameReading: number;     // Oyun okuma (1-10)
}

export interface AthleticSkills {
  speed: number;           // Hız (1-10)
  strength: number;        // Güç (1-10)
  stamina: number;         // Dayanıklılık (1-10)
  agility: number;         // Çeviklik (1-10)
  jumping: number;         // Sıçrama (1-10)
  balance: number;         // Denge (1-10)
  flexibility: number;     // Esneklik (1-10)
}

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  ageGroup: AgeGroup;
  position: Position;
  foot: Foot;
  jerseyNumber: number;
  height: number;         // cm
  weight: number;         // kg
  photo?: string;
  phone?: string;
  parentPhone?: string;
  notes?: string;
  stats: PlayerStats;
  tactical: TacticalSkills;
  athletic: AthleticSkills;
  createdAt: string;
  updatedAt: string;
}
