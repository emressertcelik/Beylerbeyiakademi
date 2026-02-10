"use client";

import { useAgeGroup } from "@/context/AgeGroupContext";
import { getPlayersByAgeGroup, getStatsByAgeGroup, getPlayerSeasonSummary } from "@/lib/mock-data";
import { PLAYER_STATUS_MAP, POSITION_COLORS } from "@/types/player";

export default function StatsPage() {
  const { selectedAge } = useAgeGroup();
  const players = getPlayersByAgeGroup(selectedAge);
  const stats = getStatsByAgeGroup(selectedAge);

  if (players.length === 0) {
    return <div className="text-center py-20"><p className="text-[#8b949e] text-sm">{selectedAge} için veri bulunamadı.</p></div>;
  }

  const summaries = players.map((p) => ({ player: p, ...getPlayerSeasonSummary(p.id, stats) }));

  return (
    <div>
      <h1 className="text-xl font-bold text-[#1a1a1a] mb-1">Sezon Karnesi</h1>
      <p className="text-sm text-[#6e7781] mb-5">{selectedAge} · 2024-2025</p>
      <div className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e5e7eb] bg-[#f6f8fa]">
                {["#", "Oyuncu", "Mevki", "Maç", "Dk", "Gol", "Asist", "🟡", "🔴", "Durum"].map((h) => (
                  <th key={h} className={`py-2.5 px-3 text-[10px] font-bold text-[#8b949e] uppercase tracking-wider ${["Oyuncu", "Mevki"].includes(h) ? "text-left" : "text-center"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {summaries.sort((a, b) => a.player.jersey_number - b.player.jersey_number).map((s) => {
                const st = PLAYER_STATUS_MAP[s.player.status] || PLAYER_STATUS_MAP["active"];
                const pc = POSITION_COLORS[s.player.position];
                return (
                  <tr key={s.player.id} className="border-b border-[#f0f0f0] last:border-0 hover:bg-[#f6f8fa]">
                    <td className="py-2.5 px-3 text-center">
                      <div className={`w-6 h-6 mx-auto rounded-full bg-gradient-to-br ${pc?.avatar || "from-gray-400 to-gray-600"} flex items-center justify-center text-white text-[9px] font-bold`}>{s.player.jersey_number}</div>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-[#1a1a1a] whitespace-nowrap">{s.player.first_name} {s.player.last_name}</td>
                    <td className="py-2.5 px-3 text-[#57606a]">{s.player.position}</td>
                    <td className="py-2.5 px-3 text-center">{s.matches_played}</td>
                    <td className="py-2.5 px-3 text-center font-medium">{s.total_minutes}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-[#c4111d]">{s.total_goals || "-"}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-[#1b6e2a]">{s.total_assists || "-"}</td>
                    <td className="py-2.5 px-3 text-center">{s.total_yellow || "-"}</td>
                    <td className="py-2.5 px-3 text-center">{s.total_red || "-"}</td>
                    <td className="py-2.5 px-3 text-center"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${st.bg} ${st.color}`}>{st.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
