"use client";

import { useAuth } from "@/hooks/useAuth";
import { ROLE_LABELS } from "@/types/roles";
import { useAgeGroup } from "@/context/AgeGroupContext";
import { getPlayersByAgeGroup, getMatchesByAgeGroup, getStatsByAgeGroup, getPlayerSeasonSummary } from "@/lib/mock-data";
import { POSITION_COLORS } from "@/types/player";

export default function DashboardPage() {
  const { user, role, loading } = useAuth();
  const { selectedAge } = useAgeGroup();

  if (loading || !user) return <div />;

  const players = getPlayersByAgeGroup(selectedAge);
  const matches = getMatchesByAgeGroup(selectedAge);
  const stats = getStatsByAgeGroup(selectedAge);
  const played = matches.filter((m) => m.status === "played");
  const wins = played.filter((m) => (m.is_home ? m.home_score > m.away_score : m.away_score > m.home_score)).length;

  const summaries = players.map((p) => ({ player: p, ...getPlayerSeasonSummary(p.id, stats) }));
  const topScorers = [...summaries].sort((a, b) => b.total_goals - a.total_goals).slice(0, 5);
  const totalGoals = summaries.reduce((a, s) => a + s.total_goals, 0);
  const maxGoal = Math.max(...topScorers.map((s) => s.total_goals), 1);

  const posDist = players.reduce<Record<string, number>>((acc, p) => { acc[p.position] = (acc[p.position] || 0) + 1; return acc; }, {});
  const posEntries = Object.entries(posDist);
  const noData = players.length === 0;

  return (
    <div>
      <div className="bg-gradient-to-r from-[#c4111d] to-[#1b6e2a] rounded-2xl p-6 sm:p-8 mb-6 text-white relative overflow-hidden">
        <div className="absolute right-4 bottom-0 opacity-5 text-[100px] font-black leading-none select-none">⚽</div>
        <p className="text-white/50 text-xs font-bold tracking-wider uppercase mb-1">{selectedAge}</p>
        <h1 className="text-xl sm:text-2xl font-bold relative z-10">Hoş Geldiniz 👋</h1>
        <p className="mt-1 text-white/70 text-sm relative z-10">Beylerbeyi Futbol Akademi &middot; {role ? ROLE_LABELS[role] : ""}</p>
      </div>

      {noData ? (
        <div className="text-center py-16">
          <p className="text-[#8b949e] text-sm">{selectedAge} yaş grubu için veri bulunamadı.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <Card label="Kadro" value={players.length} color="green" />
            <Card label="Oynanan Maç" value={played.length} color="red" />
            <Card label="Galibiyet" value={wins} color="green" />
            <Card label="Toplam Gol" value={totalGoals} color="red" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="lg:col-span-2 bg-white border border-[#e5e7eb] rounded-xl p-5">
              <h3 className="text-sm font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-[#c4111d] rounded-full" />Gol Krallığı
              </h3>
              <div className="space-y-2.5">
                {topScorers.filter((s) => s.total_goals > 0).map((s, i) => {
                  const pc = POSITION_COLORS[s.player.position];
                  return (
                    <div key={s.player.id} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-[#8b949e] w-4">{i + 1}</span>
                      <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${pc?.avatar || "from-gray-400 to-gray-600"} flex items-center justify-center text-white text-[10px] font-bold`}>{s.player.jersey_number}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-medium text-[#1a1a1a]">{s.player.first_name} {s.player.last_name}</span>
                          <div className="flex gap-2">
                            <span className="text-xs font-bold text-[#c4111d]">{s.total_goals}G</span>
                            <span className="text-xs font-bold text-[#1b6e2a]">{s.total_assists}A</span>
                          </div>
                        </div>
                        <div className="h-2 bg-[#f0f0f0] rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#c4111d] to-[#c4111d]/60 rounded-full" style={{ width: `${(s.total_goals / maxGoal) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
                {topScorers.filter((s) => s.total_goals > 0).length === 0 && (
                  <p className="text-xs text-[#8b949e] text-center py-4">Henüz gol verisi yok</p>
                )}
              </div>
            </div>

            <div className="bg-white border border-[#e5e7eb] rounded-xl p-5">
              <h3 className="text-sm font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-[#1b6e2a] rounded-full" />Pozisyon Dağılımı
              </h3>
              <div className="space-y-3">
                {posEntries.map(([pos, count]) => {
                  const pc = POSITION_COLORS[pos];
                  const pct = Math.round((count / players.length) * 100);
                  return (
                    <div key={pos}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-semibold ${pc?.text || "text-[#57606a]"}`}>{pos}</span>
                        <span className="text-xs text-[#8b949e]">{count} (%{pct})</span>
                      </div>
                      <div className="h-2 bg-[#f0f0f0] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${pos === "Kaleci" ? "bg-[#f59e0b]" : pos === "Defans" ? "bg-[#0969da]" : pos === "Orta Saha" ? "bg-[#1b6e2a]" : "bg-[#c4111d]"}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#e5e7eb] rounded-xl p-5">
            <h3 className="text-sm font-bold text-[#1a1a1a] mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-[#c4111d] rounded-full" />Son Maçlar
            </h3>
            <div className="space-y-2">
              {[...played].reverse().slice(0, 5).map((m) => {
                const bs = m.is_home ? m.home_score : m.away_score;
                const os = m.is_home ? m.away_score : m.home_score;
                const r = bs > os ? "G" : bs < os ? "M" : "B";
                return (
                  <div key={m.id} className="flex items-center justify-between py-2 border-b border-[#f0f0f0] last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-[#8b949e] bg-[#f6f8fa] px-1.5 py-0.5 rounded">H{m.week}</span>
                      <span className="text-sm text-[#1a1a1a]">vs {m.opponent}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${m.is_home ? "bg-[#dafbe1] text-[#116329]" : "bg-[#f6f8fa] text-[#57606a]"}`}>{m.is_home ? "İÇ" : "DIŞ"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{m.home_score}-{m.away_score}</span>
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${r === "G" ? "bg-[#1b6e2a]" : r === "M" ? "bg-[#c4111d]" : "bg-[#f59e0b]"}`}>{r}</span>
                    </div>
                  </div>
                );
              })}
              {played.length === 0 && <p className="text-xs text-[#8b949e] text-center py-4">Henüz maç verisi yok</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Card({ label, value, color }: { label: string; value: number; color: "red" | "green" }) {
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-xl p-4">
      <p className="text-2xl font-bold text-[#1a1a1a]">{value}</p>
      <p className="text-xs text-[#8b949e] mt-0.5 flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${color === "red" ? "bg-[#c4111d]" : "bg-[#1b6e2a]"}`} />{label}
      </p>
    </div>
  );
}
