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
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* ═══ Header Card ═══ */}
      <div className="bg-gradient-to-br from-[#c4111d] to-[#e94a5a] rounded-2xl p-5 sm:p-6 text-white relative overflow-hidden border border-[#f8d7da] shadow-sm">
        {/* Logo */}
        <div className="absolute top-4 left-4 z-10">
          <Image src="/Logo_S.png" alt="Logo" width={48} height={48} className="rounded-xl shadow-md bg-white/80 p-1" />
        </div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#c4111d]/10 rounded-full -translate-y-12 translate-x-12" />
        <div className="absolute bottom-0 left-0 w-28 h-28 bg-[#c4111d]/5 rounded-full translate-y-10 -translate-x-10" />
        <div className="relative flex items-start gap-3 sm:gap-4">
          <button onClick={() => router.push("/dashboard/reports")} className="mt-1 p-1.5 rounded-lg hover:bg-white/10 transition-colors shrink-0">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-14 h-14 rounded-2xl bg-[#c4111d] flex items-center justify-center text-xl font-black shadow-lg shadow-[#c4111d]/30 shrink-0 text-white">
                {player.jerseyNumber}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {player.firstName} {player.lastName}
                </h1>
                <div className="flex items-center gap-2 text-xs text-white/90 mt-1 flex-wrap">
                  <span className="bg-white/20 px-2 py-0.5 rounded-md font-medium text-white">{player.position}</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-md font-medium text-white">{player.ageGroup}</span>
                  <span>{age} yaş</span>
                  <span className="text-white/50">·</span>
                  <span>{player.foot}</span>
                  <span className="text-white/50">·</span>
                  <span>{player.height}cm · {player.weight}kg</span>
                </div>
              </div>
            </div>
            {/* Skill Rings */}
            <div className="flex items-center gap-6 mt-5">
              <RadialRing value={tacticalAvg} label="Taktik" color="#fff" />
              <RadialRing value={athleticAvg} label="Atletik" color="#fff" />
              {matchStats.avgRating > 0 && (
                <RadialRing value={matchStats.avgRating} max={5} label="Puan" color="#fff" size={64} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Big Stat Cards ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
        <div className="bg-white rounded-2xl border border-[#e2e5e9] p-5 shadow-md flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#c4111d]/10 flex items-center justify-center"><Swords size={16} className="text-[#c4111d]" /></div>
            <span className="text-[10px] font-semibold text-[#8c919a] uppercase">Maç</span>
          </div>
          <p className="text-4xl font-extrabold text-[#c4111d] drop-shadow-sm">{matchStats.total}</p>
          <div className="flex gap-2 mt-2">
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-semibold">{matchStats.starts} İ11</span>
            <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-semibold">{matchStats.subs} Yedek</span>
          </div>
        </div>
        {player.position === "Kaleci" ? (
          <>
            <div className="bg-white rounded-2xl border border-[#e2e5e9] p-5 shadow-md flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center"><Trophy size={16} className="text-orange-600" /></div>
                <span className="text-[10px] font-semibold text-[#8c919a] uppercase">Yediği Gol</span>
              </div>
              <p className="text-4xl font-extrabold text-orange-600 drop-shadow-sm">{matchStats.goalsConceded}</p>
              <p className="text-xs text-[#8c919a] mt-1">{matchStats.total > 0 ? (matchStats.goalsConceded / matchStats.total).toFixed(2) : "0"} / maç</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#e2e5e9] p-5 shadow-md flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center"><Shield size={16} className="text-cyan-600" /></div>
                <span className="text-[10px] font-semibold text-[#8c919a] uppercase">Gole Kapatan</span>
              </div>
              <p className="text-4xl font-extrabold text-cyan-600 drop-shadow-sm">{matchStats.cleanSheets}</p>
              <p className="text-xs text-[#8c919a] mt-1">{matchStats.total > 0 ? (matchStats.cleanSheets / matchStats.total * 100).toFixed(0) : "0"}%</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#e2e5e9] p-5 shadow-none flex items-center justify-center">
              <span className="text-xs text-[#8c919a]">Kaleci için gol/asist istatistiği gösterilmez.</span>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-[#e2e5e9] p-5 shadow-md flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center"><Trophy size={16} className="text-emerald-600" /></div>
                <span className="text-[10px] font-semibold text-[#8c919a] uppercase">Gol</span>
              </div>
              <p className="text-4xl font-extrabold text-emerald-600 drop-shadow-sm">{matchStats.goals}</p>
              <p className="text-xs text-[#8c919a] mt-1">{matchStats.goalsPerMatch.toFixed(2)} / maç</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#e2e5e9] p-5 shadow-md flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><Target size={16} className="text-blue-600" /></div>
                <span className="text-[10px] font-semibold text-[#8c919a] uppercase">Asist</span>
              </div>
              <p className="text-4xl font-extrabold text-blue-600 drop-shadow-sm">{matchStats.assists}</p>
              <p className="text-xs text-[#8c919a] mt-1">{matchStats.assistsPerMatch.toFixed(2)} / maç</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#e2e5e9] p-5 shadow-md flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center"><Flame size={16} className="text-teal-600" /></div>
                <span className="text-[10px] font-semibold text-[#8c919a] uppercase">Gol Katkısı</span>
              </div>
              <p className="text-4xl font-extrabold text-teal-600 drop-shadow-sm">{matchStats.goals + matchStats.assists}</p>
              <p className="text-xs text-[#8c919a] mt-1">{matchStats.total > 0 ? ((matchStats.goals + matchStats.assists) / matchStats.total).toFixed(2) : "0"} / maç</p>
            </div>
          </>
        )}
      </div>

      {/* ═══ Extended Stats Row ═══ */}
      <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
        {[
          { l: "Dakika", v: matchStats.totalMin, c: "text-[#1a1a2e]", s: matchStats.total > 0 ? `${Math.round(matchStats.totalMin / matchStats.total)}dk/m` : "" },
          { l: "Galibiyet", v: resultBreakdown.w, c: "text-emerald-600", s: matchStats.total > 0 ? `%${Math.round((resultBreakdown.w / matchStats.total) * 100)}` : "" },
          { l: "Beraberlik", v: resultBreakdown.d, c: "text-amber-600", s: "" },
          { l: "Mağlubiyet", v: resultBreakdown.l, c: "text-red-500", s: "" },
          { l: "Sarı Kart", v: matchStats.yellowCards, c: "text-yellow-600", s: "" },
          { l: "Kırmızı", v: matchStats.redCards, c: "text-red-600", s: "" },
          { l: "Gole Kapatan", v: matchStats.cleanSheets, c: "text-cyan-600", s: "" },
        ].map((st) => (
          <div key={st.l} className="bg-white rounded-xl border border-[#e2e5e9] p-2.5 text-center shadow-sm">
            <p className="text-[9px] font-semibold text-[#8c919a] uppercase tracking-wider">{st.l}</p>
            <p className={`text-lg font-black mt-0.5 ${st.c}`}>{st.v}</p>
            {st.s && <p className="text-[9px] text-[#8c919a]">{st.s}</p>}
          </div>
        ))}
      </div>

      {/* ═══ Development Summary Banner ═══ */}
      {(skillDevSummary.tacticalUp > 0 || skillDevSummary.athleticUp > 0 || bodyChanges.height || bodyChanges.weight) && (
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl border border-emerald-100 p-5">
          <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-2 mb-3">
            <TrendingUp size={14} /> Gelişim Özeti
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {skillDevSummary.tacticalUp > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-center border border-white">
                <Shield size={20} className="text-blue-500 mx-auto mb-1" />
                <p className="text-xl font-black text-blue-600">+{skillDevSummary.tacticalUp}</p>
                <p className="text-[9px] text-[#8c919a] font-semibold uppercase mt-0.5">Taktik Artış</p>
                {skillDevSummary.tacticalDown > 0 && <p className="text-[9px] text-red-400 mt-0.5">-{skillDevSummary.tacticalDown} düşüş</p>}
              </div>
            )}
            {skillDevSummary.athleticUp > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-center border border-white">
                <Zap size={20} className="text-emerald-500 mx-auto mb-1" />
                <p className="text-xl font-black text-emerald-600">+{skillDevSummary.athleticUp}</p>
                <p className="text-[9px] text-[#8c919a] font-semibold uppercase mt-0.5">Atletik Artış</p>
                {skillDevSummary.athleticDown > 0 && <p className="text-[9px] text-red-400 mt-0.5">-{skillDevSummary.athleticDown} düşüş</p>}
              </div>
            )}
            {bodyChanges.height && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-center border border-white">
                <Ruler size={20} className="text-indigo-500 mx-auto mb-1" />
                <p className="text-xl font-black text-indigo-600">
                  {bodyChanges.height.current - bodyChanges.height.first > 0 ? "+" : ""}{bodyChanges.height.current - bodyChanges.height.first} cm
                </p>
                <p className="text-[9px] text-[#8c919a] font-semibold uppercase mt-0.5">Boy Değişimi</p>
                <p className="text-[9px] text-[#5a6170] mt-0.5">{bodyChanges.height.first} → {bodyChanges.height.current}</p>
              </div>
            )}
            {bodyChanges.weight && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-center border border-white">
                <Weight size={20} className="text-orange-500 mx-auto mb-1" />
                <p className="text-xl font-black text-orange-600">
                  {bodyChanges.weight.current - bodyChanges.weight.first > 0 ? "+" : ""}{bodyChanges.weight.current - bodyChanges.weight.first} kg
                </p>
                <p className="text-[9px] text-[#8c919a] font-semibold uppercase mt-0.5">Kilo Değişimi</p>
                <p className="text-[9px] text-[#5a6170] mt-0.5">{bodyChanges.weight.first} → {bodyChanges.weight.current}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ Skills Side-by-Side ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Section title="Taktik Beceriler" icon={Shield} iconColor="text-blue-500"
          badge={skillDevSummary.tacticalUp > 0 ? (
            <span className="text-[9px] bg-emerald-50 text-emerald-600 font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
              <TrendingUp size={9} /> +{skillDevSummary.tacticalUp}
            </span>
          ) : undefined}
        >
          <div className="space-y-1 mt-2">
            {Object.entries(TACTICAL_LABELS).map(([key, label]) => {
              const val = player.tactical[key as keyof typeof player.tactical];
              const change = skillChanges[`tactical:${key === "gameReading" ? "game_reading" : key}`];
              return <SkillBar key={key} label={label} value={val} prevValue={change?.first} />;
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-[#f0f1f3] flex items-center justify-between">
            <span className="text-[10px] font-semibold text-[#8c919a] uppercase">Ortalama</span>
            <span className="text-sm font-black text-blue-600">{tacticalAvg}</span>
          </div>
        </Section>
        <Section title="Atletik Beceriler" icon={Zap} iconColor="text-emerald-500"
          badge={skillDevSummary.athleticUp > 0 ? (
            <span className="text-[9px] bg-emerald-50 text-emerald-600 font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
              <TrendingUp size={9} /> +{skillDevSummary.athleticUp}
            </span>
          ) : undefined}
        >
          <div className="space-y-1 mt-2">
            {Object.entries(ATHLETIC_LABELS).map(([key, label]) => {
              const val = player.athletic[key as keyof typeof player.athletic];
              const change = skillChanges[`athletic:${key}`];
              return <SkillBar key={key} label={label} value={val} prevValue={change?.first} />;
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-[#f0f1f3] flex items-center justify-between">
            <span className="text-[10px] font-semibold text-[#8c919a] uppercase">Ortalama</span>
            <span className="text-sm font-black text-emerald-600">{athleticAvg}</span>
          </div>
        </Section>
      </div>

      {/* ═══ Physical Development ═══ */}
      <Section title="Fiziksel Gelişim" icon={Ruler} iconColor="text-indigo-500">
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="relative bg-gradient-to-br from-indigo-50 to-white rounded-xl p-4 border border-indigo-100 overflow-hidden">
            <Ruler size={40} className="absolute -top-1 -right-1 text-indigo-100 rotate-12" />
            <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">Boy</span>
            <p className="text-3xl font-black text-[#1a1a2e] mt-1">{player.height}<span className="text-sm font-normal text-[#8c919a] ml-0.5">cm</span></p>
            {bodyChanges.height ? (
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-1.5">
                  <TrendingUp size={12} className="text-emerald-500" />
                  <span className="text-xs font-bold text-emerald-600">
                    {bodyChanges.height.current - bodyChanges.height.first > 0 ? "+" : ""}{bodyChanges.height.current - bodyChanges.height.first} cm
                  </span>
                </div>
                <div className="w-full h-1.5 bg-indigo-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${Math.min(((bodyChanges.height.current - bodyChanges.height.first) / 20) * 100, 100)}%` }} />
                </div>
                <p className="text-[9px] text-[#8c919a]">{bodyChanges.height.first}cm → {bodyChanges.height.current}cm</p>
              </div>
            ) : <p className="text-[9px] text-[#8c919a] mt-2">Değişim kaydı yok</p>}
          </div>
          <div className="relative bg-gradient-to-br from-orange-50 to-white rounded-xl p-4 border border-orange-100 overflow-hidden">
            <Weight size={40} className="absolute -top-1 -right-1 text-orange-100 rotate-12" />
            <span className="text-[10px] font-semibold text-orange-400 uppercase tracking-wider">Kilo</span>
            <p className="text-3xl font-black text-[#1a1a2e] mt-1">{player.weight}<span className="text-sm font-normal text-[#8c919a] ml-0.5">kg</span></p>
            {bodyChanges.weight ? (
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-1.5">
                  {bodyChanges.weight.current - bodyChanges.weight.first >= 0
                    ? <TrendingUp size={12} className="text-emerald-500" />
                    : <TrendingDown size={12} className="text-red-500" />}
                  <span className={`text-xs font-bold ${bodyChanges.weight.current - bodyChanges.weight.first >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {bodyChanges.weight.current - bodyChanges.weight.first > 0 ? "+" : ""}{bodyChanges.weight.current - bodyChanges.weight.first} kg
                  </span>
                </div>
                <div className="w-full h-1.5 bg-orange-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${Math.min((Math.abs(bodyChanges.weight.current - bodyChanges.weight.first) / 15) * 100, 100)}%` }} />
                </div>
                <p className="text-[9px] text-[#8c919a]">{bodyChanges.weight.first}kg → {bodyChanges.weight.current}kg</p>
              </div>
            ) : <p className="text-[9px] text-[#8c919a] mt-2">Değişim kaydı yok</p>}
          </div>
        </div>
      </Section>

      {/* ═══ Monthly Performance ═══ */}
      {monthlyStats.length > 0 && (
        <Section title="Aylık Performans" icon={Activity} iconColor="text-indigo-500">
          <div className="mt-2 space-y-3">
            {monthlyStats.map((ms) => {
              const maxVal = Math.max(...monthlyStats.map((m) => m.goals + m.assists), 1);
              const monthName = new Date(ms.month + "-01").toLocaleDateString("tr-TR", { month: "short", year: "numeric" });
              return (
                <div key={ms.month}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold text-[#5a6170]">{monthName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-[#8c919a]">{ms.matches} maç</span>
                      <span className="text-[10px] font-bold text-[#1a1a2e]">{ms.goals + ms.assists} katkı</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 h-6">
                    {ms.goals > 0 && (
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-lg flex items-center justify-center transition-all"
                        style={{ width: `${Math.max((ms.goals / maxVal) * 100, 8)}%` }}>
                        <span className="text-[9px] font-bold text-white px-1">{ms.goals}G</span>
                      </div>
                    )}
                    {ms.assists > 0 && (
                      <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-lg flex items-center justify-center transition-all"
                        style={{ width: `${Math.max((ms.assists / maxVal) * 100, 8)}%` }}>
                        <span className="text-[9px] font-bold text-white px-1">{ms.assists}A</span>
                      </div>
                    )}
                    {ms.goals === 0 && ms.assists === 0 && (
                      <div className="h-full bg-[#e2e5e9] rounded-lg flex items-center px-2" style={{ width: "15%" }}>
                        <span className="text-[9px] text-[#8c919a]">—</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div className="flex items-center gap-4 pt-1">
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500" /><span className="text-[10px] text-[#8c919a]">Gol</span></div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-500" /><span className="text-[10px] text-[#8c919a]">Asist</span></div>
            </div>
          </div>
        </Section>
      )}

      {/* ═══ Skill History Log ═══ */}
      {!logsLoading && skillLogs.length > 0 && (
        <Section title="Beceri Gelişim Geçmişi" icon={TrendingUp} iconColor="text-purple-500" defaultOpen={false}
          badge={<span className="text-[9px] bg-purple-50 text-purple-600 font-bold px-1.5 py-0.5 rounded-md">{skillLogs.length}</span>}
        >
          <div className="space-y-1 max-h-72 overflow-y-auto mt-2 pr-1">
            {skillLogs.slice(0, 50).map((log) => {
              const labels = log.category === "tactical" ? TACTICAL_LABELS : ATHLETIC_LABELS;
              const readableKey = log.skillName === "game_reading" ? "gameReading" : log.skillName;
              const skillLabel = labels[readableKey] || log.skillName;
              const diff = log.newValue - log.oldValue;
              return (
                <div key={log.id} className="flex items-center justify-between bg-[#f8f9fb] hover:bg-[#f0f1f3] rounded-lg px-3 py-2 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${log.category === "tactical" ? "bg-blue-500" : "bg-emerald-500"}`} />
                    <span className="text-xs text-[#1a1a2e] font-medium">{skillLabel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#8c919a]">{log.oldValue}</span>
                    <span className="text-[10px] text-[#8c919a]">→</span>
                    <span className="text-[10px] font-bold text-[#1a1a2e]">{log.newValue}</span>
                    <span className={`text-[9px] font-bold flex items-center min-w-[28px] ${diff > 0 ? "text-emerald-500" : diff < 0 ? "text-red-500" : "text-[#8c919a]"}`}>
                      {diff > 0 ? "+" : ""}{diff}
                    </span>
                    <span className="text-[9px] text-[#b0b5bd] w-14 text-right">
                      {new Date(log.changedAt).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* ═══ Match History (Redesigned) ═══ */}
      <Section title={`Maç Geçmişi (${playerMatches.length})`} icon={Calendar} iconColor="text-[#c4111d]" defaultOpen={false}>
        {playerMatches.length === 0 ? (
          <p className="text-xs text-[#8c919a] text-center py-8">Henüz oynanmış maç yok.</p>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto mt-2 pr-1">
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
                        {/* Participation Status Badge */}
                        {(() => {
                          const status = (ps.participationStatus || "").toLowerCase();
                          if (status.includes("ilk")) return <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md font-bold">İlk 11</span>;
                          if (status.includes("yedek") || status.includes("sonradan")) return <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md font-bold">Yedek</span>;
                          if (status.includes("ceza")) return <span className="text-[8px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-md font-bold">Cezalı</span>;
                          if (status.includes("sakat")) return <span className="text-[8px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-md font-bold">Sakat</span>;
                          if (status.includes("kadroda yok")) return <span className="text-[8px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md font-bold">Kadroda Yok</span>;
                          if (status.includes("süre")) return <span className="text-[8px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md font-bold">Süre Almadı</span>;
                          return null;
                        })()}
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
          </div>
        )}
      </Section>
    </div>
  );
}