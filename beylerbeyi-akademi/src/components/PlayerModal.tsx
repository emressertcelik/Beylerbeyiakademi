"use client";

import type { Player, PlayerMatchStat } from "@/types/player";
import { PLAYER_STATUS_MAP, POSITION_COLORS } from "@/types/player";
import { getPlayerSeasonSummary } from "@/lib/mock-data";

interface Props {
  player: Player;
  stats: PlayerMatchStat[];
  ageGroup: string;
  onClose: () => void;
}

const TECH_LABELS: Record<string, string> = {
  reflexes: "Refleks", positioning: "Pozisyon", distribution: "Dağıtım", communication: "İletişim", oneOnOne: "Bire Bir",
  tackle: "Müdahale", marking: "Adam Takip", heading: "Kafa", passing: "Pas", vision: "Vizyon",
  dribbling: "Dribling", shooting: "Şut", ballControl: "Top Kontrolü", finishing: "Bitiricilik", firstTouch: "İlk Dokunuş",
};
const PHYS_LABELS: Record<string, string> = {
  speed: "Hız", stamina: "Dayanıklılık", strength: "Güç", agility: "Çeviklik", jumping: "Sıçrama",
};

export default function PlayerModal({ player, stats, ageGroup, onClose }: Props) {
  const summary = getPlayerSeasonSummary(player.id, stats);
  const posColor = POSITION_COLORS[player.position];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-[#c4111d] to-[#1b6e2a] p-6 text-white rounded-t-2xl relative">
          <button onClick={onClose} className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${posColor?.avatar || "from-gray-400 to-gray-600"} flex items-center justify-center text-2xl font-bold shadow-lg`}>
              {player.jersey_number}
            </div>
            <div>
              <h2 className="text-xl font-bold">{player.first_name} {player.last_name}</h2>
              <p className="text-white/70 text-sm">{player.position} · #{player.jersey_number} · {ageGroup}</p>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {player.foot && <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">{player.foot} Ayak</span>}
                {player.birth_date && <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">{new Date(player.birth_date).getFullYear()}</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Sezon Özet */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            <MiniStat label="Maç" value={summary.matches_played} />
            <MiniStat label="Dakika" value={summary.total_minutes} />
            <MiniStat label="Gol" value={summary.total_goals} accent="red" />
            <MiniStat label="Asist" value={summary.total_assists} accent="green" />
            <MiniStat label="Sarı" value={summary.total_yellow} accent="yellow" />
            <MiniStat label="Kırmızı" value={summary.total_red} accent="red" />
          </div>

          {/* Kişisel Bilgiler */}
          <Section title="Kişisel Bilgiler">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {player.height && <Info label="Boy" value={`${player.height} cm`} />}
              {player.weight && <Info label="Kilo" value={`${player.weight} kg`} />}
              {player.blood_type && <Info label="Kan Grubu" value={player.blood_type} />}
              <Info label="Durum" value={PLAYER_STATUS_MAP[player.status]?.label || "Aktif"} badge className={`${PLAYER_STATUS_MAP[player.status]?.bg} ${PLAYER_STATUS_MAP[player.status]?.color}`} />
            </div>
          </Section>

          {/* Önceki Takımlar */}
          {player.previous_teams && player.previous_teams.length > 0 && (
            <Section title="Önceki Takımlar">
              <div className="flex flex-wrap gap-2">
                {player.previous_teams.map((team, i) => (
                  <div key={i} className="flex items-center gap-2 bg-[#f6f8fa] border border-[#e5e7eb] rounded-lg px-3 py-2">
                    <div className="w-6 h-6 rounded-full bg-[#e5e7eb] flex items-center justify-center">
                      <svg className="w-3 h-3 text-[#8b949e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M3 7v1a3 3 0 006 0V7m0 1a3 3 0 006 0V7m0 1a3 3 0 006 0V7H3l2-4h14l2 4" /></svg>
                    </div>
                    <span className="text-xs font-medium text-[#1a1a1a]">{team}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <svg className="w-3.5 h-3.5 text-[#1b6e2a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" /></svg>
                <span className="text-[11px] text-[#57606a]">Şu an: <span className="font-bold text-[#1b6e2a]">Beylerbeyi SK</span></span>
              </div>
            </Section>
          )}

          {/* Haftalık Süre — Çizgi Grafik */}
          <Section title="Haftalık Süre Grafiği">
            <LineChart weeklyStats={summary.weekly_stats} />
          </Section>

          {/* Maç Tablosu */}
          <Section title="Maç Bazlı Detay">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#e5e7eb] text-[#8b949e]">
                    <th className="text-left py-1.5 font-semibold">Hafta</th>
                    <th className="text-center py-1.5 font-semibold">Dk</th>
                    <th className="text-center py-1.5 font-semibold">Gol</th>
                    <th className="text-center py-1.5 font-semibold">Asist</th>
                    <th className="text-center py-1.5 font-semibold">🟡</th>
                    <th className="text-center py-1.5 font-semibold">🔴</th>
                    <th className="text-center py-1.5 font-semibold">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.weekly_stats.map((w) => {
                    const ws = PLAYER_STATUS_MAP[w.status] || PLAYER_STATUS_MAP["played"];
                    return (
                      <tr key={w.match_week} className="border-b border-[#f0f0f0] last:border-0">
                        <td className="py-1.5 font-medium text-[#1a1a1a]">Hafta {w.match_week}</td>
                        <td className="py-1.5 text-center">{w.status === "played" ? w.minutes_played : "-"}</td>
                        <td className="py-1.5 text-center font-bold text-[#c4111d]">{w.goals || "-"}</td>
                        <td className="py-1.5 text-center font-bold text-[#1b6e2a]">{w.assists || "-"}</td>
                        <td className="py-1.5 text-center">{w.yellow_cards || "-"}</td>
                        <td className="py-1.5 text-center">{w.red_cards || "-"}</td>
                        <td className="py-1.5 text-center"><span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${ws.bg} ${ws.color}`}>{ws.label}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Section>

          {/* Teknik Özellikler */}
          {player.technical && (
            <Section title="Teknik Özellikler">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(player.technical).map(([key, val]) => (
                  <SkillBar key={key} label={TECH_LABELS[key] || key} value={val} color="green" />
                ))}
              </div>
            </Section>
          )}

          {/* Fiziksel Özellikler */}
          {player.physical && (
            <Section title="Fiziksel Özellikler">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(player.physical).map(([key, val]) => (
                  <SkillBar key={key} label={PHYS_LABELS[key] || key} value={val} color="red" />
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

/* ========== Çizgi Grafik ========== */
function LineChart({ weeklyStats }: { weeklyStats: PlayerMatchStat[] }) {
  const weeks = weeklyStats;
  if (weeks.length === 0) return <p className="text-xs text-[#8b949e]">Veri yok</p>;

  const maxMin = Math.max(...weeks.map((w) => w.minutes_played), 90);
  const W = 500;
  const H = 200;
  const padL = 40;
  const padR = 20;
  const padT = 30;
  const padB = 30;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const getX = (i: number) => padL + (weeks.length > 1 ? (i / (weeks.length - 1)) * innerW : innerW / 2);
  const getY = (min: number) => padT + innerH - (min / maxMin) * innerH;

  const points = weeks.map((w, i) => ({
    x: getX(i),
    y: w.status === "played" && w.minutes_played > 0 ? getY(w.minutes_played) : getY(0),
    ...w,
  }));

  const playedPoints = points.filter((p) => p.status === "played" && p.minutes_played > 0);
  const linePath = playedPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = playedPoints.length > 1
    ? `${linePath} L${playedPoints[playedPoints.length - 1].x},${padT + innerH} L${playedPoints[0].x},${padT + innerH} Z`
    : "";

  // Y ekseni çizgileri
  const yTicks = [0, 15, 30, 45, 60, 75, 90].filter((v) => v <= maxMin);

  return (
    <div className="bg-[#fafafa] rounded-lg p-3 border border-[#e5e7eb]">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 180 }} preserveAspectRatio="xMidYMid meet">
        {/* Yatay grid çizgileri + Y etiketleri */}
        {yTicks.map((v) => {
          const y = getY(v);
          return (
            <g key={v}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray={v === 0 ? "0" : "4,4"} />
              <text x={padL - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#8b949e">{v}&apos;</text>
            </g>
          );
        })}

        {/* Dolgu alanı */}
        {areaPath && (
          <path d={areaPath} fill="url(#lineAreaGrad)" />
        )}

        {/* Çizgi */}
        {playedPoints.length > 1 && (
          <path d={linePath} fill="none" stroke="#1b6e2a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        )}

        {/* Noktalar ve etiketler */}
        {points.map((p, i) => {
          const isPlayed = p.status === "played" && p.minutes_played > 0;
          const notPlayed = p.status !== "played";

          return (
            <g key={i}>
              {/* Hafta etiketi */}
              <text x={p.x} y={H - 8} textAnchor="middle" fontSize="11" fill="#8b949e" fontWeight="600">H{p.match_week}</text>

              {isPlayed && (
                <>
                  {/* Dikey nokta çizgisi */}
                  <line x1={p.x} y1={p.y} x2={p.x} y2={padT + innerH} stroke="#1b6e2a" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.3" />
                  {/* Nokta dış halka */}
                  <circle cx={p.x} cy={p.y} r="6" fill="white" stroke="#1b6e2a" strokeWidth="2" />
                  {/* Nokta iç */}
                  <circle cx={p.x} cy={p.y} r="3" fill="#1b6e2a" />
                  {/* Gol/Asist — noktanın hemen üstünde */}
                  {(p.goals > 0 || p.assists > 0) && (() => {
                    const items: { text: string; fill: string; bgFill: string; bgStroke: string }[] = [];
                    if (p.goals > 0) items.push({ text: `⚽${p.goals}`, fill: "#c4111d", bgFill: "#fff1f0", bgStroke: "#c4111d" });
                    if (p.assists > 0) items.push({ text: `🅰${p.assists}`, fill: "#1b6e2a", bgFill: "#dafbe1", bgStroke: "#1b6e2a" });
                    const totalW = items.length * 30 + (items.length - 1) * 2;
                    const startX = p.x - totalW / 2;
                    return (
                      <g>
                        {items.map((item, idx) => {
                          const ix = startX + idx * 32;
                          const iy = p.y - 22;
                          return (
                            <g key={idx}>
                              <rect x={ix} y={iy} width="28" height="13" rx="3" fill={item.bgFill} stroke={item.bgStroke} strokeWidth="0.5" />
                              <text x={ix + 14} y={iy + 10} textAnchor="middle" fontSize="8" fontWeight="700" fill={item.fill}>{item.text}</text>
                            </g>
                          );
                        })}
                      </g>
                    );
                  })()}
                  {/* Dakika — gol/asist yoksa noktanın hemen üstünde, varsa biraz daha aşağıda */}
                  <text x={p.x} y={p.y - (p.goals > 0 || p.assists > 0 ? 36 : 12)} textAnchor="middle" fontSize="11" fontWeight="700" fill="#1b6e2a">{p.minutes_played}&apos;</text>
                </>
              )}

              {notPlayed && (
                <>
                  <rect x={p.x - 14} y={padT + innerH - 20} width="28" height="16" rx="4" fill={PLAYER_STATUS_MAP[p.status]?.bg === "bg-[#fff1f0]" ? "#fff1f0" : PLAYER_STATUS_MAP[p.status]?.bg === "bg-[#fff8c5]" ? "#fff8c5" : "#f0f0f0"} stroke="#e5e7eb" strokeWidth="0.5" />
                  <text x={p.x} y={padT + innerH - 9} textAnchor="middle" fontSize="9" fontWeight="700"
                    fill={p.status === "S" || p.status === "SA" ? "#c4111d" : p.status === "KY" || p.status === "KD" ? "#9a6700" : "#57606a"}>
                    {PLAYER_STATUS_MAP[p.status]?.label || p.status}
                  </text>
                </>
              )}
            </g>
          );
        })}

        {/* Gradient tanımı */}
        <defs>
          <linearGradient id="lineAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1b6e2a" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#1b6e2a" stopOpacity="0.02" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/* ========== Yardımcı Bileşenler ========== */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-[11px] font-bold text-[#8b949e] uppercase tracking-wider mb-2">{title}</h4>
      {children}
    </div>
  );
}

function MiniStat({ label, value, accent }: { label: string; value: number; accent?: string }) {
  const c = accent === "red" ? "text-[#c4111d]" : accent === "green" ? "text-[#1b6e2a]" : accent === "yellow" ? "text-[#f59e0b]" : "text-[#1a1a1a]";
  return (
    <div className="text-center bg-[#f6f8fa] rounded-lg py-2.5">
      <p className={`text-lg font-bold ${c}`}>{value}</p>
      <p className="text-[9px] text-[#8b949e]">{label}</p>
    </div>
  );
}

function Info({ label, value, badge, className }: { label: string; value: string; badge?: boolean; className?: string }) {
  return (
    <div>
      <span className="text-[#8b949e]">{label}</span>
      {badge ? <span className={`ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${className}`}>{value}</span> : <p className="text-[#1a1a1a] font-medium">{value}</p>}
    </div>
  );
}

function SkillBar({ label, value, color }: { label: string; value: number; color: "green" | "red" }) {
  const bg = color === "green" ? "bg-[#1b6e2a]" : "bg-[#c4111d]";
  return (
    <div>
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[11px] text-[#57606a]">{label}</span>
        <span className="text-[11px] font-bold text-[#1a1a1a]">{value}/10</span>
      </div>
      <div className="h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
        <div className={`h-full ${bg} rounded-full transition-all`} style={{ width: `${value * 10}%` }} />
      </div>
    </div>
  );
}
