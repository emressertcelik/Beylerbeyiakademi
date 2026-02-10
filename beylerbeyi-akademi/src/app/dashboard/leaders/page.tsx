"use client";

import { useAgeGroup } from "@/context/AgeGroupContext";
import { getPlayersByAgeGroup, getStatsByAgeGroup, getPlayerSeasonSummary } from "@/lib/mock-data";
import { POSITION_COLORS } from "@/types/player";

export default function LeadersPage() {
  const { selectedAge } = useAgeGroup();
  const players = getPlayersByAgeGroup(selectedAge);
  const stats = getStatsByAgeGroup(selectedAge);

  if (players.length === 0) {
    return <div className="text-center py-20"><p className="text-[#8b949e] text-sm">{selectedAge} için veri bulunamadı.</p></div>;
  }

  const summaries = players.map((p) => ({ player: p, ...getPlayerSeasonSummary(p.id, stats) }));
  const goals = [...summaries].sort((a, b) => b.total_goals - a.total_goals).filter((s) => s.total_goals > 0);
  const assists = [...summaries].sort((a, b) => b.total_assists - a.total_assists).filter((s) => s.total_assists > 0);
  const minutes = [...summaries].sort((a, b) => b.total_minutes - a.total_minutes).slice(0, 8);

  return (
    <div>
      <h1 className="text-xl font-bold text-[#1a1a1a] mb-1">Lider Tabloları</h1>
      <p className="text-sm text-[#6e7781] mb-6">{selectedAge} · 2024-2025</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Board title="⚽ Gol Krallığı" items={goals} field="total_goals" suffix="gol" color="red" />
        <Board title="🅰️ Asist Krallığı" items={assists} field="total_assists" suffix="asist" color="green" />
        <Board title="⏱ Süre Krallığı" items={minutes} field="total_minutes" suffix="dk" color="blue" />
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Board({ title, items, field, suffix, color }: { title: string; items: any[]; field: string; suffix: string; color: string }) {
  const max = Math.max(...items.map((i) => i[field]), 1);
  const barColor = color === "red" ? "bg-[#c4111d]" : color === "green" ? "bg-[#1b6e2a]" : "bg-[#0969da]";
  const textColor = color === "red" ? "text-[#c4111d]" : color === "green" ? "text-[#1b6e2a]" : "text-[#0969da]";

  return (
    <div className="bg-white border border-[#e5e7eb] rounded-xl p-5">
      <h3 className="text-sm font-bold text-[#1a1a1a] mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((s, i) => {
          const pc = POSITION_COLORS[s.player.position];
          return (
            <div key={s.player.id} className="flex items-center gap-2.5">
              <span className={`text-xs font-bold w-5 text-center ${i < 3 ? textColor : "text-[#8b949e]"}`}>{i + 1}</span>
              <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${pc?.avatar || "from-gray-400 to-gray-600"} flex items-center justify-center text-white text-[9px] font-bold`}>{s.player.jersey_number}</div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-xs font-medium text-[#1a1a1a] truncate">{s.player.first_name} {s.player.last_name}</span>
                  <span className={`text-xs font-bold ${textColor}`}>{s[field]} {suffix}</span>
                </div>
                <div className="h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                  <div className={`h-full ${barColor} rounded-full`} style={{ width: `${(s[field] / max) * 100}%` }} />
                </div>
              </div>
            </div>
          );
        })}
        {items.length === 0 && <p className="text-xs text-[#8b949e] text-center py-4">Veri yok</p>}
      </div>
    </div>
  );
}
