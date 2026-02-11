"use client";

import { Player } from "@/types/player";

interface PlayerCardProps {
  player: Player;
  onClick: (player: Player) => void;
}

const positionStyle: Record<string, { bg: string; text: string; dot: string }> = {
  Kaleci: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  Defans: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
  "Orta Saha": { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400" },
  Forvet: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-400" },
};

export default function PlayerCard({ player, onClick }: PlayerCardProps) {
  const isGoalkeeper = player.position === "Kaleci";
  const style = positionStyle[player.position] || { bg: "bg-slate-50", text: "text-slate-600", dot: "bg-slate-400" };

  return (
    <button
      onClick={() => onClick(player)}
      className="bg-white border border-[#e2e5e9] rounded-xl p-5 text-left hover:border-[#c4111d]/30 hover:shadow-lg hover:shadow-[#c4111d]/5 transition-all duration-200 w-full group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#f1f3f5] border border-[#e2e5e9] flex items-center justify-center text-lg font-black text-[#c4111d]">
            {player.jerseyNumber}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-[#1a1a2e] text-sm group-hover:text-[#c4111d] transition-colors truncate">
              {player.firstName} {player.lastName}
            </h3>
            <p className="text-xs text-[#8c919a] mt-0.5">
              {player.ageGroup} · {player.foot} Ayak · {player.seasons.join(", ")}
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg ${style.bg} ${style.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
          {player.position}
        </span>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#e2e5e9] mb-3" />

      {/* Previous Team */}
      {player.previousTeams && player.previousTeams.length > 0 && (
        <div className="mb-3 flex items-center gap-1.5 text-[11px] text-[#8c919a]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span className="truncate">{player.previousTeams[0].team}</span>
          <span className="text-[10px] text-[#b0b5bd]">({player.previousTeams[0].years})</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        <StatMini label="Maç" value={player.stats.matches} />
        {isGoalkeeper ? (
          <>
            <StatMini label="Y. Gol" value={player.stats.goalsConceded} color="text-orange-500" />
            <StatMini label="C. Kale" value={player.stats.cleanSheets} color="text-emerald-500" />
          </>
        ) : (
          <>
            <StatMini label="Gol" value={player.stats.goals} color="text-emerald-500" />
            <StatMini label="Asist" value={player.stats.assists} color="text-blue-500" />
          </>
        )}
        <StatMini
          label="Kart"
          value={
            <span className="flex items-center justify-center gap-1">
              <span className="inline-block w-2.5 h-3.5 rounded-[2px] bg-yellow-400" />
              <span className="text-xs text-[#1a1a2e]">{player.stats.yellowCards}</span>
              <span className="inline-block w-2.5 h-3.5 rounded-[2px] bg-red-500 ml-0.5" />
              <span className="text-xs text-[#1a1a2e]">{player.stats.redCards}</span>
            </span>
          }
        />
      </div>
    </button>
  );
}

function StatMini({
  label,
  value,
  color,
}: {
  label: string;
  value: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="bg-[#f8f9fb] rounded-lg py-2 px-1 text-center">
      <div className={`text-sm font-bold ${color || "text-[#1a1a2e]"}`}>{value}</div>
      <div className="text-[9px] text-[#8c919a] font-medium uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}
