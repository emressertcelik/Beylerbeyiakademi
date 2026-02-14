"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { fetchCurrentUserRole, fetchCurrentUserEmail } from "@/lib/supabase/userRole";
import { UserRoleInfo } from "@/types/userRole";
import { Player } from "@/types/player";
import { Match } from "@/types/match";
import {
  fetchPlayers as supabaseFetchPlayers,
  createPlayer as supabaseCreatePlayer,
  updatePlayer as supabaseUpdatePlayer,
  deletePlayer as supabaseDeletePlayer,
} from "@/lib/supabase/players";
import {
  fetchMatches as supabaseFetchMatches,
  createMatch as supabaseCreateMatch,
  updateMatch as supabaseUpdateMatch,
  deleteMatch as supabaseDeleteMatch,
} from "@/lib/supabase/matches";
import { fetchAllLookups, Lookups } from "@/lib/supabase/lookups";

interface AppData {
  players: Player[];
  matches: Match[];
  lookups: Lookups;
  loading: boolean;
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  setMatches: React.Dispatch<React.SetStateAction<Match[]>>;
  refreshPlayers: () => Promise<void>;
  refreshMatches: () => Promise<void>;
  refreshLookups: () => Promise<void>;
  savePlayer: (player: Player, isEdit: boolean) => Promise<Player>;
  removePlayer: (playerId: string) => Promise<void>;
  saveMatch: (match: Match, isEdit: boolean) => Promise<Match>;
  removeMatch: (matchId: string) => Promise<void>;
  getPlayerStatsFromMatches: (playerId: string) => {
    matches: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    goalsConceded: number;
    cleanSheets: number;
    minutesPlayed: number;
  };
  userRole: UserRoleInfo | null;
  userEmail: string | null;
  refreshUserRole: () => Promise<void>;
}

const AppDataContext = createContext<AppData | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [lookups, setLookups] = useState<Lookups>({
    positions: [],
    feet: [],
    ageGroups: [],
    seasons: [],
    participationStatuses: [],
  });
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRoleInfo | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  // Kullanıcı rolünü ve email bilgisini çek
  const refreshUserRole = useCallback(async () => {
    const role = await fetchCurrentUserRole();
    setUserRole(role);
    const email = await fetchCurrentUserEmail();
    setUserEmail(email);
  }, []);

  useEffect(() => {
    refreshUserRole();
  }, [refreshUserRole]);

  // Supabase'den oyuncuları çek
  const refreshPlayers = useCallback(async () => {
    try {
      const data = await supabaseFetchPlayers();
      setPlayers(data);
    } catch (err) {
      console.error("Oyuncular yüklenemedi:", err);
    }
  }, []);

  // Supabase'den maçları çek
  const refreshMatches = useCallback(async () => {
    try {
      const data = await supabaseFetchMatches();
      setMatches(data);
    } catch (err) {
      console.error("Maçlar yüklenemedi:", err);
    }
  }, []);

  // Lookup'ları yenile
  const refreshLookups = useCallback(async () => {
    try {
      const data = await fetchAllLookups();
      setLookups(data);
    } catch (err) {
      console.error("Lookup yüklenemedi:", err);
    }
  }, []);

  // İlk yüklemede oyuncuları, maçları ve lookup'ları çek
  useEffect(() => {
    const init = async () => {
      try {
        const [playersData, matchesData, lookupsData] = await Promise.all([
          supabaseFetchPlayers(),
          supabaseFetchMatches(),
          fetchAllLookups(),
        ]);
        setPlayers(playersData);
        setMatches(matchesData);
        setLookups(lookupsData);
      } catch (err) {
        console.error("İlk yükleme hatası:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Oyuncu kaydet (oluştur veya güncelle)
  const savePlayer = useCallback(async (player: Player, isEdit: boolean): Promise<Player> => {
    const saved = isEdit
      ? await supabaseUpdatePlayer(player)
      : await supabaseCreatePlayer(player);

    // Local state'i güncelle
    setPlayers((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = saved;
        return updated;
      }
      return [saved, ...prev];
    });

    return saved;
  }, []);

  // Oyuncu sil
  const removePlayer = useCallback(async (playerId: string): Promise<void> => {
    await supabaseDeletePlayer(playerId);
    setPlayers((prev) => prev.filter((p) => p.id !== playerId));
  }, []);

  // Maç kaydet (oluştur veya güncelle)
  const saveMatch = useCallback(async (match: Match, isEdit: boolean): Promise<Match> => {
    const saved = isEdit
      ? await supabaseUpdateMatch(match)
      : await supabaseCreateMatch(match);

    setMatches((prev) => {
      const idx = prev.findIndex((m) => m.id === saved.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = saved;
        return updated;
      }
      return [saved, ...prev];
    });

    return saved;
  }, []);

  // Maç sil
  const removeMatch = useCallback(async (matchId: string): Promise<void> => {
    await supabaseDeleteMatch(matchId);
    setMatches((prev) => prev.filter((m) => m.id !== matchId));
  }, []);

  const getPlayerStatsFromMatches = useCallback(
    (playerId: string) => {
      const stats = {
        matches: 0,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        goalsConceded: 0,
        cleanSheets: 0,
        minutesPlayed: 0,
        anaKadro: 0,
        yedek: 0,
      };

      for (const match of matches) {
        if (match.status !== "played") continue;
        const ps = match.playerStats.find((p) => p.playerId === playerId);
        if (ps) {
          stats.matches += 1;
          stats.goals += ps.goals;
          stats.assists += ps.assists;
          stats.yellowCards += ps.yellowCards;
          stats.redCards += ps.redCards;
          stats.goalsConceded += ps.goalsConceded;
          if (ps.cleanSheet) stats.cleanSheets += 1;
          stats.minutesPlayed += ps.minutesPlayed;
          const status = (ps.participationStatus || "").toLowerCase();
          if (status === "ana kadro") stats.anaKadro += 1;
          else if (status === "sonradan girdi" || status === "yedek") stats.yedek += 1;
        }
      }

      return stats;
    },
    [matches]
  );

  const value = useMemo(
    () => ({ players, matches, lookups, loading, setPlayers, setMatches, refreshPlayers, refreshMatches, refreshLookups, savePlayer, removePlayer, saveMatch, removeMatch, getPlayerStatsFromMatches, userRole, userEmail, refreshUserRole }),
    [players, matches, lookups, loading, refreshPlayers, refreshMatches, refreshLookups, savePlayer, removePlayer, saveMatch, removeMatch, getPlayerStatsFromMatches, userRole, userEmail, refreshUserRole]
  );

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
