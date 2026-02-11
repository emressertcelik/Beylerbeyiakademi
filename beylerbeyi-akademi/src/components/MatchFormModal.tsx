"use client";

import { useState, useEffect } from "react";
import { Match, MatchPlayerStat, MatchStatus } from "@/types/match";
import { Player, AgeGroup } from "@/types/player";
import { useAppData } from "@/lib/app-data";
import { X, Plus, Trash2, UserPlus, Loader2, Star } from "lucide-react";

interface MatchFormModalProps {
  match?: Match | null;
  players: Player[];
  saving?: boolean;
  onClose: () => void;
  onSave: (match: Match) => void;
}

function getResult(scoreHome: number, scoreAway: number): "W" | "D" | "L" {
  if (scoreHome > scoreAway) return "W";
  if (scoreHome === scoreAway) return "D";
  return "L";
}

export default function MatchFormModal({ match, players, saving, onClose, onSave }: MatchFormModalProps) {
  const { lookups } = useAppData();
  const AGE_GROUPS = lookups.ageGroups.filter((a) => a.isActive).map((a) => a.value);
  const SEASONS = lookups.seasons.filter((s) => s.isActive).map((s) => s.value);
  const isEdit = !!match;

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    season: SEASONS[0] || "2025-2026",
    ageGroup: (AGE_GROUPS[0] ?? "U15") as AgeGroup,
    opponent: "",
    homeAway: "home" as "home" | "away",
    status: "scheduled" as MatchStatus,
    scoreHome: 0,
    scoreAway: 0,
    venue: "",
    notes: "",
  });

  const [playerStats, setPlayerStats] = useState<MatchPlayerStat[]>([]);
  const [activeTab, setActiveTab] = useState<"match" | "players">("match");

  useEffect(() => {
    if (match) {
      setForm({
        date: match.date,
        season: match.season,
        ageGroup: match.ageGroup,
        opponent: match.opponent,
        homeAway: match.homeAway,
        status: match.status || "played",
        scoreHome: match.scoreHome,
        scoreAway: match.scoreAway,
        venue: match.venue || "",
        notes: match.notes || "",
      });
      setPlayerStats([...match.playerStats]);
    }
  }, [match]);

  // Filter players by selected age group and season
  const availablePlayers = players.filter(
    (p) => p.ageGroup === form.ageGroup && p.seasons.includes(form.season)
  );

  const addedPlayerIds = playerStats.map((ps) => ps.playerId);
  const unaddedPlayers = availablePlayers.filter((p) => !addedPlayerIds.includes(p.id));

  const addPlayer = (player: Player) => {
    setPlayerStats((prev) => [
      ...prev,
      {
        playerId: player.id,
        playerName: `${player.firstName} ${player.lastName}`,
        jerseyNumber: player.jerseyNumber,
        position: player.position,
        minutesPlayed: 0,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        goalsConceded: 0,
        cleanSheet: false,
        rating: undefined,
      },
    ]);
  };

  const removePlayer = (playerId: string) => {
    setPlayerStats((prev) => prev.filter((ps) => ps.playerId !== playerId));
  };

  const updatePlayerStat = (playerId: string, field: keyof MatchPlayerStat, value: unknown) => {
    setPlayerStats((prev) =>
      prev.map((ps) =>
        ps.playerId === playerId ? { ...ps, [field]: value } : ps
      )
    );
  };

  const handleSubmit = () => {
    if (!form.opponent.trim()) return;
    const isPlayed = form.status === "played";
    const result = isPlayed ? getResult(form.scoreHome, form.scoreAway) : "D";
    const now = new Date().toISOString().split("T")[0];
    const saved: Match = {
      id: match?.id || crypto.randomUUID(),
      ...form,
      scoreHome: isPlayed ? form.scoreHome : 0,
      scoreAway: isPlayed ? form.scoreAway : 0,
      result,
      playerStats: isPlayed ? playerStats : [],
      createdAt: match?.createdAt || now,
      updatedAt: now,
    };
    onSave(saved);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-[#e2e5e9] animate-slide-in-up">
        {/* Header */}
        <div className="border-b border-[#e2e5e9] px-6 py-5 flex items-center justify-between rounded-t-2xl shrink-0">
          <h2 className="text-lg font-bold text-[#1a1a2e]">
            {isEdit ? "Maç Düzenle" : "Yeni Maç Ekle"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-[#f1f3f5] rounded-lg transition-colors text-[#5a6170]">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-[#e2e5e9] px-6 flex gap-1 shrink-0">
          {[
            { key: "match" as const, label: "Maç Bilgisi" },
            ...(form.status === "played" ? [{ key: "players" as const, label: `Oyuncu İstatistikleri (${playerStats.length})` }] : []),
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 -mb-px ${
                activeTab === t.key
                  ? "border-[#c4111d] text-[#c4111d]"
                  : "border-transparent text-[#5a6170] hover:text-[#1a1a2e] hover:border-[#e2e5e9]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "match" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#5a6170] mb-1.5">Tarih</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 bg-[#f8f9fb] border border-[#e2e5e9] rounded-lg text-sm text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#c4111d]/20 focus:border-[#c4111d]/30 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5a6170] mb-1.5">Rakip</label>
                  <input
                    type="text"
                    value={form.opponent}
                    onChange={(e) => setForm({ ...form, opponent: e.target.value })}
                    placeholder="Rakip takım adı"
                    className="w-full px-3 py-2 bg-[#f8f9fb] border border-[#e2e5e9] rounded-lg text-sm text-[#1a1a2e] placeholder-[#8c919a] focus:outline-none focus:ring-2 focus:ring-[#c4111d]/20 focus:border-[#c4111d]/30 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#5a6170] mb-1.5">Yaş Grubu</label>
                  <select
                    value={form.ageGroup}
                    onChange={(e) => {
                      setForm({ ...form, ageGroup: e.target.value as AgeGroup });
                      setPlayerStats([]);
                    }}
                    className="w-full px-3 py-2 bg-[#f8f9fb] border border-[#e2e5e9] rounded-lg text-sm text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#c4111d]/20 focus:border-[#c4111d]/30 transition-all"
                  >
                    {AGE_GROUPS.map((ag) => (
                      <option key={ag} value={ag}>{ag}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5a6170] mb-1.5">Sezon</label>
                  <select
                    value={form.season}
                    onChange={(e) => {
                      setForm({ ...form, season: e.target.value });
                      setPlayerStats([]);
                    }}
                    className="w-full px-3 py-2 bg-[#f8f9fb] border border-[#e2e5e9] rounded-lg text-sm text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#c4111d]/20 focus:border-[#c4111d]/30 transition-all"
                  >
                    {SEASONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5a6170] mb-1.5">Ev / Deplasman</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, homeAway: "home" })}
                      className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                        form.homeAway === "home"
                          ? "bg-[#c4111d] text-white border-[#c4111d]"
                          : "bg-white text-[#5a6170] border-[#e2e5e9] hover:border-[#c4111d]"
                      }`}
                    >
                      Ev
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, homeAway: "away" })}
                      className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                        form.homeAway === "away"
                          ? "bg-[#c4111d] text-white border-[#c4111d]"
                          : "bg-white text-[#5a6170] border-[#e2e5e9] hover:border-[#c4111d]"
                      }`}
                    >
                      Deplasman
                    </button>
                  </div>
                </div>
              </div>

              {/* Match Status */}
              <div>
                <label className="block text-xs font-medium text-[#5a6170] mb-1.5">Maç Durumu</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, status: "scheduled" })}
                    className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                      form.status === "scheduled"
                        ? "bg-amber-500 text-white border-amber-500"
                        : "bg-white text-[#5a6170] border-[#e2e5e9] hover:border-amber-500"
                    }`}
                  >
                    📅 Planlandı
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, status: "played" })}
                    className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                      form.status === "played"
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white text-[#5a6170] border-[#e2e5e9] hover:border-green-600"
                    }`}
                  >
                    ✅ Oynandı
                  </button>
                </div>
              </div>

              {/* Score - only when played */}
              {form.status === "played" && (
              <div>
                <label className="block text-xs font-medium text-[#5a6170] mb-2">Skor</label>
                <div className="flex items-center gap-3 bg-[#f8f9fb] rounded-xl p-4 border border-[#e2e5e9]">
                  <div className="flex-1 text-center">
                    <p className="text-[10px] text-[#8c919a] font-semibold uppercase tracking-wider mb-1">Beylerbeyi</p>
                    <input
                      type="number"
                      min={0}
                      value={form.scoreHome}
                      onChange={(e) => setForm({ ...form, scoreHome: Number(e.target.value) })}
                      className="w-16 mx-auto text-center text-2xl font-black text-[#1a1a2e] bg-white border border-[#e2e5e9] rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-[#c4111d]/20"
                    />
                  </div>
                  <span className="text-xl font-bold text-[#8c919a]">—</span>
                  <div className="flex-1 text-center">
                    <p className="text-[10px] text-[#8c919a] font-semibold uppercase tracking-wider mb-1">{form.opponent || "Rakip"}</p>
                    <input
                      type="number"
                      min={0}
                      value={form.scoreAway}
                      onChange={(e) => setForm({ ...form, scoreAway: Number(e.target.value) })}
                      className="w-16 mx-auto text-center text-2xl font-black text-[#1a1a2e] bg-white border border-[#e2e5e9] rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-[#c4111d]/20"
                    />
                  </div>
                </div>
              </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#5a6170] mb-1.5">Saha / Stat</label>
                <input
                  type="text"
                  value={form.venue}
                  onChange={(e) => setForm({ ...form, venue: e.target.value })}
                  placeholder="Maçın oynandığı saha"
                  className="w-full px-3 py-2 bg-[#f8f9fb] border border-[#e2e5e9] rounded-lg text-sm text-[#1a1a2e] placeholder-[#8c919a] focus:outline-none focus:ring-2 focus:ring-[#c4111d]/20 focus:border-[#c4111d]/30 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5a6170] mb-1.5">Notlar</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Maç hakkında notlar..."
                  rows={3}
                  className="w-full px-3 py-2 bg-[#f8f9fb] border border-[#e2e5e9] rounded-lg text-sm text-[#1a1a2e] placeholder-[#8c919a] focus:outline-none focus:ring-2 focus:ring-[#c4111d]/20 focus:border-[#c4111d]/30 transition-all resize-none"
                />
              </div>
            </div>
          )}

          {activeTab === "players" && (
            <div className="space-y-4">
              {/* Add Player */}
              {unaddedPlayers.length > 0 && (
                <div className="bg-[#f8f9fb] border border-[#e2e5e9] rounded-xl p-4">
                  <p className="text-xs font-semibold text-[#5a6170] mb-2 flex items-center gap-1.5">
                    <UserPlus size={14} />
                    Oyuncu Ekle ({form.ageGroup} · {form.season})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {unaddedPlayers.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => addPlayer(p)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e2e5e9] rounded-lg text-xs font-medium text-[#1a1a2e] hover:border-[#c4111d] hover:text-[#c4111d] transition-all"
                      >
                        <Plus size={12} />
                        <span className="font-bold text-[#c4111d]">#{p.jerseyNumber}</span>
                        {p.firstName} {p.lastName}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {availablePlayers.length === 0 && (
                <div className="text-center py-8 text-sm text-[#8c919a]">
                  Bu yaş grubu ve sezonda kayıtlı oyuncu bulunamadı.
                </div>
              )}

              {/* Player Stats List */}
              {playerStats.length === 0 && availablePlayers.length > 0 && (
                <div className="text-center py-8 text-sm text-[#8c919a]">
                  Henüz oyuncu eklenmedi. Yukarıdan oyuncu ekleyin.
                </div>
              )}

              <div className="space-y-3">
                {playerStats.map((ps) => (
                  <div key={ps.playerId} className="bg-white border border-[#e2e5e9] rounded-xl p-4">
                    {/* Player Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-[#c4111d]/10 flex items-center justify-center text-xs font-black text-[#c4111d]">
                          {ps.jerseyNumber}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-[#1a1a2e]">{ps.playerName}</p>
                          <p className="text-[10px] text-[#8c919a]">{ps.position}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePlayer(ps.playerId)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-[#8c919a] hover:text-[#c4111d] transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Star Rating */}
                    <div className="mb-2">
                      <label className="block text-[10px] font-medium text-[#8c919a] mb-1">Yıldız Puanı</label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => updatePlayerStat(ps.playerId, "rating", (ps.rating === star ? undefined : star))}
                            className="p-0.5 transition-transform hover:scale-110"
                          >
                            <Star
                              size={20}
                              className={`transition-colors ${
                                ps.rating && star <= ps.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "fill-none text-[#d1d5db]"
                              }`}
                            />
                          </button>
                        ))}
                        {ps.rating && (
                          <span className="ml-1 text-xs font-semibold text-amber-600">{ps.rating}/5</span>
                        )}
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      <MiniInput label="Dakika" value={ps.minutesPlayed} onChange={(v) => updatePlayerStat(ps.playerId, "minutesPlayed", v)} max={120} />
                      <MiniInput label="Gol" value={ps.goals} onChange={(v) => updatePlayerStat(ps.playerId, "goals", v)} />
                      <MiniInput label="Asist" value={ps.assists} onChange={(v) => updatePlayerStat(ps.playerId, "assists", v)} />
                      <MiniInput label="Sarı Kart" value={ps.yellowCards} onChange={(v) => updatePlayerStat(ps.playerId, "yellowCards", v)} max={2} />
                      <MiniInput label="Kırmızı Kart" value={ps.redCards} onChange={(v) => updatePlayerStat(ps.playerId, "redCards", v)} max={1} />
                      {ps.position === "Kaleci" && (
                        <>
                          <MiniInput label="Y. Gol" value={ps.goalsConceded} onChange={(v) => updatePlayerStat(ps.playerId, "goalsConceded", v)} />
                          <div>
                            <label className="block text-[10px] font-medium text-[#8c919a] mb-1">Clean Sheet</label>
                            <button
                              type="button"
                              onClick={() => updatePlayerStat(ps.playerId, "cleanSheet", !ps.cleanSheet)}
                              className={`w-full px-2 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                                ps.cleanSheet
                                  ? "bg-emerald-500 text-white border-emerald-500"
                                  : "bg-white text-[#5a6170] border-[#e2e5e9]"
                              }`}
                            >
                              {ps.cleanSheet ? "Evet" : "Hayır"}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#e2e5e9] px-6 py-4 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#5a6170] hover:text-[#1a1a2e] hover:bg-[#f1f3f5] rounded-lg transition-all"
          >
            İptal
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2 bg-[#c4111d] hover:bg-[#9b0d16] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg shadow-sm shadow-[#c4111d]/25 transition-all flex items-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? "Kaydediliyor..." : isEdit ? "Güncelle" : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MiniInput({
  label,
  value,
  onChange,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max?: number;
}) {
  return (
    <div>
      <label className="block text-[10px] font-medium text-[#8c919a] mb-1">{label}</label>
      <input
        type="number"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full px-2 py-1.5 bg-[#f8f9fb] border border-[#e2e5e9] rounded-lg text-sm text-center font-semibold text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#c4111d]/20 transition-all"
      />
    </div>
  );
}
