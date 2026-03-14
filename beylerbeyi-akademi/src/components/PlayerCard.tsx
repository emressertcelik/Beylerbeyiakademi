"use client";

import { Player } from "@/types/player";
import { getPositionAbbr, getPositionColors } from "@/lib/positions";

import Link from "next/link";

interface PlayerCardProps {
  player: Player;
  onClick?: (player: Player) => void;
  userRole?: { role: string };
}

export default function PlayerCard({ player, onClick, userRole }: PlayerCardProps) {
  const color = getPositionColors(player.position);
  const initials = `${player.firstName.charAt(0)}${player.lastName.charAt(0)}`;
  const birthYear = player.birthDate ? new Date(player.birthDate).getFullYear() : "";

  return (
    <button
      onClick={onClick ? () => onClick(player) : undefined}
      className={`rounded-xl overflow-hidden text-left transition-all duration-200 w-full group ${player.status === "passive" ? "bg-red-50 border border-[#c4111d]/40 hover:border-[#c4111d] hover:shadow-lg hover:shadow-[#c4111d]/10 opacity-80" : "bg-white border border-[#e2e5e9] hover:border-[#c4111d]/30 hover:shadow-lg hover:shadow-[#c4111d]/5"}`}
    >
      {/* Renkli başlık alanı */}
      <div className={`relative bg-gradient-to-br ${player.status === "passive" ? "from-[#c4111d] to-[#7f0d14]" : `${color.from} ${color.to}`} h-14 sm:h-16 flex items-center px-3 sm:px-4`}>
        <div className="absolute inset-0 bg-white/10" />
        {player.status === "passive" && (
          <span className="absolute top-1.5 right-2 text-[9px] font-black uppercase tracking-wider bg-black/25 text-white/90 px-1.5 py-0.5 rounded">
            PASİF
          </span>
        )}
        {/* Mevki kısaltması — pasif değilse göster */}
        {player.status !== "passive" && (
          <span className="absolute top-1.5 right-3 text-2xl sm:text-3xl font-black text-white/25 italic leading-none">
            {getPositionAbbr(player.position)}
          </span>
        )}
        {/* İsim baş harfleri */}
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/90 backdrop-blur flex items-center justify-center text-xs sm:text-sm font-black text-[#1a1a2e] shadow-sm shrink-0">
          {initials}
        </div>
        {/* İsim & pozisyon */}
        <div className="ml-2.5 min-w-0">
          <h3 className="text-xs sm:text-sm font-bold text-white truncate uppercase tracking-wide leading-tight">
            {player.firstName} {player.lastName}
          </h3>
          <p className="text-[10px] sm:text-xs text-white/90 mt-0.5 leading-tight">
            {player.position} | {birthYear}
          </p>
        </div>
      </div>

      {/* İstatistikler */}
      <div className={`grid grid-cols-3 gap-2 px-3 pt-3 sm:px-4 sm:pt-3 ${player.status === "passive" ? "bg-red-50 pb-2" : "pb-3 sm:pb-4"}`}>
        <StatBox label="SÜRE" value={`${player.stats.minutesPlayed}'`} borderColor="border-[#c4111d]" passive={player.status === "passive"} />
        <StatBox label="GOL" value={player.stats.goals} borderColor={player.status === "passive" ? "border-[#c4111d]" : "border-emerald-500"} passive={player.status === "passive"} />
        <StatBox label="ASİST" value={player.stats.assists} borderColor={player.status === "passive" ? "border-[#c4111d]" : "border-amber-400"} passive={player.status === "passive"} />
      </div>
    </button>
  );
}

function StatBox({
  label,
  value,
  borderColor,
  passive,
}: {
  label: string;
  value: React.ReactNode;
  borderColor: string;
  passive?: boolean;
}) {
  return (
    <div className={`rounded-lg py-2 px-1 text-center border-b-2 ${borderColor} ${passive ? "bg-red-100" : "bg-[#f8f9fb]"}`}>
      <div className={`text-[8px] sm:text-[9px] font-medium uppercase tracking-wider ${passive ? "text-red-400" : "text-[#8c919a]"}`}>{label}</div>
      <div className={`text-sm sm:text-base font-bold mt-0.5 ${passive ? "text-[#c4111d]" : "text-[#1a1a2e]"}`}>{value}</div>
    </div>
  );
}
