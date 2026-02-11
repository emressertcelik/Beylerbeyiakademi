"use client";

import { Player } from "@/types/player";

interface PlayerCardProps {
  player: Player;
  onClick: (player: Player) => void;
}

const positionColor: Record<string, string> = {
  Kaleci: "bg-amber-100 text-amber-700",
  Defans: "bg-blue-100 text-blue-700",
  "Orta Saha": "bg-green-100 text-green-700",
  Forvet: "bg-red-100 text-red-700",
};

export default function PlayerCard({ player, onClick }: PlayerCardProps) {
  const isGoalkeeper = player.position === "Kaleci";

  return (
    <button
      onClick={() => onClick(player)}
      className="bg-gradient-to-br from-white via-[#f6f8fa] to-[#eaf0f6] border border-[#e5e7eb]/60 rounded-2xl p-6 text-left hover:border-[#c4111d]/30 hover:shadow-xl transition-all duration-300 w-full group animate-fade-in"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#f6f8fa] border-2 border-[#e5e7eb]/60 flex items-center justify-center text-xl font-black text-[#c4111d] shadow-sm">
            {player.jerseyNumber}
          </div>
          <div>
            <h3 className="font-bold text-[#1a1a1a] text-base group-hover:text-[#c4111d] transition-colors">
              {player.firstName} {player.lastName}
            </h3>
            <p className="text-[12px] text-[#6e7781]">{player.ageGroup} · {player.foot} Ayak</p>
          </div>
        </div>
        <span className={`text-[11px] font-bold px-3 py-1 rounded-lg ${positionColor[player.position] || "bg-slate-100 text-slate-600"} shadow-sm`}>
          {player.position}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-3">
        <StatMini label="Maç" value={player.stats.matches} />
        {isGoalkeeper ? (
          <>
            <StatMini label="Y. Gol" value={player.stats.goalsConceded} color="text-orange-600" />
            <StatMini label="C. Kale" value={player.stats.cleanSheets} color="text-green-600" />
          </>
        ) : (
          <>
            <StatMini label="Gol" value={player.stats.goals} color="text-green-600" />
            <StatMini label="Asist" value={player.stats.assists} color="text-blue-600" />
          </>
        )}
        <StatMini
          label="Kart"
          value={
            <span className="flex items-center justify-center gap-1">
              <span className="inline-block w-3 h-4 rounded-[3px] bg-yellow-400" />
              <span className="text-[12px]">{player.stats.yellowCards}</span>
              <span className="inline-block w-3 h-4 rounded-[3px] bg-red-500 ml-0.5" />
              <span className="text-[12px]">{player.stats.redCards}</span>
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
    <div className="bg-[#f6f8fa] rounded-lg py-2 px-1 text-center">
      <div className={`text-sm font-bold ${color || "text-[#1a1a1a]"}`}>{value}</div>
      <div className="text-[9px] text-[#8b949e] font-medium uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}
