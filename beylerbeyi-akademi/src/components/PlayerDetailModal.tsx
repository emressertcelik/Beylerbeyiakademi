"use client";

import { Player } from "@/types/player";
import { X, Edit3 } from "lucide-react";

interface PlayerDetailModalProps {
  player: Player;
  onClose: () => void;
  onEdit: (player: Player) => void;
}

function SkillBar({ label, value, max = 10 }: { label: string; value: number; max?: number }) {
  const color =
    value >= 8 ? "bg-emerald-500" : value >= 6 ? "bg-amber-400" : value >= 4 ? "bg-orange-400" : "bg-red-400";
  const percent = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[#5a6170] w-24 shrink-0">{label}</span>
      <div className="flex-1 bg-[#e2e5e9] rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs font-bold text-[#1a1a2e] w-7 text-right">{value}</span>
    </div>
  );
}

export default function PlayerDetailModal({ player, onClose, onEdit }: PlayerDetailModalProps) {
  const isGoalkeeper = player.position === "Kaleci";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#e2e5e9] animate-slide-in-up">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-[#e2e5e9] px-6 py-5 flex items-center justify-between z-10 rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#c4111d]/10 flex items-center justify-center text-xl font-black text-[#c4111d]">
              {player.jerseyNumber}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1a1a2e]">
                {player.firstName} {player.lastName}
              </h2>
              <p className="text-sm text-[#5a6170]">
                {player.position} · {player.ageGroup} · {player.foot} Ayak
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(player)}
              className="flex items-center gap-2 px-4 py-2 bg-[#c4111d] hover:bg-[#9b0d16] text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm"
            >
              <Edit3 size={14} />
              Düzenle
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#f1f3f5] rounded-lg transition-colors text-[#5a6170]"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Genel Bilgiler */}
          <Section title="Genel Bilgiler">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <InfoBox label="Doğum Tarihi" value={new Date(player.birthDate).toLocaleDateString("tr-TR")} />
              <InfoBox label="Boy" value={`${player.height} cm`} />
              <InfoBox label="Kilo" value={`${player.weight} kg`} />
              <InfoBox label="Forma No" value={`#${player.jerseyNumber}`} />
            </div>
            {(player.phone || player.parentPhone) && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                {player.phone && <InfoBox label="Telefon" value={player.phone} />}
                {player.parentPhone && <InfoBox label="Veli Telefonu" value={player.parentPhone} />}
              </div>
            )}
            {player.notes && (
              <div className="mt-3 bg-[#f8f9fb] rounded-xl p-4 border border-[#e2e5e9]">
                <p className="text-[11px] text-[#8c919a] font-medium uppercase tracking-wider mb-1.5">Notlar</p>
                <p className="text-sm text-[#1a1a2e] leading-relaxed">{player.notes}</p>
              </div>
            )}
          </Section>

          {/* İstatistikler */}
          <Section title="Maç İstatistikleri">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatBox label="Maç" value={player.stats.matches} />
              <StatBox label="Dk. Oynanan" value={player.stats.minutesPlayed} />
              {isGoalkeeper ? (
                <>
                  <StatBox label="Yenilen Gol" value={player.stats.goalsConceded} color="text-orange-500" />
                  <StatBox label="Clean Sheet" value={player.stats.cleanSheets} color="text-emerald-500" />
                </>
              ) : (
                <>
                  <StatBox label="Gol" value={player.stats.goals} color="text-emerald-500" />
                  <StatBox label="Asist" value={player.stats.assists} color="text-blue-500" />
                </>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="bg-[#f8f9fb] rounded-xl p-4 flex items-center gap-3 border border-[#e2e5e9]">
                <span className="inline-block w-4 h-5 rounded-[3px] bg-yellow-400" />
                <div>
                  <p className="text-base font-bold text-[#1a1a2e]">{player.stats.yellowCards}</p>
                  <p className="text-[11px] text-[#8c919a]">Sarı Kart</p>
                </div>
              </div>
              <div className="bg-[#f8f9fb] rounded-xl p-4 flex items-center gap-3 border border-[#e2e5e9]">
                <span className="inline-block w-4 h-5 rounded-[3px] bg-red-500" />
                <div>
                  <p className="text-base font-bold text-[#1a1a2e]">{player.stats.redCards}</p>
                  <p className="text-[11px] text-[#8c919a]">Kırmızı Kart</p>
                </div>
              </div>
            </div>
          </Section>

          {/* Taktik Değerler */}
          <Section title="Taktik Değerler">
            <div className="bg-[#f8f9fb] rounded-xl p-5 space-y-3 border border-[#e2e5e9]">
              <SkillBar label="Pozisyon Alma" value={player.tactical.positioning} />
              <SkillBar label="Pas" value={player.tactical.passing} />
              <SkillBar label="Orta" value={player.tactical.crossing} />
              <SkillBar label="Şut" value={player.tactical.shooting} />
              <SkillBar label="Dribling" value={player.tactical.dribbling} />
              <SkillBar label="Kafa Vuruşu" value={player.tactical.heading} />
              <SkillBar label="Top Kesme" value={player.tactical.tackling} />
              <SkillBar label="Markaj" value={player.tactical.marking} />
              <SkillBar label="Oyun Okuma" value={player.tactical.gameReading} />
            </div>
          </Section>

          {/* Atletik Değerler */}
          <Section title="Atletik Değerler">
            <div className="bg-[#f8f9fb] rounded-xl p-5 space-y-3 border border-[#e2e5e9]">
              <SkillBar label="Hız" value={player.athletic.speed} />
              <SkillBar label="Güç" value={player.athletic.strength} />
              <SkillBar label="Dayanıklılık" value={player.athletic.stamina} />
              <SkillBar label="Çeviklik" value={player.athletic.agility} />
              <SkillBar label="Sıçrama" value={player.athletic.jumping} />
              <SkillBar label="Denge" value={player.athletic.balance} />
              <SkillBar label="Esneklik" value={player.athletic.flexibility} />
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-xs font-semibold text-[#8c919a] uppercase tracking-wider mb-3">{title}</h3>
      {children}
    </section>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#f8f9fb] rounded-lg p-3 border border-[#e2e5e9]">
      <p className="text-[10px] text-[#8c919a] font-medium mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-[#1a1a2e]">{value}</p>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-[#f8f9fb] rounded-lg p-3 text-center border border-[#e2e5e9]">
      <p className={`text-lg font-bold ${color || "text-[#1a1a2e]"}`}>{value}</p>
      <p className="text-[10px] text-[#8c919a] font-medium">{label}</p>
    </div>
  );
}
