// =============================================
// Oyuncu Havuzu Tipleri
// =============================================

export type TrialStatus = "olumlu" | "olumsuz" | "beklemede";

// İzlenen Oyuncu (Scouting kaydı)
export interface ScoutedPlayer {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  currentTeam?: string;       // Bulunduğu takım
  position?: string;          // Mevkisi
  referencePerson?: string;   // Referans olan kişi
  recordedBy?: string;        // Kayıt alan kişi
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Deneme Oyuncusu
export interface TrialPlayer {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  currentTeam?: string;       // Bulunduğu takım
  position?: string;          // Mevkisi
  referencePerson?: string;   // Referans olan kişi
  recordedBy?: string;        // Kayıt alan kişi
  notes?: string;
  trialAgeGroup?: string;     // Hangi yaş grubu ile denemeye çıktığı
  trialDate?: string;         // Denemeye çıkış tarihi
  status: TrialStatus;        // olumlu / olumsuz / beklemede
  createdAt: string;
  updatedAt: string;
}
