"use client";

import { Match } from "@/types/match";
import { X, Edit3, Trash2, MapPin, Calendar, Clock } from "lucide-react";

interface MatchDetailModalProps {
  match: Match;
  onClose: () => void;
  onEdit: (match: Match) => void;
  onDelete?: (matchId: string) => void;
}

const resultLabel: Record<string, { text: string; color: string; bg: string }> = {
  W: { text: "Galibiyet", color: "text-emerald-700", bg: "bg-emerald-50" },
  D: { text: "Beraberlik", color: "text-amber-700", bg: "bg-amber-50" },
  L: { text: "Mağlubiyet", color: "text-red-700", bg: "bg-red-50" },
};

export default function MatchDetailModal({ match, onClose, onEdit, onDelete }: MatchDetailModalProps) {
  const r = resultLabel[match.result] || resultLabel.D;

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
            <button
              onClick={() => onEdit(match)}
              className="flex items-center gap-2 px-4 py-2 bg-[#c4111d] hover:bg-[#9b0d16] text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm"
            >
              <Edit3 size={14} />
              Düzenle
            </button>
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

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Score Card */}
          <div className="bg-[#f8f9fb] border border-[#e2e5e9] rounded-xl p-6">
            <div className="flex items-center justify-center gap-6">
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
            <div className="bg-[#f8f9fb] rounded-xl p-3 border border-[#e2e5e9]">
              <div className="flex items-center gap-1.5 text-[10px] text-[#8c919a] font-medium uppercase tracking-wider mb-1">
                <Clock size={10} /> Sezon
              </div>
              <p className="text-sm font-medium text-[#1a1a2e]">{match.season}</p>
            </div>
          </div>

          {match.notes && (
            <div className="bg-[#f8f9fb] rounded-xl p-4 border border-[#e2e5e9]">
              <p className="text-[10px] text-[#8c919a] font-medium uppercase tracking-wider mb-1">Notlar</p>
              <p className="text-sm text-[#1a1a2e]">{match.notes}</p>
            </div>
          )}

          {/* Player Stats Table */}
          {match.playerStats.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-[#1a1a2e] mb-3">Oyuncu İstatistikleri</h3>
              <div className="border border-[#e2e5e9] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-[#f8f9fb] border-b border-[#e2e5e9]">
                        <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-[#8c919a] uppercase tracking-wider">#</th>
                        <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-[#8c919a] uppercase tracking-wider">Oyuncu</th>
                        <th className="text-center px-2 py-2.5 text-[10px] font-semibold text-[#8c919a] uppercase tracking-wider">Dk</th>
                        <th className="text-center px-2 py-2.5 text-[10px] font-semibold text-[#8c919a] uppercase tracking-wider">Gol</th>
                        <th className="text-center px-2 py-2.5 text-[10px] font-semibold text-[#8c919a] uppercase tracking-wider">Asist</th>
                        <th className="text-center px-2 py-2.5 text-[10px] font-semibold text-[#8c919a] uppercase tracking-wider">SK</th>
                        <th className="text-center px-2 py-2.5 text-[10px] font-semibold text-[#8c919a] uppercase tracking-wider">KK</th>
                      </tr>
                    </thead>
                    <tbody>
                      {match.playerStats.map((ps, i) => (
                        <tr key={ps.playerId} className={`border-b border-[#e2e5e9] last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-[#fafbfc]"}`}>
                          <td className="px-3 py-2.5 font-bold text-[#c4111d]">{ps.jerseyNumber}</td>
                          <td className="px-3 py-2.5">
                            <span className="font-medium text-[#1a1a2e]">{ps.playerName}</span>
                            <span className="text-[#8c919a] ml-1">({ps.position})</span>
                          </td>
                          <td className="text-center px-2 py-2.5 text-[#1a1a2e]">{ps.minutesPlayed}&apos;</td>
                          <td className="text-center px-2 py-2.5 font-semibold text-emerald-600">{ps.goals || "-"}</td>
                          <td className="text-center px-2 py-2.5 font-semibold text-blue-600">{ps.assists || "-"}</td>
                          <td className="text-center px-2 py-2.5">
                            {ps.yellowCards > 0 && <span className="inline-block w-3 h-4 rounded-[2px] bg-yellow-400" />}
                          </td>
                          <td className="text-center px-2 py-2.5">
                            {ps.redCards > 0 && <span className="inline-block w-3 h-4 rounded-[2px] bg-red-500" />}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
