"use client";

import { Match } from "@/types/match";
import { X, Edit3, Trash2, MapPin, Calendar, Clock, Star, Users, Navigation } from "lucide-react";

interface MatchDetailModalProps {
  match: Match;
  onClose: () => void;
  onEdit?: (match: Match) => void;
  onDelete?: (matchId: string) => void;
}

const resultLabel: Record<string, { text: string; color: string; bg: string }> = {
  W: { text: "Galibiyet", color: "text-emerald-700", bg: "bg-emerald-50" },
  D: { text: "Beraberlik", color: "text-amber-700", bg: "bg-amber-50" },
  L: { text: "Mağlubiyet", color: "text-red-700", bg: "bg-red-50" },
};

function getStatusColorClasses(status: string): string {
  const s = status.toLowerCase();
  if (s === "ilk 11" || s === "ana kadro") return "bg-emerald-100 text-emerald-700";
  const colors: { [key: string]: string } = {
    "Sonradan Girdi": "bg-blue-100 text-blue-700",
    "Sakat": "bg-red-100 text-red-700",
    "Cezalı": "bg-orange-100 text-orange-700",
    "Kadroda Yok": "bg-gray-100 text-gray-700",
  };
  return colors[status] || "bg-gray-100 text-gray-700";
}

function getStatusLabel(status: string): string {
  const s = status.toLowerCase();
  if (s === "ana kadro") return "İlk 11";
  return status;
}

