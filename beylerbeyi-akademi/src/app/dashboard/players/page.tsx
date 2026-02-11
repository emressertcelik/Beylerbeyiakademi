"use client";

import { useState } from "react";
import { Player, AgeGroup } from "@/types/player";
import { MOCK_PLAYERS } from "@/lib/mock-players";
import PlayerCard from "@/components/PlayerCard";
import PlayerDetailModal from "@/components/PlayerDetailModal";
import PlayerFormModal from "@/components/PlayerFormModal";
import { Plus, Search, Users } from "lucide-react";

const AGE_FILTERS: { label: string; value: AgeGroup | "ALL" }[] = [
  { label: "Tümü", value: "ALL" },
  { label: "U14", value: "U14" },
  { label: "U15", value: "U15" },
  { label: "U16", value: "U16" },
  { label: "U17", value: "U17" },
  { label: "U19", value: "U19" },
];

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>(MOCK_PLAYERS);
  const [selectedAge, setSelectedAge] = useState<AgeGroup | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<Player | null | undefined>(undefined);

  const filtered = players.filter((p) => {
    const matchAge = selectedAge === "ALL" || p.ageGroup === selectedAge;
    const matchSearch =
      search === "" ||
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      p.position.toLowerCase().includes(search.toLowerCase()) ||
      String(p.jerseyNumber).includes(search);
    return matchAge && matchSearch;
  });

  const handleSave = (saved: Player) => {
    setPlayers((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = saved;
        return updated;
      }
      return [...prev, saved];
    });
    setEditingPlayer(undefined);
    setSelectedPlayer(null);
  };

  const handleEditFromDetail = (player: Player) => {
    setSelectedPlayer(null);
    setEditingPlayer(player);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e] tracking-tight">
            Oyuncular
          </h1>
          <p className="text-sm text-[#5a6170] mt-1">
            {filtered.length} oyuncu {selectedAge !== "ALL" ? `· ${selectedAge}` : ""}
          </p>
        </div>
        <button
          onClick={() => setEditingPlayer(null)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#c4111d] hover:bg-[#9b0d16] text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm shadow-[#c4111d]/25 focus-ring"
        >
          <Plus size={18} />
          Oyuncu Ekle
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white border border-[#e2e5e9] rounded-xl p-3">
        {/* Age group tabs */}
        <div className="flex gap-1 bg-[#f1f3f5] rounded-lg p-1">
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

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c919a]" />
          <input
            type="text"
            placeholder="Oyuncu ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#f1f3f5] border-0 rounded-lg text-sm text-[#1a1a2e] placeholder-[#8c919a] focus:outline-none focus:ring-2 focus:ring-[#c4111d]/20 focus:bg-white transition-all duration-200"
          />
        </div>
      </div>

      {/* Player Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-[#f1f3f5] flex items-center justify-center mb-4">
            <Users size={28} className="text-[#8c919a]" />
          </div>
          <p className="text-sm font-medium text-[#5a6170]">Oyuncu bulunamadı</p>
          <p className="text-xs text-[#8c919a] mt-1">Farklı bir filtre veya arama terimi deneyin</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              onClick={() => setSelectedPlayer(player)}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedPlayer && (
        <PlayerDetailModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          onEdit={handleEditFromDetail}
        />
      )}

      {/* Form Modal */}
      {editingPlayer !== undefined && (
        <PlayerFormModal
          player={editingPlayer}
          onClose={() => setEditingPlayer(undefined)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
