"use client";

import { Player } from "@/types/player";

import Link from "next/link";

interface PlayerCardProps {
  player: Player;
  onClick?: (player: Player) => void;
  userRole?: { role: string };
}

const positionColor: Record<string, { from: string; to: string }> = {
  Kaleci: { from: "from-amber-500", to: "to-amber-600" },
  Defans: { from: "from-[#7a8a9e]", to: "to-[#5a6a80]" },
  "Orta Saha": { from: "from-[#a0a5b5]", to: "to-[#858a9a]" },
  Forvet: { from: "from-[#c4111d]", to: "to-[#8b0d15]" },
  "Kanat Forvet": { from: "from-[#c4111d]", to: "to-[#8b0d15]" },
};

const defaultColor = { from: "from-[#9a9fb0]", to: "to-[#7b8095]" };

export default function PlayerCard({ player, onClick, userRole }: PlayerCardProps) {
  const color = positionColor[player.position] || defaultColor;
  const initials = `${player.firstName.charAt(0)}${player.lastName.charAt(0)}`;
  const birthYear = player.birthDate ? new Date(player.birthDate).getFullYear() : "";

  return (
    <button
      onClick={onClick ? () => onClick(player) : undefined}
      className="bg-white border border-[#e2e5e9] rounded-xl overflow-hidden text-left hover:border-[#c4111d]/30 hover:shadow-lg hover:shadow-[#c4111d]/5 transition-all duration-200 w-full group"
    >
      {/* Renkli başlık alanı */}
      <div className={`relative bg-gradient-to-br ${color.from} ${color.to} h-20 sm:h-24`}>
        {/* Forma numarası */}
        <span className="absolute top-2 right-3 text-2xl sm:text-3xl font-black text-white/25 italic leading-none">
          #{player.jerseyNumber}
        </span>
        {/* İsim baş harfleri */}
        <div className="absolute bottom-3 left-3 w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-white/90 backdrop-blur flex items-center justify-center text-sm sm:text-base font-black text-[#1a1a2e] shadow-sm">
          {initials}
        </div>
      </div>

      {/* İsim & pozisyon */}
      <div className="px-3 pt-3 pb-2 sm:px-4 sm:pt-4 sm:pb-3">
        <h3 className="text-xs sm:text-sm font-bold text-[#1a1a2e] group-hover:text-[#c4111d] transition-colors truncate uppercase tracking-wide">
          {player.firstName} {player.lastName}
        </h3>
        <p className="text-[10px] sm:text-xs text-[#8c919a] mt-0.5">
          {player.position} | {birthYear}
        </p>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-3 gap-2 px-3 pb-3 sm:px-4 sm:pb-4">
        <StatBox label="SÜRE" value={`${player.stats.minutesPlayed}'`} borderColor="border-[#c4111d]" />
        <StatBox label="GOL" value={player.stats.goals} borderColor="border-emerald-500" />
        <StatBox label="ASİST" value={player.stats.assists} borderColor="border-amber-400" />
      </div>
    </button>
  );
}

function StatBox({
  label,
  value,
  borderColor,
}: {
  label: string;
  value: React.ReactNode;
  borderColor: string;
}) {
  return (
    <div className={`bg-[#f8f9fb] rounded-lg py-2 px-1 text-center border-b-2 ${borderColor}`}>
      <div className="text-[8px] sm:text-[9px] text-[#8c919a] font-medium uppercase tracking-wider">{label}</div>
      <div className="text-sm sm:text-base font-bold text-[#1a1a2e] mt-0.5">{value}</div>
    </div>
  );
}
