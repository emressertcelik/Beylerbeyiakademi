"use client";

import { Player } from "@/types/player";
import { X } from "lucide-react";

interface PlayerDetailModalProps {
  player: Player;
  onClose: () => void;
  onEdit: (player: Player) => void;
}

// Removed duplicate SkillBar definition
function SkillBar({ label, value, max = 10 }: { label: string; value: number; max?: number }) {
  const color =
    value >= 8 ? "bg-green-500" : value >= 6 ? "bg-amber-400" : value >= 4 ? "bg-orange-400" : "bg-red-400";
  const percent = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-[#57606a] w-24 shrink-0">{label}</span>
      <div className="flex-1 bg-[#f0f0f0] rounded-full h-2 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${percent}%` }} />
      </div>
      <span className="text-xs font-bold text-[#1a1a1a] w-8 text-right">{value}</span>
    </div>
  );
}

export default function PlayerDetailModal({ player, onClose, onEdit }: PlayerDetailModalProps) {
  const isGoalkeeper = player.position === "Kaleci";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md transition-all duration-300" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-gradient-to-br from-white via-[#f6f8fa] to-[#eaf0f6] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#e5e7eb]/60 animate-slide-in-up">
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-[#e5e7eb]/60 px-8 py-6 flex items-center justify-between z-10 rounded-t-3xl shadow-sm">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-[#c4111d]/10 border-2 border-[#c4111d]/20 flex items-center justify-center text-2xl font-black text-[#c4111d] shadow-md">
              {player.jerseyNumber}
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1a1a1a]">
                {player.firstName} {player.lastName}
              </h2>
              <p className="text-sm text-[#6e7781]">
                {player.position} · {player.ageGroup} · {player.foot} Ayak
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onEdit(player)}
              className="px-5 py-2 bg-gradient-to-r from-[#c4111d] to-[#a50e18] hover:from-[#a50e18] hover:to-[#c4111d] text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-md"
            >
              Düzenle
            </button>
            <button
              onClick={onClose}
              className="p-3 hover:bg-[#f6f8fa] rounded-xl transition-all duration-300 text-[#57606a]"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Genel Bilgiler */}
          <section>
            <h3 className="text-xs font-bold text-[#8b949e] uppercase tracking-wider mb-4">Genel Bilgiler</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <InfoBox label="Doğum Tarihi" value={new Date(player.birthDate).toLocaleDateString("tr-TR")} />
              <InfoBox label="Boy" value={`${player.height} cm`} />
              <InfoBox label="Kilo" value={`${player.weight} kg`} />
              <InfoBox label="Forma No" value={`#${player.jerseyNumber}`} />
            </div>
            {(player.phone || player.parentPhone) && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                {player.phone && <InfoBox label="Telefon" value={player.phone} />}
                {player.parentPhone && <InfoBox label="Veli Telefonu" value={player.parentPhone} />}
              </div>
            )}
            {player.notes && (
              <div className="mt-4 bg-[#f6f8fa] rounded-xl p-4 shadow-sm">
                <p className="text-[12px] text-[#8b949e] font-medium mb-2">Notlar</p>
                <p className="text-base text-[#1a1a1a]">{player.notes}</p>
              </div>
            )}
          </section>

          {/* İstatistikler */}
          <section>
            <h3 className="text-xs font-bold text-[#8b949e] uppercase tracking-wider mb-4">Maç İstatistikleri</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatBox label="Maç" value={player.stats.matches} />
              <StatBox label="Dk. Oynanan" value={player.stats.minutesPlayed} />
              {isGoalkeeper ? (
                <>
                  <StatBox label="Yenilen Gol" value={player.stats.goalsConceded} color="text-orange-600" />
                  <StatBox label="Clean Sheet" value={player.stats.cleanSheets} color="text-green-600" />
                </>
              ) : (
                <>
                  <StatBox label="Gol" value={player.stats.goals} color="text-green-600" />
                  <StatBox label="Asist" value={player.stats.assists} color="text-blue-600" />
                </>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-[#f6f8fa] rounded-xl p-4 flex items-center gap-4 shadow-sm">
                <span className="inline-block w-5 h-6 rounded-[4px] bg-yellow-400" />
                <div>
                  <p className="text-base font-bold text-[#1a1a1a]">{player.stats.yellowCards}</p>
                  <p className="text-[11px] text-[#8b949e]">Sarı Kart</p>
                </div>
              </div>
              <div className="bg-[#f6f8fa] rounded-xl p-4 flex items-center gap-4 shadow-sm">
                <span className="inline-block w-5 h-6 rounded-[4px] bg-red-500" />
                <div>
                  <p className="text-base font-bold text-[#1a1a1a]">{player.stats.redCards}</p>
                  <p className="text-[11px] text-[#8b949e]">Kırmızı Kart</p>
                </div>
              </div>
            </div>
          </section>

          {/* Taktik Değerler */}
          <section>
            <h3 className="text-xs font-bold text-[#8b949e] uppercase tracking-wider mb-4">Taktik Değerler</h3>
            <div className="bg-[#f6f8fa] rounded-2xl p-6 space-y-3 shadow-sm">
              <SkillBar label="Pozisyon Alma" value={player.tactical.positioning} max={10} />
              <SkillBar label="Pas" value={player.tactical.passing} max={10} />
              <SkillBar label="Orta" value={player.tactical.crossing} max={10} />
              <SkillBar label="Şut" value={player.tactical.shooting} max={10} />
              <SkillBar label="Dribling" value={player.tactical.dribbling} max={10} />
              <SkillBar label="Kafa Vuruşu" value={player.tactical.heading} max={10} />
              <SkillBar label="Top Kesme" value={player.tactical.tackling} max={10} />
              <SkillBar label="Markaj" value={player.tactical.marking} max={10} />
              <SkillBar label="Oyun Okuma" value={player.tactical.gameReading} max={10} />
            </div>
          </section>

          {/* Atletik Değerler */}
          <section>
            <h3 className="text-xs font-bold text-[#8b949e] uppercase tracking-wider mb-4">Atletik Değerler</h3>
            <div className="bg-[#f6f8fa] rounded-2xl p-6 space-y-3 shadow-sm">
              <SkillBar label="Hız" value={player.athletic.speed} max={10} />
              <SkillBar label="Güç" value={player.athletic.strength} max={10} />
              <SkillBar label="Dayanıklılık" value={player.athletic.stamina} max={10} />
              <SkillBar label="Çeviklik" value={player.athletic.agility} max={10} />
              <SkillBar label="Sıçrama" value={player.athletic.jumping} max={10} />
              <SkillBar label="Denge" value={player.athletic.balance} max={10} />
              <SkillBar label="Esneklik" value={player.athletic.flexibility} max={10} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#f6f8fa] rounded-lg p-3">
      <p className="text-[10px] text-[#8b949e] font-medium mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-[#1a1a1a]">{value}</p>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-[#f6f8fa] rounded-lg p-3 text-center">
      <p className={`text-lg font-bold ${color || "text-[#1a1a1a]"}`}>{value}</p>
      <p className="text-[10px] text-[#8b949e] font-medium">{label}</p>
    </div>
  );
}
