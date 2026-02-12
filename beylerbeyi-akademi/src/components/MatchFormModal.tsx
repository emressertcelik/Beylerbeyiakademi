"use client";

import { useState, useEffect } from "react";
import { Match, MatchPlayerStat, MatchStatus, SquadPlayer } from "@/types/match";
import { Player, AgeGroup } from "@/types/player";
import { useAppData } from "@/lib/app-data";
import { X, Plus, Trash2, UserPlus, Loader2, Star, Users, Check } from "lucide-react";

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

function statusColor(status: string): string {
  const colors: { [key: string]: string } = {
    "İlk 11": "bg-emerald-500 text-white border-emerald-600",
    "Sonradan Girdi": "bg-blue-500 text-white border-blue-600",
    "Sakat": "bg-red-500 text-white border-red-600",
    "Cezalı": "bg-orange-500 text-white border-orange-600",
    "Kadroda Yok": "bg-gray-400 text-white border-gray-500",
  };
  return colors[status] || "bg-[#5a6170] text-white border-[#5a6170]";
}

export default function MatchFormModal({ match, players, saving, onClose, onSave }: MatchFormModalProps) {
    const [playerSearch, setPlayerSearch] = useState("");
  const { lookups, userRole } = useAppData();
  let AGE_GROUPS = lookups.ageGroups.filter((a) => a.isActive).map((a) => a.value);
  // Antrenör ise sadece kendi yaş grubunu seçebilsin
  if (userRole?.role === "antrenor" && userRole.age_group) {
    AGE_GROUPS = [userRole.age_group];
  }
  const SEASONS = lookups.seasons.filter((s) => s.isActive).map((s) => s.value);
  const PARTICIPATION_STATUSES = lookups.participationStatuses.filter((p) => p.isActive).map((p) => p.value);
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
    matchTime: "",
    gatheringTime: "",
    gatheringLocation: "",
    week: "",
  });

  const [squad, setSquad] = useState<SquadPlayer[]>([]);
  const [playerStats, setPlayerStats] = useState<MatchPlayerStat[]>([]);
  const [activeTab, setActiveTab] = useState<"match" | "squad" | "players">("match");
  const [showOtherAgeGroups, setShowOtherAgeGroups] = useState(false);

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
        matchTime: match.matchTime || "",
        gatheringTime: match.gatheringTime || "",
        gatheringLocation: match.gatheringLocation || "",
        // league kaldırıldı
        week: match.week?.toString() || "",
      });
      setSquad([...(match.squad || [])]);
      setPlayerStats([...match.playerStats]);
    }
  }, [match]);

  // Filter players by selected age group and season
  const ageGroupPlayers = players.filter(
    (p) => p.ageGroup === form.ageGroup && p.seasons.includes(form.season)
  );
  const otherAgeGroupPlayers = players.filter(
    (p) => p.ageGroup !== form.ageGroup && p.seasons.includes(form.season)
  );
  const availablePlayers = [...ageGroupPlayers, ...otherAgeGroupPlayers];

  const addedPlayerIds = playerStats.map((ps) => ps.playerId);
  const unaddedPlayers = availablePlayers.filter((p) => !addedPlayerIds.includes(p.id));

  // Squad helpers
  const isInSquad = (playerId: string) => squad.some((s) => s.playerId === playerId);

  const toggleSquadPlayer = (player: Player) => {
    if (isInSquad(player.id)) {
      setSquad((prev) => prev.filter((s) => s.playerId !== player.id));
    } else {
      setSquad((prev) => [
        ...prev,
        {
          playerId: player.id,
          playerName: `${player.firstName} ${player.lastName}`,
          jerseyNumber: player.jerseyNumber,
          position: player.position,
        },
      ]);
    }
  };

  const selectAllForSquad = () => {
    const allSquad: SquadPlayer[] = ageGroupPlayers.map((p) => ({
      playerId: p.id,
      playerName: `${p.firstName} ${p.lastName}`,
      jerseyNumber: p.jerseyNumber,
      position: p.position,
    }));
    setSquad(allSquad);
  };

  const clearSquad = () => setSquad([]);

  // Sync squad → playerStats: kadrodaki oyuncuları otomatik olarak istatistik listesine ekle
  const syncSquadToStats = (currentSquad: SquadPlayer[]) => {
    setPlayerStats((prev) => {
      // Mevcut istatistikleri koru (zaten girilmişse)
      const existingMap = new Map(prev.map((ps) => [ps.playerId, ps]));
      return currentSquad.map((s) => {
        const existing = existingMap.get(s.playerId);
        // participationStatus yoksa otomatik olarak 'İlk 11' ata
        if (existing) {
          return {
            ...existing,
            participationStatus: existing.participationStatus || "İlk 11",
          };
        }
        return {
          playerId: s.playerId,
          playerName: s.playerName,
          jerseyNumber: s.jerseyNumber,
          position: s.position,
          minutesPlayed: 0,
          goals: 0,
          assists: 0,
          yellowCards: 0,
          redCards: 0,
          goalsConceded: 0,
          cleanSheet: false,
          rating: undefined,
          participationStatus: "İlk 11",
        };
      });
    });
  };

  // Squad değiştiğinde playerStats'ı senkronize et
  useEffect(() => {
    if (squad.length > 0) {
      syncSquadToStats(squad);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [squad]);

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
        participationStatus: "İlk 11",
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
    // ParticipationStatus kontrolü: Boş olan varsa uyarı ver ve kaydetme
    if (isPlayed && playerStats.some(ps => !ps.participationStatus)) {
      alert("Tüm oyuncular için Katılım Durumu seçmelisiniz!");
      return;
    }
    const result = isPlayed ? getResult(form.scoreHome, form.scoreAway) : "D";
    const now = new Date().toISOString().split("T")[0];
    const saved: Match = {
      id: match?.id || crypto.randomUUID(),
      ...form,
      // league kaldırıldı
      week: form.week ? Number(form.week) : undefined,
      matchTime: form.matchTime || undefined,
      gatheringTime: form.gatheringTime || undefined,
      gatheringLocation: form.gatheringLocation || undefined,
      scoreHome: isPlayed ? form.scoreHome : 0,
      scoreAway: isPlayed ? form.scoreAway : 0,
      result,
      squad,
      playerStats: isPlayed ? playerStats : [],
      createdAt: match?.createdAt || now,
      updatedAt: now,
    };
    onSave(saved);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-full sm:max-w-3xl max-h-[90vh] flex flex-col border border-[#e2e5e9] animate-slide-in-up">
        {/* Header */}
        <div className="border-b border-[#e2e5e9] px-2 sm:px-6 py-3 sm:py-5 flex items-center justify-between rounded-t-2xl shrink-0">
          <h2 className="text-lg font-bold text-[#1a1a2e]">
            {isEdit ? "Maç Düzenle" : "Yeni Maç Ekle"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-[#f1f3f5] rounded-lg transition-colors text-[#5a6170]">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-[#e2e5e9] px-2 sm:px-6 flex gap-1 shrink-0 overflow-x-auto">
          {[
            { key: "match" as const, label: "Maç Bilgisi" },
            { key: "squad" as const, label: `Kadro (${squad.length})` },
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
        <div className="flex-1 overflow-y-auto p-2 sm:p-6">
          {activeTab === "match" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
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
                <div>
                  <label className="block text-xs font-medium text-[#5a6170] mb-1.5">Hafta</label>
                  <input
                    type="number"
                    min={1}
                    value={form.week}
                    onChange={(e) => setForm({ ...form, week: e.target.value })}
                    placeholder="Hafta"
                    className="w-full px-3 py-2 bg-[#f8f9fb] border border-[#e2e5e9] rounded-lg text-sm text-[#1a1a2e] placeholder-[#8c919a] focus:outline-none focus:ring-2 focus:ring-[#c4111d]/20 focus:border-[#c4111d]/30 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#5a6170] mb-1.5">Yaş Grubu</label>
                  <select
                    value={form.ageGroup}
                    onChange={(e) => {
                      setForm({ ...form, ageGroup: e.target.value as AgeGroup });
                      setPlayerStats([]);
                    }}
                    className="w-full px-3 py-2 bg-[#f8f9fb] border border-[#e2e5e9] rounded-lg text-sm text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#c4111d]/20 focus:border-[#c4111d]/30 transition-all"
                    disabled={userRole?.role === "antrenor"}
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
                <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#f8f9fb] rounded-xl p-4 border border-[#e2e5e9]">
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

              {/* Match Time & Gathering Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#5a6170] mb-1.5">Maç Saati</label>
                  <input
                    type="time"
                    value={form.matchTime}
                    onChange={(e) => setForm({ ...form, matchTime: e.target.value })}
                    className="w-full px-3 py-2 bg-[#f8f9fb] border border-[#e2e5e9] rounded-lg text-sm text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#c4111d]/20 focus:border-[#c4111d]/30 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5a6170] mb-1.5">Toplanma Saati</label>
                  <input
                    type="time"
                    value={form.gatheringTime}
                    onChange={(e) => setForm({ ...form, gatheringTime: e.target.value })}
                    className="w-full px-3 py-2 bg-[#f8f9fb] border border-[#e2e5e9] rounded-lg text-sm text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#c4111d]/20 focus:border-[#c4111d]/30 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5a6170] mb-1.5">Toplanma Yeri</label>
                  <input
                    type="text"
                    value={form.gatheringLocation}
                    onChange={(e) => setForm({ ...form, gatheringLocation: e.target.value })}
                    placeholder="Toplanma noktası"
                    className="w-full px-3 py-2 bg-[#f8f9fb] border border-[#e2e5e9] rounded-lg text-sm text-[#1a1a2e] placeholder-[#8c919a] focus:outline-none focus:ring-2 focus:ring-[#c4111d]/20 focus:border-[#c4111d]/30 transition-all"
                  />
                </div>
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

          {/* KADRO TAB */}
          {activeTab === "squad" && (
            <div className="space-y-4">
              {/* Actions */}
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-[#5a6170] flex items-center gap-1.5">
                  <Users size={14} />
                  Kadro Seç ({form.ageGroup} · {form.season})
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAllForSquad}
                    className="px-3 py-1.5 text-[10px] font-semibold text-[#5a6170] bg-[#f1f3f5] rounded-lg hover:bg-[#e2e5e9] transition-all"
                  >
                    Tümünü Seç
                  </button>
                  <button
                    type="button"
                    onClick={clearSquad}
                    className="px-3 py-1.5 text-[10px] font-semibold text-[#c4111d] bg-red-50 rounded-lg hover:bg-red-100 transition-all"
                  >
                    Temizle
                  </button>
                </div>
              </div>

              {ageGroupPlayers.length === 0 && (
                <div className="text-center py-8 text-sm text-[#8c919a]">
                  Bu yaş grubu ve sezonda kayıtlı oyuncu bulunamadı.
                </div>
              )}

              {/* Player Search and Grid for Selection - Same Age Group */}
              <div className="mb-2">
                <input
                  type="text"
                  value={playerSearch}
                  onChange={e => setPlayerSearch(e.target.value)}
                  placeholder="Oyuncu ismiyle ara..."
                  className="w-full px-3 py-2 bg-[#f8f9fb] border border-[#e2e5e9] rounded-lg text-sm text-[#1a1a2e] placeholder-[#8c919a] focus:outline-none focus:ring-2 focus:ring-[#c4111d]/20 mb-2"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ageGroupPlayers
                  .filter(p =>
                    (p.firstName + " " + p.lastName)
                      .toLowerCase()
                      .includes(playerSearch.toLowerCase())
                  )
                  .sort((a, b) => a.jerseyNumber - b.jerseyNumber)
                  .map((p) => {
                    const selected = isInSquad(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => toggleSquadPlayer(p)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                          selected
                            ? "bg-[#c4111d]/5 border-[#c4111d]/30 ring-1 ring-[#c4111d]/20"
                            : "bg-white border-[#e2e5e9] hover:border-[#c4111d]/30"
                        }`}
                      >
                        <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                          selected ? "bg-[#c4111d] text-white" : "bg-[#f1f3f5] text-[#5a6170]"
                        }`}>
                          {p.jerseyNumber}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate ${selected ? "text-[#1a1a2e]" : "text-[#5a6170]"}`}>
                            {p.firstName} {p.lastName}
                          </p>
                          <p className="text-[10px] text-[#8c919a]">{p.position}</p>
                        </div>
                        {selected && (
                          <Check size={16} className="text-[#c4111d] shrink-0" />
                        )}
                      </button>
                    );
                  })}
              </div>

              {/* Other Age Groups */}
              {otherAgeGroupPlayers.length > 0 && (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowOtherAgeGroups(!showOtherAgeGroups)}
                    className="flex items-center gap-2 w-full py-2 text-xs font-semibold text-[#5a6170] hover:text-[#1a1a2e] transition-colors"
                  >
                    <UserPlus size={14} />
                    <span>Diğer Yaş Gruplarından Oyuncu Ekle ({otherAgeGroupPlayers.length})</span>
                    <span className={`ml-auto transition-transform duration-200 ${showOtherAgeGroups ? "rotate-180" : ""}`}>▾</span>
                  </button>
                  {showOtherAgeGroups && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {otherAgeGroupPlayers
                        .sort((a, b) => a.ageGroup.localeCompare(b.ageGroup) || a.jerseyNumber - b.jerseyNumber)
                        .map((p) => {
                          const selected = isInSquad(p.id);
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => toggleSquadPlayer(p)}
                              className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                                selected
                                  ? "bg-purple-50 border-purple-300 ring-1 ring-purple-200"
                                  : "bg-white border-[#e2e5e9] hover:border-purple-300"
                              }`}
                            >
                              <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                                selected ? "bg-purple-600 text-white" : "bg-[#f1f3f5] text-[#5a6170]"
                              }`}>
                                {p.jerseyNumber}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className={`text-sm font-semibold truncate ${selected ? "text-[#1a1a2e]" : "text-[#5a6170]"}`}>
                                    {p.firstName} {p.lastName}
                                  </p>
                                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 shrink-0">
                                    {p.ageGroup}
                                  </span>
                                </div>
                                <p className="text-[10px] text-[#8c919a]">{p.position}</p>
                              </div>
                              {selected && (
                                <Check size={16} className="text-purple-600 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}

              {/* Selected Squad Summary */}
              {squad.length > 0 && (
                <div className="bg-[#f8f9fb] border border-[#e2e5e9] rounded-xl p-4">
                  <p className="text-[10px] font-semibold text-[#8c919a] uppercase tracking-wider mb-2">
                    Seçilen Kadro ({squad.length} oyuncu)
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {squad
                      .sort((a, b) => a.jerseyNumber - b.jerseyNumber)
                      .map((s) => {
                        const isOtherGroup = players.find(p => p.id === s.playerId)?.ageGroup !== form.ageGroup;
                        return (
                          <span
                            key={s.playerId}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 bg-white border rounded-lg text-xs ${
                              isOtherGroup ? "border-purple-200" : "border-[#e2e5e9]"
                            }`}
                          >
                            <span className={`font-black ${isOtherGroup ? "text-purple-600" : "text-[#c4111d]"}`}>#{s.jerseyNumber}</span>
                            <span className="font-medium text-[#1a1a2e]">{s.playerName}</span>
                            {isOtherGroup && (
                              <span className="text-[7px] font-bold px-1 py-0.5 rounded bg-purple-100 text-purple-700">
                                {players.find(p => p.id === s.playerId)?.ageGroup}
                              </span>
                            )}
                          </span>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "players" && (
            <div className="space-y-4">
              {playerStats.length === 0 && (
                <div className="text-center py-8 text-sm text-[#8c919a]">
                  Önce <span className="font-semibold text-[#1a1a2e]">Kadro</span> sekmesinden oyuncu seçin veya aşağıdan manuel ekleyin.
                </div>
              )}

              {/* Tek arama kutusu ve hem eklenmiş hem eklenmemiş oyuncular için filtreleme */}
              <div className="bg-[#f8f9fb] border border-[#e2e5e9] rounded-xl p-3 mb-4">
                <p className="text-[10px] font-semibold text-[#8c919a] uppercase tracking-wider mb-2">
                  Oyuncu Ara / Ekle
                </p>
                <input
                  type="text"
                  value={playerSearch}
                  onChange={e => setPlayerSearch(e.target.value)}
                  placeholder="Oyuncu ismiyle ara..."
                  className="w-full px-3 py-2 bg-white border border-[#e2e5e9] rounded-lg text-xs text-[#1a1a2e] placeholder-[#8c919a] focus:outline-none focus:ring-2 focus:ring-[#c4111d]/20 mb-2"
                />
              </div>

              {/* Eklenmemiş oyuncular (filtreli) */}
              {unaddedPlayers.filter(p =>
                (p.firstName + " " + p.lastName)
                  .toLowerCase()
                  .includes(playerSearch.toLowerCase())
              ).length > 0 && (
                <div className="bg-[#f8f9fb] border border-[#e2e5e9] rounded-xl p-3 mb-4">
                  <p className="text-[10px] font-semibold text-[#8c919a] uppercase tracking-wider mb-2">
                    Eklenmemiş Oyuncular
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {unaddedPlayers
                      .filter(p =>
                        (p.firstName + " " + p.lastName)
                          .toLowerCase()
                          .includes(playerSearch.toLowerCase())
                      )
                      .sort((a, b) => a.jerseyNumber - b.jerseyNumber)
                      .map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => addPlayer(p)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-[#e2e5e9] rounded-lg text-xs hover:border-[#c4111d]/40 hover:bg-[#c4111d]/5 transition-all"
                        >
                          <Plus size={12} className="text-[#c4111d]" />
                          <span className="font-black text-[#c4111d]">#{p.jerseyNumber}</span>
                          <span className="font-medium text-[#1a1a2e]">{p.firstName} {p.lastName}</span>
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Eklenmiş oyuncular (filtreli) */}
              {playerStats.filter(ps =>
                (ps.playerName || "")
                  .toLowerCase()
                  .includes(playerSearch.toLowerCase())
              ).length > 0 && (
                <div className="space-y-3">
                  {playerStats
                    .filter(ps =>
                      (ps.playerName || "")
                        .toLowerCase()
                        .includes(playerSearch.toLowerCase())
                    )
                    .map((ps) => {
                      const psPlayer = players.find(p => p.id === ps.playerId);
                      const isOtherGroup = psPlayer && psPlayer.ageGroup !== form.ageGroup;
                      return (
                        <div key={ps.playerId} className={`bg-white border rounded-xl p-4 ${isOtherGroup ? "border-purple-200" : "border-[#e2e5e9]"}`}>
                          {/* Player Header */}
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${isOtherGroup ? "bg-purple-100 text-purple-700" : "bg-[#c4111d]/10 text-[#c4111d]"}`}>
                                {ps.jerseyNumber}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-sm font-semibold text-[#1a1a2e]">{ps.playerName}</p>
                                  {isOtherGroup && (
                                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">{psPlayer.ageGroup}</span>
                                  )}
                                </div>
                                <p className="text-[10px] text-[#8c919a]">{ps.position}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removePlayer(ps.playerId)}
                                className="p-1.5 text-[#8c919a] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                title="Oyuncuyu çıkar"
                              >
                                <Trash2 size={14} />
                              </button>
                          </div>

                          {/* Participation Status */}
                          {PARTICIPATION_STATUSES.length > 0 && (
                            <div className="mb-3">
                              <label className="block text-[10px] font-medium text-[#8c919a] mb-1.5">Katılım Durumu</label>
                              <div className="flex flex-wrap gap-1.5">
                                {PARTICIPATION_STATUSES.map((status) => {
                                  const active = ps.participationStatus === status;
                                  return (
                                    <button
                                      key={status}
                                      type="button"
                                      onClick={() => updatePlayerStat(ps.playerId, "participationStatus", active ? undefined : status)}
                                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all ${
                                        active
                                          ? statusColor(status)
                                          : "bg-white text-[#5a6170] border-[#e2e5e9] hover:border-[#c4111d]/30"
                                      }`}
                                    >
                                      {status}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

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
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
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
                      );
                    })}
                </div>
              )}

              <div className="space-y-3">
                {playerStats.map((ps) => {
                  const psPlayer = players.find(p => p.id === ps.playerId);
                  const isOtherGroup = psPlayer && psPlayer.ageGroup !== form.ageGroup;
                  return (
                  <div key={ps.playerId} className={`bg-white border rounded-xl p-4 ${isOtherGroup ? "border-purple-200" : "border-[#e2e5e9]"}`}>
                    {/* Player Header */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${isOtherGroup ? "bg-purple-100 text-purple-700" : "bg-[#c4111d]/10 text-[#c4111d]"}`}>
                          {ps.jerseyNumber}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-semibold text-[#1a1a2e]">{ps.playerName}</p>
                            {isOtherGroup && (
                              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">{psPlayer.ageGroup}</span>
                            )}
                          </div>
                          <p className="text-[10px] text-[#8c919a]">{ps.position}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removePlayer(ps.playerId)}
                          className="p-1.5 text-[#8c919a] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Oyuncuyu çıkar"
                        >
                          <Trash2 size={14} />
                        </button>
                    </div>

                    {/* Participation Status */}
                    {PARTICIPATION_STATUSES.length > 0 && (
                      <div className="mb-3">
                        <label className="block text-[10px] font-medium text-[#8c919a] mb-1.5">Katılım Durumu</label>
                        <div className="flex flex-wrap gap-1.5">
                          {PARTICIPATION_STATUSES.map((status) => {
                            const active = ps.participationStatus === status;
                            return (
                              <button
                                key={status}
                                type="button"
                                onClick={() => updatePlayerStat(ps.playerId, "participationStatus", active ? undefined : status)}
                                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all ${
                                  active
                                    ? statusColor(status)
                                    : "bg-white text-[#5a6170] border-[#e2e5e9] hover:border-[#c4111d]/30"
                                }`}
                              >
                                {status}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

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
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
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
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#e2e5e9] px-4 sm:px-6 py-4 flex items-center justify-end gap-3 shrink-0">
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
