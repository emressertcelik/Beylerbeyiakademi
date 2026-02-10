"use client";

import { useState } from "react";
import { getPlayersByAgeGroup, getStatsByAgeGroup, getPlayerSeasonSummary } from "@/lib/mock-data";
import { PLAYER_STATUS_MAP, POSITION_COLORS } from "@/types/player";
import type { Player } from "@/types/player";
import { useAgeGroup } from "@/context/AgeGroupContext";
import { useAuth } from "@/hooks/useAuth";
import PlayerModal from "@/components/PlayerModal";
import PlayerFormModal from "@/components/PlayerFormModal";

export default function PlayersPage() {
  const [search, setSearch] = useState("");
  const [filterPos, setFilterPos] = useState("Tümü");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editPlayer, setEditPlayer] = useState<Player | null>(null);
  const { selectedAge } = useAgeGroup();
  const { role, loading } = useAuth();

  if (loading) return <div />;

  const canEdit = role === "yonetici" || role === "antrenor";
  const players = getPlayersByAgeGroup(selectedAge);
  const stats = getStatsByAgeGroup(selectedAge);

  const filtered = players.filter((p) => {
    const name = `${p.first_name} ${p.last_name}`.toLowerCase();
    return name.includes(search.toLowerCase()) && (filterPos === "Tümü" || p.position === filterPos);
  });

  const selected = selectedId ? players.find((p) => p.id === selectedId) : null;

  const handleSave = (data: Player) => {
    console.log("Kaydedildi:", data);
    alert(`${data.first_name} ${data.last_name} ${editPlayer ? "güncellendi" : "eklendi"}! (Demo — Supabase entegrasyonu yapılacak)`);
    setShowForm(false);
    setEditPlayer(null);
  };

  const handleEdit = (e: React.MouseEvent, player: Player) => {
    e.stopPropagation();
    setEditPlayer(player);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditPlayer(null);
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#1a1a1a]">Kadro</h1>
          <p className="text-sm text-[#6e7781]">{selectedAge} · {players.length} oyuncu</p>
        </div>
        {canEdit && (
          <button onClick={handleAdd} type="button"
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[#1b6e2a] hover:bg-[#15591f] rounded-lg transition-colors shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Oyuncu Ekle
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Oyuncu ara..."
          className="flex-1 px-3 py-2 bg-white border border-[#d0d7de] rounded-lg text-sm placeholder-[#8b949e] focus:outline-none focus:border-[#1b6e2a] focus:ring-1 focus:ring-[#1b6e2a]/20" />
        <div className="flex gap-1 overflow-x-auto">
          {["Tümü", "Kaleci", "Defans", "Orta Saha", "Forvet"].map((pos) => (
            <button key={pos} onClick={() => setFilterPos(pos)} type="button"
              className={`px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                filterPos === pos ? "bg-[#1b6e2a] text-white" : "bg-white border border-[#d0d7de] text-[#57606a] hover:bg-[#f6f8fa]"}`}>{pos}</button>
          ))}
        </div>
      </div>

      {players.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-[#e5e7eb] border-dashed rounded-xl">
          <div className="w-14 h-14 rounded-full bg-[#1b6e2a]/10 flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-[#1b6e2a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
          </div>
          <h3 className="text-[#1a1a1a] font-bold mb-1">Henüz oyuncu yok</h3>
          <p className="text-[#6e7781] text-sm mb-4">{selectedAge} yaş grubuna henüz oyuncu eklenmemiş.</p>
          {canEdit && (
            <button onClick={handleAdd} type="button"
              className="px-4 py-2 text-sm font-semibold text-white bg-[#1b6e2a] hover:bg-[#15591f] rounded-lg transition-colors">
              Oyuncu Ekle
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((player) => {
            const s = getPlayerSeasonSummary(player.id, stats);
            const st = PLAYER_STATUS_MAP[player.status] || PLAYER_STATUS_MAP["active"];
            const pc = POSITION_COLORS[player.position];
            return (
              <div key={player.id} onClick={() => setSelectedId(player.id)}
                className={`bg-white border border-[#e5e7eb] rounded-xl p-4 hover:shadow-md transition-all cursor-pointer border-l-4 ${pc?.border || ""} group relative`}>
                {canEdit && (
                  <button onClick={(e) => handleEdit(e, player)} type="button"
                    className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-[#f6f8fa] border border-[#e5e7eb] flex items-center justify-center text-[#8b949e] hover:text-[#1b6e2a] hover:border-[#1b6e2a]/30 opacity-0 group-hover:opacity-100 transition-all z-10"
                    title="Düzenle">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                )}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${pc?.avatar || "from-gray-400 to-gray-600"} flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
                      {player.jersey_number}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1a1a1a]">{player.first_name} {player.last_name}</p>
                      <p className="text-[11px] text-[#8b949e]">{player.position} {player.foot ? `· ${player.foot}` : ""} {player.birth_date ? `· ${new Date(player.birth_date).getFullYear()}` : ""}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${st.bg} ${st.color}`}>{st.label}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  <SmallStat label="Maç" value={s.matches_played} />
                  <SmallStat label="Gol" value={s.total_goals} />
                  <SmallStat label="Asist" value={s.total_assists} />
                  <SmallStat label="Dk" value={s.total_minutes} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && <PlayerModal player={selected} stats={stats} ageGroup={selectedAge} onClose={() => setSelectedId(null)} />}
      {showForm && <PlayerFormModal player={editPlayer} onSave={handleSave} onClose={() => { setShowForm(false); setEditPlayer(null); }} />}
    </div>
  );
}

function SmallStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center bg-[#f6f8fa] rounded-lg py-1.5">
      <p className="text-base font-bold text-[#1a1a1a]">{value}</p>
      <p className="text-[9px] text-[#8b949e]">{label}</p>
    </div>
  );
}
