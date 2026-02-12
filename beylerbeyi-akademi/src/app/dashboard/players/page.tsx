"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Player } from "@/types/player";
import { useAppData } from "@/lib/app-data";
import PlayerCard from "@/components/PlayerCard";
import PlayerDetailModal from "@/components/PlayerDetailModal";
import PlayerFormModal from "@/components/PlayerFormModal";
import { Plus, Search, Users, Calendar } from "lucide-react";
import { useToast } from "@/components/Toast";

export default function PlayersPage() {
  const { players, loading, lookups, savePlayer, removePlayer, refreshPlayers, getPlayerStatsFromMatches, userRole } = useAppData();

  const AGE_FILTERS = useMemo(() => [
    { label: "Tümü", value: "ALL" },
    ...lookups.ageGroups.filter((a) => a.isActive).map((a) => ({ label: a.value, value: a.value })),
  ], [lookups.ageGroups]);

  const SEASON_FILTERS = useMemo(() => [
    { label: "Tüm Sezonlar", value: "ALL" },
    ...lookups.seasons.filter((s) => s.isActive).map((s) => ({ label: s.value, value: s.value })),
  ], [lookups.seasons]);
  const [selectedAge, setSelectedAge] = useState<string>("ALL");
  const [selectedSeason, setSelectedSeason] = useState<string>("ALL");
  const [seasonOpen, setSeasonOpen] = useState(false);
  const seasonRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<Player | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  // selectedPlayer'ı players değiştiğinde güncelle (stale data önleme)
  useEffect(() => {
    if (selectedPlayer) {
      const fresh = players.find((p) => p.id === selectedPlayer.id);
      if (fresh) {
        setSelectedPlayer(fresh);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (seasonRef.current && !seasonRef.current.contains(e.target as Node)) {
        setSeasonOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedSeasonLabel = SEASON_FILTERS.find((f) => f.value === selectedSeason)?.label || "Tüm Sezonlar";

  // Enrich players with match-based stats
  // Filter by userRole (antrenor: only own age group)
  const filteredPlayers = useMemo(() => {
    let filtered = players;
    if (userRole?.role === "antrenor" && userRole.age_group) {
      filtered = filtered.filter((p) => p.ageGroup === userRole.age_group);
    }
    // Apply UI filters
    filtered = filtered.filter((p) => {
      const matchAge = selectedAge === "ALL" || p.ageGroup === selectedAge;
      const matchSeason = selectedSeason === "ALL" || p.seasons.includes(selectedSeason);
      const matchSearch =
        search === "" ||
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        p.position.toLowerCase().includes(search.toLowerCase()) ||
        String(p.jerseyNumber).includes(search);
      return matchAge && matchSeason && matchSearch;
    });
    return filtered.map((p) => {
      const matchStats = getPlayerStatsFromMatches(p.id);
      if (matchStats.matches > 0) {
        return { ...p, stats: matchStats };
      }
      return p;
    });
  }, [players, userRole, selectedAge, selectedSeason, search, getPlayerStatsFromMatches]);

  const handleSave = async (saved: Player) => {
    try {
      setSaving(true);
      const isEdit = !!editingPlayer;
      await savePlayer(saved, isEdit);
      await refreshPlayers();
      setEditingPlayer(undefined);
      setSelectedPlayer(null);
      showToast("success", isEdit ? "Oyuncu başarıyla güncellendi" : "Oyuncu başarıyla kaydedildi");
    } catch (err) {
      console.error("Oyuncu kaydedilemedi:", err);
      showToast("error", "Oyuncu kaydedilirken bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditFromDetail = (player: Player) => {
    setSelectedPlayer(null);
    setEditingPlayer(player);
  };

  const handleDeletePlayer = async (playerId: string) => {
    try {
      await removePlayer(playerId);
      setSelectedPlayer(null);
      showToast("success", "Oyuncu başarıyla silindi");
    } catch (err) {
      console.error("Oyuncu silinemedi:", err);
      showToast("error", "Oyuncu silinirken bir hata oluştu.");
    }
  };

  // Only allow add/edit for own age group (antrenor)
  const canEdit = userRole?.role === "yonetici" || (userRole?.role === "antrenor" && !!userRole.age_group);
  const canAddPlayer = userRole?.role === "yonetici" || (userRole?.role === "antrenor" && !!userRole.age_group);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-xl font-bold text-[#1a1a2e]">Oyuncular</h1>
        {canAddPlayer && (
          <button
            onClick={() => setEditingPlayer(null)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#c4111d] hover:bg-[#9b0d16] text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm shadow-[#c4111d]/25 focus-ring"
          >
            <Plus size={18} />
            Oyuncu Ekle
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="w-10 h-10 border-3 border-[#e2e5e9] border-t-[#c4111d] rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium text-[#5a6170]">Oyuncular yükleniyor...</p>
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-[#f1f3f5] flex items-center justify-center mb-4">
              <Users size={28} className="text-[#8c919a]" />
            </div>
            <p className="text-sm font-medium text-[#5a6170]">Oyuncu bulunamadı</p>
            <p className="text-xs text-[#8c919a] mt-1">Farklı bir filtre veya arama terimi deneyin</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlayers.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                onClick={() => setSelectedPlayer(player)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedPlayer && (
        <PlayerDetailModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          onEdit={(player) => {
            if (
              canEdit &&
              (userRole?.role === "yonetici" ||
                (userRole?.role === "antrenor" && player.ageGroup === userRole.age_group))
            ) {
              handleEditFromDetail(player);
            }
          }}
          onDelete={userRole?.role === "yonetici" ? handleDeletePlayer : undefined}
        />
      )}

      {/* Form Modal */}
      {editingPlayer !== undefined && canEdit && (
        <PlayerFormModal
          player={editingPlayer}
          saving={saving}
          onClose={() => setEditingPlayer(undefined)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