export default function MatchDetailModal({ match, onClose, onEdit, onDelete }: MatchDetailModalProps) {
  const r = resultLabel[match.result] || resultLabel.D;
  const isPlayed = match.status === "played";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-[#e2e5e9] animate-slide-in-up overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-[#e2e5e9] px-6 py-5 flex items-center justify-between z-10 rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-[#1a1a2e]">Maç Detayı</h2>
            <p className="text-sm text-[#5a6170] mt-0.5">
              {match.ageGroup} · {match.season} · {new Date(match.date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(match)}
                className="flex items-center gap-2 px-4 py-2 bg-[#c4111d] hover:bg-[#9b0d16] text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm"
              >
                <Edit3 size={14} />
                Düzenle
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => { if (confirm(`${match.opponent} maçı silinecek. Emin misiniz?`)) onDelete(match.id); }}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-red-50 text-[#c4111d] text-sm font-medium rounded-lg transition-all duration-200 border border-[#e2e5e9] hover:border-[#c4111d]/30"
              >
                <Trash2 size={14} />
                Sil
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-[#f1f3f5] rounded-lg transition-colors text-[#5a6170]">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6">
          {/* Score Card */}
          {isPlayed ? (
          <div className="bg-[#f8f9fb] border border-[#e2e5e9] rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-center gap-4 sm:gap-6">
              <div className="text-center flex-1">
                <p className="text-xs text-[#8c919a] font-semibold uppercase tracking-wider mb-1">
                  {match.homeAway === "home" ? "Ev Sahibi" : "Deplasman"}
                </p>
                <p className="text-sm font-bold text-[#1a1a2e]">Beylerbeyi</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black text-[#1a1a2e]">{match.scoreHome}</span>
                <span className="text-lg font-bold text-[#8c919a]">—</span>
                <span className="text-3xl font-black text-[#1a1a2e]">{match.scoreAway}</span>
              </div>
              <div className="text-center flex-1">
                <p className="text-xs text-[#8c919a] font-semibold uppercase tracking-wider mb-1">Rakip</p>
                <p className="text-sm font-bold text-[#1a1a2e]">{match.opponent}</p>
              </div>
            </div>
            <div className="flex justify-center mt-3">
              <span className={`text-xs font-semibold px-3 py-1 rounded-lg ${r.bg} ${r.color}`}>
                {r.text}
              </span>
            </div>
          </div>
          ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-center gap-4 sm:gap-6">
              <div className="text-center flex-1">
                <p className="text-xs text-[#8c919a] font-semibold uppercase tracking-wider mb-1">
                  {match.homeAway === "home" ? "Ev Sahibi" : "Deplasman"}
                </p>
                <p className="text-sm font-bold text-[#1a1a2e]">Beylerbeyi</p>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold text-amber-700">VS</span>
              </div>
              <div className="text-center flex-1">
                <p className="text-xs text-[#8c919a] font-semibold uppercase tracking-wider mb-1">Rakip</p>
                <p className="text-sm font-bold text-[#1a1a2e]">{match.opponent}</p>
              </div>
            </div>
            <div className="flex justify-center mt-3">
              <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-amber-100 text-amber-700">
                📅 Planlandı
              </span>
            </div>
          </div>
          )}

          {/* Match Info */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {match.venue && (
              <div className="bg-[#f8f9fb] rounded-xl p-3 border border-[#e2e5e9]">
                <div className="flex items-center gap-1.5 text-[10px] text-[#8c919a] font-medium uppercase tracking-wider mb-1">
                  <MapPin size={10} /> Saha
                </div>
                <p className="text-sm font-medium text-[#1a1a2e]">{match.venue}</p>
              </div>
            )}
            <div className="bg-[#f8f9fb] rounded-xl p-3 border border-[#e2e5e9]">
              <div className="flex items-center gap-1.5 text-[10px] text-[#8c919a] font-medium uppercase tracking-wider mb-1">
                <Calendar size={10} /> Tarih
              </div>
              <p className="text-sm font-medium text-[#1a1a2e]">
                {new Date(match.date).toLocaleDateString("tr-TR")}
              </p>
            </div>
            {match.matchTime && (
              <div className="bg-[#f8f9fb] rounded-xl p-3 border border-[#e2e5e9]">
                <div className="flex items-center gap-1.5 text-[10px] text-[#8c919a] font-medium uppercase tracking-wider mb-1">
                  <Clock size={10} /> Maç Saati
                </div>
                <p className="text-sm font-medium text-[#1a1a2e]">{match.matchTime}</p>
              </div>
            )}
            <div className="bg-[#f8f9fb] rounded-xl p-3 border border-[#e2e5e9]">
              <div className="flex items-center gap-1.5 text-[10px] text-[#8c919a] font-medium uppercase tracking-wider mb-1">
                <Clock size={10} /> Sezon
              </div>
              <p className="text-sm font-medium text-[#1a1a2e]">{match.season}</p>
            </div>
          </div>

          {/* SCHEDULED → Squad Card */}
          {!isPlayed && (match.squad ?? []).length > 0 && (
            <div className="rounded-xl overflow-hidden border border-[#e2e5e9]">
              <div className="bg-[#1a1a2e] px-4 sm:px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-white/70" />
                    <h3 className="text-sm font-bold text-white">Maç Kadrosu</h3>
                  </div>
                  <span className="text-xs font-semibold text-white/60 bg-white/10 px-2.5 py-1 rounded-lg">
                    {(match.squad ?? []).length} Oyuncu
                  </span>
                </div>
                {(match.gatheringTime || match.gatheringLocation) && (
                  <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-white/10">
                    {match.gatheringTime && (
                      <div className="flex items-center gap-1.5 text-xs text-white/80">
                        <Clock size={12} className="text-amber-400" />
                        <span>Toplanma: <span className="font-bold text-white">{match.gatheringTime}</span></span>
                      </div>
                    )}
                    {match.gatheringLocation && (
                      <div className="flex items-center gap-1.5 text-xs text-white/80">
                        <Navigation size={12} className="text-emerald-400" />
                        <span className="font-bold text-white">{match.gatheringLocation}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="bg-[#f8f9fb] divide-y divide-[#e2e5e9]">
                {(match.squad ?? [])
                  .slice()
                  .sort((a, b) => {
                    const order = ["Kaleci", "Defans", "Orta Saha", "Forvet"];
                    const aIdx = order.indexOf(a.position);
                    const bIdx = order.indexOf(b.position);
                    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
                    if (aIdx !== -1) return -1;
                    if (bIdx !== -1) return 1;
                    return a.position.localeCompare(b.position);
                  })
                  .map((s, i) => (
                    <div
                      key={s.playerId}
                      className={`flex items-center gap-3 px-4 sm:px-6 py-2.5 ${i % 2 === 0 ? "bg-white" : "bg-[#fafbfc]"}`}
                    >
                      <span className="w-8 h-8 rounded-lg bg-[#c4111d] text-white flex items-center justify-center text-xs font-black shrink-0">
                        {s.jerseyNumber}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1a1a2e] truncate">{s.playerName}</p>
                      </div>
                      <span className="text-[10px] font-medium text-[#8c919a] uppercase tracking-wider shrink-0">{s.position}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* PLAYED → Player Stats Card (same design as squad) */}
          {isPlayed && match.playerStats.length > 0 && (
            <div className="rounded-xl overflow-hidden border border-[#e2e5e9]">
              <div className="bg-[#1a1a2e] px-4 sm:px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star size={16} className="text-amber-400" />
                    <h3 className="text-sm font-bold text-white">Oyuncu İstatistikleri</h3>
                  </div>
                  <span className="text-xs font-semibold text-white/60 bg-white/10 px-2.5 py-1 rounded-lg">
                    {match.playerStats.length} Oyuncu
                  </span>
                </div>
              </div>
              <div className="bg-[#f8f9fb] divide-y divide-[#e2e5e9]">
                {match.playerStats
                  .slice()
                  .sort((a, b) => {
                    // Önce İlk 11/Ana Kadro, sonra Sonradan Girdi, sonra diğerleri
                    const statusOrder = (s: string | undefined) => {
                      const sl = (s || "").toLowerCase();
                      return sl === "ilk 11" || sl === "ana kadro" ? 0 : sl === "sonradan girdi" ? 1 : 2;
                    };
                    const cmp = statusOrder(a.participationStatus) - statusOrder(b.participationStatus);
                    if (cmp !== 0) return cmp;
                    return a.jerseyNumber - b.jerseyNumber;
                  })
                  .map((ps, i) => (
                    <div
                      key={ps.playerId}
                      className={`px-4 sm:px-6 py-3 ${i % 2 === 0 ? "bg-white" : "bg-[#fafbfc]"}`}
                    >
                      {/* Top row: Jersey + Name + Position */}
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-[#c4111d] text-white flex items-center justify-center text-xs font-black shrink-0">
                          {ps.jerseyNumber}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#1a1a2e] truncate">{ps.playerName}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <p className="text-[10px] text-[#8c919a]">{ps.position}</p>
                            {ps.participationStatus && (
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${getStatusColorClasses(ps.participationStatus)}`}>
                                {getStatusLabel(ps.participationStatus)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Stats row below */}
                      <div className="flex items-center gap-1.5 mt-2 ml-11 flex-wrap">
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-[#f1f3f5] text-[#5a6170] rounded text-[10px] font-semibold">
                          🕐 {ps.minutesPlayed}&apos;
                        </span>
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold">
                          ⚽ {ps.goals}
                        </span>
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold">
                          👟 {ps.assists}
                        </span>
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-yellow-50 text-yellow-700 rounded text-[10px] font-bold">
                          <span className="inline-block w-2.5 h-3.5 rounded-[1px] bg-yellow-400" /> {ps.yellowCards}
                        </span>
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-red-50 text-red-700 rounded text-[10px] font-bold">
                          <span className="inline-block w-2.5 h-3.5 rounded-[1px] bg-red-500" /> {ps.redCards}
                        </span>
                        {ps.rating && (
                          <div className="flex items-center gap-0.5 ml-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={10}
                                className={s <= ps.rating!
                                  ? "fill-amber-400 text-amber-400"
                                  : "fill-none text-gray-300"
                                }
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
