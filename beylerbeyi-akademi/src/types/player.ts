// Dinamik lookup değerleri – artık DB'den geliyor.
// Tip güvenliği için string alt tipi olarak tanımlanıyor.
export type Position  = string;
export type Foot      = string;
export type AgeGroup  = string;

export interface PlayerStats {
  matches: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  goalsConceded: number; // kaleci için
  cleanSheets: number;   // kaleci için
  minutesPlayed: number;
    anaKadro?: number;
    yedek?: number;
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
  seasons: string[];        // Sezon bilgileri (örn: ["2024-2025", "2025-2026"])
  previousTeams?: { team: string; years: string }[];  // Önceki takımlar ve yılları
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

// Beceri değişim logu
export type SkillCategory = "tactical" | "athletic";

export interface SkillLog {
  id: string;
  playerId: string;
  category: SkillCategory;
  skillName: string;        // DB'deki alan adı (positioning, speed vs.)
  oldValue: number;
  newValue: number;
  changedAt: string;
}

// Boy/Kilo değişim logu
export type MeasurementType = "height" | "weight";

export interface BodyLog {
  id: string;
  playerId: string;
  measurement: MeasurementType;
  oldValue: number;
  newValue: number;
  changedAt: string;
}
