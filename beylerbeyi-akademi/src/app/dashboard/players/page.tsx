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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1a1a2e]">Oyuncular</h1>
          <div className="text-sm text-[#8c919a] font-medium mt-1">{players.length} oyuncu</div>
        </div>
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

      {/* Filtreler ve arama (Takımlar sayfası gibi) */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white border border-[#e2e5e9] rounded-xl p-3 overflow-x-auto">
        {/* Yaş grubu sekmeleri */}
        <div className="flex gap-1 bg-[#f1f3f5] rounded-lg p-1 min-w-[260px]">
          {AGE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setSelectedAge(f.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${
                selectedAge === f.value
                  ? "bg-white text-[#c4111d] shadow-sm"
                  : "text-[#5a6170] hover:text-[#1a1a2e]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Sezon açılır menü */}
        <div className="relative" ref={seasonRef}>
          <button
            onClick={() => setSeasonOpen(!seasonOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 h-[34px] bg-[#f1f3f5] rounded-lg text-xs font-semibold transition-all duration-200 border ${
              seasonOpen
                ? "border-[#c4111d]/30 ring-2 ring-[#c4111d]/20 text-[#c4111d]"
                : "border-transparent hover:border-[#e2e5e9] text-[#1a1a2e]"
            }`}
          >
            <Calendar size={14} className="text-[#8c919a] shrink-0" />
            <span className="whitespace-nowrap">{selectedSeasonLabel}</span>
            <svg className={`w-3 h-3 text-[#8c919a] transition-transform duration-200 ${seasonOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 10 6"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          {seasonOpen && (
            <div className="absolute top-full left-0 mt-1.5 bg-white border border-[#e2e5e9] rounded-xl shadow-lg shadow-black/8 py-1 min-w-[160px] z-50 animate-fade-in">
              {SEASON_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => {
                    setSelectedSeason(f.value);
                    setSeasonOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors duration-150 ${
                    selectedSeason === f.value
                      ? "text-[#c4111d] bg-[#c4111d]/5"
                      : "text-[#1a1a2e] hover:bg-[#f1f3f5]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {selectedSeason === f.value && (
                      <svg className="w-3.5 h-3.5 text-[#c4111d] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    )}
                    <span className={selectedSeason !== f.value ? "ml-[22px]" : ""}>{f.label}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Arama inputu */}
        <div className="flex-1 flex items-center gap-2 min-w-[200px]">
          <div className="relative w-full">
            <input
              type="text"
              className="w-full px-3 py-2 rounded-lg border border-[#e2e5e9] bg-white text-sm text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#c4111d] pl-9"
              placeholder="Oyuncu ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Search size={18} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#c4111d] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Oyuncu kartları grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="w-10 h-10 border-3 border-[#e2e5e9] border-t-[#c4111d] rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium text-[#5a6170]">Oyuncular yükleniyor...</p>
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-[#f1f3f5] flex items-center justify-center mb-4">
              <Users size={28} className="text-[#8c919a]" />
            </div>
            <p className="text-sm font-medium text-[#5a6170]">Oyuncu bulunamadı</p>
            <p className="text-xs text-[#8c919a] mt-1">Farklı bir filtre veya arama terimi deneyin</p>
          </div>
        ) : (
          filteredPlayers.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              onClick={() => setSelectedPlayer(player)}
              userRole={userRole}
            />
          ))
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
          userRole={userRole ? { role: userRole.role } : undefined}
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
