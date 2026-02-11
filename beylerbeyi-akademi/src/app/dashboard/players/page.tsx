"use client";

import { useState } from "react";
import { Player, AgeGroup } from "@/types/player";
import { MOCK_PLAYERS } from "@/lib/mock-players";
import PlayerCard from "@/components/PlayerCard";
import PlayerDetailModal from "@/components/PlayerDetailModal";
import PlayerFormModal from "@/components/PlayerFormModal";
import { Plus, Search } from "lucide-react";

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
  const [editingPlayer, setEditingPlayer] = useState<Player | null | undefined>(undefined); // undefined = closed, null = new, Player = edit

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
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1a1a1a] tracking-tight mb-2">Oyuncular</h1>
          <p className="text-base text-[#6e7781] mt-1">
            {filtered.length} oyuncu {selectedAge !== "ALL" ? `(${selectedAge})` : ""}
          </p>
        </div>
        <button
          onClick={() => setEditingPlayer(null)}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#c4111d] to-[#a50e18] hover:from-[#a50e18] hover:to-[#c4111d] text-white text-base font-semibold rounded-xl transition-all duration-300 shadow-md"
        >
          <Plus size={18} />
          Oyuncu Ekle
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Age group tabs */}
        <div className="flex gap-1 bg-white/80 border border-[#e5e7eb]/60 rounded-xl p-1 shadow-sm">
          {AGE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setSelectedAge(f.value)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                selectedAge === f.value
                  ? "bg-gradient-to-r from-[#c4111d] to-[#a50e18] text-white shadow-md"
                  : "text-[#57606a] hover:bg-[#f6f8fa]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b949e]" />
          <input
            type="text"
            placeholder="Oyuncu ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-3 bg-white/80 border border-[#d0d7de]/60 rounded-xl text-base text-[#1a1a1a] placeholder-[#8b949e] focus:outline-none focus:border-[#c4111d] focus:ring-2 focus:ring-[#c4111d]/15 transition-all duration-300 shadow-sm"
          />
        </div>
      </div>

      {/* Player Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-[#f6f8fa] flex items-center justify-center mx-auto mb-4">
            <Search size={32} className="text-[#8b949e]" />
          </div>
          <p className="text-base text-[#6e7781]">Oyuncu bulunamadı</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
