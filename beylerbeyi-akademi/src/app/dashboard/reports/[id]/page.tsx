"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAppData } from "@/lib/app-data";
import { fetchSkillLogs, fetchBodyLogs } from "@/lib/supabase/players";
import { SkillLog, BodyLog } from "@/types/player";
import {
  ArrowLeft, Trophy, Target, Clock, Star, Activity,
  TrendingUp, TrendingDown, Minus, Ruler,
  Weight, ChevronDown, Shield, Zap,
  Calendar, Swords, Flame,
} from "lucide-react";

/* ── Beceri Etiketleri ── */
const TACTICAL_LABELS: Record<string, string> = {
  positioning: "Pozisyon Alma", passing: "Pas", crossing: "Orta",
  shooting: "Şut", dribbling: "Dribling", heading: "Kafa Vuruşu",
  tackling: "Top Kesme", marking: "Adam Markajı", gameReading: "Oyun Okuma",
};
const ATHLETIC_LABELS: Record<string, string> = {
  speed: "Hız", strength: "Güç", stamina: "Dayanıklılık",
  agility: "Çeviklik", jumping: "Sıçrama", balance: "Denge", flexibility: "Esneklik",
};

/* ── Collapsible Section ── */
function Section({ title, icon: Icon, iconColor, badge, children, defaultOpen = true }: {
  title: string; icon: React.ElementType; iconColor: string;
  badge?: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const bgMap: Record<string, string> = {
    "text-blue-500": "bg-blue-50", "text-emerald-500": "bg-emerald-50",
    "text-indigo-500": "bg-indigo-50", "text-purple-500": "bg-purple-50",
    "text-[#c4111d]": "bg-red-50",
  };
  const iconBg = bgMap[iconColor] || "bg-gray-50";
  return (
    <div className="bg-white rounded-2xl border border-[#e2e5e9] shadow-sm overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-[#fafbfc] transition-colors">
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconBg}`}>
            <Icon size={15} className={iconColor} />
          </div>
          <h3 className="text-sm font-bold text-[#1a1a2e]">{title}</h3>
          {badge}
        </div>
        <ChevronDown size={16} className={`text-[#8c919a] transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-5 pb-5 border-t border-[#f0f1f3]">{children}</div>}
    </div>
  );
}

/* ── Skill Bar ── */
function SkillBar({ label, value, prevValue }: { label: string; value: number; prevValue?: number }) {
  const pct = (value / 10) * 100;
  const diff = prevValue !== undefined ? value - prevValue : undefined;
  const barColor = value >= 8 ? "bg-emerald-500" : value >= 6 ? "bg-blue-500" : value >= 4 ? "bg-amber-400" : "bg-red-400";

  return (
    <div className="group flex items-center gap-3 py-1.5 hover:bg-[#fafbfc] -mx-2 px-2 rounded-lg transition-colors">
      <span className="text-xs text-[#5a6170] w-28 shrink-0 group-hover:text-[#1a1a2e] transition-colors">{label}</span>
      <div className="flex-1 h-2 bg-[#e2e5e9] rounded-full overflow-hidden relative">
        {prevValue !== undefined && prevValue < value && (
          <div className="absolute h-full bg-emerald-200 rounded-full" style={{ width: `${pct}%` }} />
        )}
        <div className={`relative h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center gap-1 w-16 justify-end">
        <span className={`text-xs font-black ${value >= 8 ? "text-emerald-600" : value >= 6 ? "text-blue-600" : "text-[#1a1a2e]"}`}>{value}</span>
        {diff !== undefined && diff !== 0 && (
          <span className={`text-[9px] font-bold flex items-center ${diff > 0 ? "text-emerald-500" : "text-red-500"}`}>
            {diff > 0 ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
            <span className="ml-0.5">{diff > 0 ? "+" : ""}{diff}</span>
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Radial Progress Ring ── */
function RadialRing({ value, max = 10, size = 64, label, color }: {
  value: number; max?: number; size?: number; label: string; color: string;
}) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / max, 1);
  const offset = circumference * (1 - pct);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={4} />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={4}
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-white">
          {value.toFixed(1)}
        </span>
      </div>
      <span className="text-[10px] font-semibold text-white/60 uppercase tracking-wider">{label}</span>
    </div>
  );
}

export default function PlayerReportPage() {
  const params = useParams();
  const router = useRouter();
  const playerId = params.id as string;
  const { players, matches, loading } = useAppData();

  const [skillLogs, setSkillLogs] = useState<SkillLog[]>([]);
  const [bodyLogs, setBodyLogs] = useState<BodyLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  const player = useMemo(() => players.find((p) => p.id === playerId), [players, playerId]);

  useEffect(() => {
    if (!playerId) return;
    setLogsLoading(true);
    Promise.all([fetchSkillLogs(playerId), fetchBodyLogs(playerId)])
      .then(([sl, bl]) => { setSkillLogs(sl); setBodyLogs(bl); })
      .finally(() => setLogsLoading(false));
  }, [playerId]);

  /* ── Played matches ── */
  const playerMatches = useMemo(() => {
    return matches
      .filter((m) => m.status === "played" && m.playerStats.some((ps) => ps.playerId === playerId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [matches, playerId]);

  /* ── Aggregate stats ── */
  const matchStats = useMemo(() => {
    let starts = 0, subs = 0, totalMin = 0, goals = 0, assists = 0;
    let yellowCards = 0, redCards = 0, goalsConceded = 0, cleanSheets = 0;
    let ratingSum = 0, ratingCount = 0;
    const monthlyGoals = new Map<string, number>();
    const monthlyAssists = new Map<string, number>();
    const monthlyMatches = new Map<string, number>();

    for (const match of playerMatches) {
      const ps = match.playerStats.find((p) => p.playerId === playerId);
      if (!ps) continue;
      const sl = (ps.participationStatus || "").toLowerCase();
      if (sl.includes("ilk")) starts++;
      if (sl.includes("yedek") || sl.includes("sonradan")) subs++;
      totalMin += ps.minutesPlayed;
      goals += ps.goals;
      assists += ps.assists;
      yellowCards += ps.yellowCards;
      redCards += ps.redCards;
      goalsConceded += ps.goalsConceded;
      if (ps.cleanSheet) cleanSheets++;
      if (ps.rating) { ratingSum += ps.rating; ratingCount++; }
      const month = match.date.substring(0, 7);
      monthlyGoals.set(month, (monthlyGoals.get(month) || 0) + ps.goals);
      monthlyAssists.set(month, (monthlyAssists.get(month) || 0) + ps.assists);
      monthlyMatches.set(month, (monthlyMatches.get(month) || 0) + 1);
    }

    return {
      total: playerMatches.length, starts, subs, totalMin, goals, assists,
      yellowCards, redCards, goalsConceded, cleanSheets,
      avgRating: ratingCount > 0 ? ratingSum / ratingCount : 0, ratingCount,
      goalsPerMatch: playerMatches.length > 0 ? goals / playerMatches.length : 0,
      assistsPerMatch: playerMatches.length > 0 ? assists / playerMatches.length : 0,
      monthlyGoals, monthlyAssists, monthlyMatches,
    };
  }, [playerMatches, playerId]);

  const resultBreakdown = useMemo(() => {
    let w = 0, d = 0, l = 0;
    for (const m of playerMatches) { if (m.result === "W") w++; else if (m.result === "D") d++; else l++; }
    return { w, d, l };
  }, [playerMatches]);

  /* ── Skill changes ── */
  const skillChanges = useMemo(() => {
    const changes: Record<string, { first: number; current: number }> = {};
    for (const log of [...skillLogs].reverse()) {
      const key = `${log.category}:${log.skillName}`;
      if (!changes[key]) changes[key] = { first: log.oldValue, current: log.newValue };
      else changes[key].current = log.newValue;
    }
    return changes;
  }, [skillLogs]);

  /* ── Development summary ── */
  const skillDevSummary = useMemo(() => {
    let tacticalUp = 0, tacticalDown = 0, athleticUp = 0, athleticDown = 0;
    for (const [key, val] of Object.entries(skillChanges)) {
      const diff = val.current - val.first;
      if (key.startsWith("tactical:")) { if (diff > 0) tacticalUp += diff; else tacticalDown += Math.abs(diff); }
      else { if (diff > 0) athleticUp += diff; else athleticDown += Math.abs(diff); }
    }
    return { tacticalUp, tacticalDown, athleticUp, athleticDown };
  }, [skillChanges]);

  /* ── Body changes ── */
  const bodyChanges = useMemo(() => {
    const changes: Record<string, { first: number; current: number; logs: BodyLog[] }> = {};
    for (const log of [...bodyLogs].reverse()) {
      if (!changes[log.measurement]) changes[log.measurement] = { first: log.oldValue, current: log.newValue, logs: [log] };
      else { changes[log.measurement].current = log.newValue; changes[log.measurement].logs.push(log); }
    }
    return changes;
  }, [bodyLogs]);

  /* ── Monthly stats ── */
  const monthlyStats = useMemo(() => {
    const months = new Set<string>();
    matchStats.monthlyGoals.forEach((_, k) => months.add(k));
    matchStats.monthlyAssists.forEach((_, k) => months.add(k));
    matchStats.monthlyMatches.forEach((_, k) => months.add(k));
    return [...months].sort().map((m) => ({
      month: m,
      goals: matchStats.monthlyGoals.get(m) || 0,
      assists: matchStats.monthlyAssists.get(m) || 0,
      matches: matchStats.monthlyMatches.get(m) || 0,
    }));
  }, [matchStats]);

  /* ── Skill averages ── */
  const tacticalAvg = useMemo(() =>
    player ? +(Object.values(player.tactical).reduce((a, b) => a + b, 0) / 9).toFixed(1) : 0,
  [player]);
  const athleticAvg = useMemo(() =>
    player ? +(Object.values(player.athletic).reduce((a, b) => a + b, 0) / 7).toFixed(1) : 0,
  [player]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-[#e2e5e9] border-t-[#c4111d] rounded-full animate-spin" />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-[#8c919a]">Oyuncu bulunamadı.</p>
        <Link href="/dashboard/reports" className="text-sm text-[#c4111d] hover:underline mt-2 inline-block">← Raporlara dön</Link>
      </div>
    );
  }

  const age = Math.floor((Date.now() - new Date(player.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-xl font-bold text-[#1a1a2e]">Oyuncu Raporu</h1>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-[#8c919a]">Maç</span>
          <span className="text-[10px] font-semibold text-[#8c919a]">Gol</span>
          <span className="text-[10px] font-semibold text-[#8c919a]">Asist</span>
          <span className="text-[10px] font-semibold text-[#8c919a]">Sarı Kart</span>
          <span className="text-[10px] font-semibold text-[#8c919a]">Kırmızı</span>
          <span className="text-[10px] font-semibold text-[#8c919a]">Gole Kapatan</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="border-b border-[#e2e5e9] p-2.5 text-left">Maç</th>
              <th className="border-b border-[#e2e5e9] p-2.5 text-left">Gol</th>
              <th className="border-b border-[#e2e5e9] p-2.5 text-left">Asist</th>
              <th className="border-b border-[#e2e5e9] p-2.5 text-left">Sarı Kart</th>
              <th className="border-b border-[#e2e5e9] p-2.5 text-left">Kırmızı</th>
              <th className="border-b border-[#e2e5e9] p-2.5 text-left">Gole Kapatan</th>
            </tr>
          </thead>
          <tbody>
            {playerMatches.map((match) => {
              const ps = match.playerStats.find((p) => p.playerId === playerId);
              if (!ps) return null;
              const sl = (ps.participationStatus || "").toLowerCase();
              const isStart = sl.includes("ilk");
              const isSub = sl.includes("yedek") || sl.includes("sonradan");

              const rc = {
                W: { bg: "bg-emerald-500", text: "G", gradient: "from-emerald-50", border: "border-emerald-200" },
                D: { bg: "bg-amber-400", text: "B", gradient: "from-amber-50", border: "border-amber-200" },
                L: { bg: "bg-red-500", text: "M", gradient: "from-red-50", border: "border-red-200" },
              }[match.result] || { bg: "bg-gray-400", text: "?", gradient: "from-gray-50", border: "border-gray-200" };

              return (
                <div key={match.id} className={`bg-gradient-to-r ${rc.gradient} to-white rounded-xl border ${rc.border} p-4 hover:shadow-md transition-all`}>
                  {/* Top Row */}
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl ${rc.bg} flex flex-col items-center justify-center shadow-sm shrink-0`}>
                      <span className="text-xs font-black text-white leading-none">{rc.text}</span>
                      <span className="text-[9px] text-white/80 font-bold leading-none mt-0.5">{match.scoreHome}-{match.scoreAway}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-[#1a1a2e] truncate">
                          {match.homeAway === "home" ? "vs" : "@"} {match.opponent}
                        </p>
                        <span className="text-[8px] bg-[#1a1a2e]/5 text-[#5a6170] px-1.5 py-0.5 rounded font-semibold shrink-0">{match.ageGroup}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[10px] text-[#8c919a]">
                          {new Date(match.date).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" })}
                        </span>
                        {isStart && <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md font-bold">İlk 11</span>}
                        {isSub && <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md font-bold">Yedek</span>}
                      </div>
                    </div>
                    {ps.rating && (
                      <div className="flex items-center gap-0.5 bg-purple-50 px-2 py-1 rounded-lg shrink-0 border border-purple-100">
                        <Star size={12} className="text-purple-500" fill="currentColor" />
                        <span className="text-xs font-black text-purple-600">{ps.rating}</span>
                      </div>
                    )}
                  </div>
                  {/* Stats Chips */}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <div className="flex items-center gap-1 bg-white rounded-lg px-2.5 py-1 border border-[#e2e5e9] shadow-sm">
                      <Clock size={11} className="text-[#8c919a]" />
                      <span className="text-[10px] font-bold text-[#1a1a2e]">{ps.minutesPlayed}&apos;</span>
                    </div>
                    {ps.goals > 0 && (
                      <div className="flex items-center gap-1 bg-emerald-100 rounded-lg px-2.5 py-1 border border-emerald-200">
                        <Trophy size={11} className="text-emerald-600" />
                        <span className="text-[10px] font-bold text-emerald-700">{ps.goals} gol</span>
                      </div>
                    )}
                    {ps.assists > 0 && (
                      <div className="flex items-center gap-1 bg-blue-100 rounded-lg px-2.5 py-1 border border-blue-200">
                        <Target size={11} className="text-blue-600" />
                        <span className="text-[10px] font-bold text-blue-700">{ps.assists} asist</span>
                      </div>
                    )}
                    {ps.yellowCards > 0 && (
                      <div className="flex items-center gap-1 bg-yellow-100 rounded-lg px-2.5 py-1 border border-yellow-200">
                        <span className="w-2.5 h-3 rounded-[1px] bg-yellow-400" />
                        <span className="text-[10px] font-bold text-yellow-700">{ps.yellowCards}</span>
                      </div>
                    )}
                    {ps.redCards > 0 && (
                      <div className="flex items-center gap-1 bg-red-100 rounded-lg px-2.5 py-1 border border-red-200">
                        <span className="w-2.5 h-3 rounded-[1px] bg-red-500" />
                        <span className="text-[10px] font-bold text-red-700">{ps.redCards}</span>
                      </div>
                    )}
                    {ps.cleanSheet && (
                      <div className="flex items-center gap-1 bg-cyan-100 rounded-lg px-2.5 py-1 border border-cyan-200">
                        <Shield size={11} className="text-cyan-600" />
                        <span className="text-[10px] font-bold text-cyan-700">GK</span>
                      </div>
                    )}
                    {ps.goalsConceded > 0 && (
                      <div className="flex items-center gap-1 bg-orange-100 rounded-lg px-2.5 py-1 border border-orange-200">
                        <span className="text-[10px] font-bold text-orange-700">{ps.goalsConceded} YG</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
