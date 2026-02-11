import { AgeGroup } from "./player";

export interface MatchPlayerStat {
  playerId: string;
  playerName: string;       // "Ad Soyad" - kolay gösterim için
  jerseyNumber: number;
  position: string;
  participationStatus?: string; // İlk 11, Sonradan Girdi, Sakat, Cezalı, Kadroda Yok
  minutesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  goalsConceded: number;    // kaleci için
  cleanSheet: boolean;      // kaleci için
  rating?: number;          // 1-5 yıldız (opsiyonel)
}

export type MatchResult = "W" | "D" | "L"; // Win, Draw, Loss
export type MatchStatus = "scheduled" | "played"; // Planlandı / Oynandı

export interface SquadPlayer {
  playerId: string;
  playerName: string;
  jerseyNumber: number;
  position: string;
}

export interface Match {
  id: string;
  date: string;             // YYYY-MM-DD
  season: string;           // "2025-2026"
  ageGroup: AgeGroup;
  opponent: string;         // Rakip takım adı
  homeAway: "home" | "away";
  status: MatchStatus;      // Maç durumu
  scoreHome: number;        // Bizim golümüz
  scoreAway: number;        // Rakip golü
  result: MatchResult;
  venue?: string;           // Saha / Stat
  notes?: string;
  matchTime?: string;       // Maç saati (ör: "14:00")
  gatheringTime?: string;   // Toplanma saati (ör: "12:15")
  gatheringLocation?: string; // Toplanma yeri (ör: "Beylerbeyi")
  squad: SquadPlayer[];     // Maç kadrosu
  playerStats: MatchPlayerStat[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamStats {
  ageGroup: AgeGroup;
  season: string;
  totalMatches: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;           // G:3 B:1 M:0
  winRate: number;           // Yüzde
}
