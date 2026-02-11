"use client";

import { useMemo, useState } from "react";
import { Users, TrendingUp, Calendar, Award, Trophy, Target, Shield, MapPin, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAppData } from "@/lib/app-data";
import { Match } from "@/types/match";
import MatchDetailModal from "@/components/MatchDetailModal";

export default function DashboardPage() {
  const { players, matches, loading } = useAppData();

  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  // ── Sadece oynanan maçlar (istatistikler için) ──
  const playedMatches = useMemo(() => matches.filter((m) => m.status === "played"), [matches]);

  // ── Bugünden itibaren 7 gün içindeki maçlar ──
  const upcomingMatches = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekLater = new Date(today);
    weekLater.setDate(weekLater.getDate() + 7);

    return matches
      .filter((m) => {
        const d = new Date(m.date);
        return d >= today && d <= weekLater;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [matches]);

  // ── Gol Krallığı (Top 10) ──
  const goalLeaders = useMemo(() => {
    const map = new Map<string, { name: string; goals: number; matches: number }>();
    for (const match of playedMatches) {
      for (const ps of match.playerStats) {
        const prev = map.get(ps.playerId) || { name: ps.playerName, goals: 0, matches: 0 };
        prev.goals += ps.goals;
        prev.matches += 1;
        prev.name = ps.playerName;
        map.set(ps.playerId, prev);
      }
    }
    return [...map.entries()]
      .map(([id, d]) => ({ id, ...d }))
      .filter((p) => p.goals > 0)
      .sort((a, b) => b.goals - a.goals || a.matches - b.matches)
      .slice(0, 10);
  }, [playedMatches]);

  // ── Asist Krallığı (Top 10) ──
  const assistLeaders = useMemo(() => {
    const map = new Map<string, { name: string; assists: number; matches: number }>();
    for (const match of playedMatches) {
      for (const ps of match.playerStats) {
        const prev = map.get(ps.playerId) || { name: ps.playerName, assists: 0, matches: 0 };
        prev.assists += ps.assists;
        prev.matches += 1;
        prev.name = ps.playerName;
        map.set(ps.playerId, prev);
      }
    }
    return [...map.entries()]
      .map(([id, d]) => ({ id, ...d }))
      .filter((p) => p.assists > 0)
      .sort((a, b) => b.assists - a.assists || a.matches - b.matches)
      .slice(0, 10);
  }, [playedMatches]);

  // ── Haftalık istatistikler ──
  const weeklyStats = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weekMatches = playedMatches.filter((m) => {
      const d = new Date(m.date);
      return d >= weekAgo && d <= today;
    });

    return {
      goalsScored: weekMatches.reduce((s, m) => s + m.scoreHome, 0),
      goalsConceded: weekMatches.reduce((s, m) => s + m.scoreAway, 0),
      wins: weekMatches.filter((m) => m.result === "W").length,
      draws: weekMatches.filter((m) => m.result === "D").length,
      losses: weekMatches.filter((m) => m.result === "L").length,
    };
  }, [playedMatches]);

  // ── Haftanın Oyuncusu (son 7 gündeki maçlarda ortalama yıldız puanı) ──
  const playerOfTheWeek = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weekMatches = playedMatches.filter((m) => {
      const d = new Date(m.date);
      return d >= weekAgo && d <= today;
    });

    if (weekMatches.length === 0) return null;

    const map = new Map<string, { name: string; goals: number; assists: number; totalRating: number; ratingCount: number; matchCount: number }>();
    for (const match of weekMatches) {
      for (const ps of match.playerStats) {
        const prev = map.get(ps.playerId) || { name: ps.playerName, goals: 0, assists: 0, totalRating: 0, ratingCount: 0, matchCount: 0 };
        prev.goals += ps.goals;
        prev.assists += ps.assists;
        prev.matchCount += 1;
        if (ps.rating) {
          prev.totalRating += ps.rating;
          prev.ratingCount += 1;
        }
        prev.name = ps.playerName;
        map.set(ps.playerId, prev);
      }
    }

    const sorted = [...map.entries()]
      .map(([id, d]) => ({
        id,
        ...d,
        avgRating: d.ratingCount > 0 ? d.totalRating / d.ratingCount : 0,
      }))
      .filter((p) => p.ratingCount > 0)
      .sort((a, b) => b.avgRating - a.avgRating || b.goals - a.goals || b.assists - a.assists);

    return sorted[0] ?? null;
  }, [playedMatches]);

  // ── Haftanın Takımı (son 7 günde galibiyet + averaj bazında) ──
  const teamOfTheWeek = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weekMatches = playedMatches.filter((m) => {
      const d = new Date(m.date);
      return d >= weekAgo && d <= today;
    });

    if (weekMatches.length === 0) return null;

    const map = new Map<string, { ageGroup: string; wins: number; goalsFor: number; goalsAgainst: number; matches: number }>();
    for (const m of weekMatches) {
      const prev = map.get(m.ageGroup) || { ageGroup: m.ageGroup, wins: 0, goalsFor: 0, goalsAgainst: 0, matches: 0 };
      prev.matches += 1;
      prev.goalsFor += m.scoreHome;
      prev.goalsAgainst += m.scoreAway;
      if (m.result === "W") prev.wins += 1;
      map.set(m.ageGroup, prev);
    }

    const sorted = [...map.values()]
      .map((t) => ({ ...t, goalDiff: t.goalsFor - t.goalsAgainst }))
      .sort((a, b) => b.wins - a.wins || b.goalDiff - a.goalDiff);

    return sorted[0] ?? null;
  }, [playedMatches]);

  // ── Son oynanan maçlar (en son 5 maç, yaş grubuna göre) ──
  const recentResults = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return playedMatches
      .filter((m) => new Date(m.date) <= today)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [playedMatches]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("tr-TR", { weekday: "short", day: "numeric", month: "short" });
  };

  const todayStr = new Date().toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const resultMap: Record<string, string> = { W: "G", D: "B", L: "M" };
  const resultColor: Record<string, string> = {
    W: "bg-emerald-100 text-emerald-700 border-emerald-200",
    D: "bg-amber-100 text-amber-700 border-amber-200",
    L: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* ── Welcome Hero ── */}
      <div className="rounded-2xl bg-gradient-to-br from-[#fff5f5] via-white to-[#fef2f2] border border-[#f5d0d0] overflow-hidden">
        {/* Top bar */}
        <div className="px-6 py-4 md:px-8 md:py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-[#f5d0d0]/60">
          <div className="flex items-center gap-3">
            <Image
              src="/Logo_S.png"
              alt="Beylerbeyi 1911 Akademi"
              width={40}
              height={40}
              className="rounded-xl shadow-sm shrink-0"
            />
            <div>
              <h1 className="text-lg font-bold text-[#1a1a2e] tracking-tight">Haftanın Panoraması</h1>
              <p className="text-[11px] text-[#8c919a]">{todayStr}</p>
            </div>
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-5 gap-2 sm:flex sm:items-center sm:gap-4">
            <MiniStat label="At\u0131lan Gol" value={loading ? "\u2014" : String(weeklyStats.goalsScored)} color="text-emerald-600" />
            <div className="hidden sm:block w-px h-6 bg-[#e2e5e9]" />
            <MiniStat label="Yenilen Gol" value={loading ? "\u2014" : String(weeklyStats.goalsConceded)} color="text-red-500" />
            <div className="hidden sm:block w-px h-6 bg-[#e2e5e9]" />
            <MiniStat label="Galibiyet" value={loading ? "\u2014" : String(weeklyStats.wins)} color="text-emerald-600" />
            <div className="hidden sm:block w-px h-6 bg-[#e2e5e9]" />
            <MiniStat label="Beraberlik" value={loading ? "\u2014" : String(weeklyStats.draws)} color="text-amber-600" />
            <div className="hidden sm:block w-px h-6 bg-[#e2e5e9]" />
            <MiniStat label="Mağlubiyet" value={loading ? "—" : String(weeklyStats.losses)} color="text-red-600" />
          </div>
        </div>

        {/* Content: Player of the week + Team of the week + Recent results */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#f5d0d0]/60">
          {/* Haftanın Oyuncusu */}
          <div className="p-6 md:p-8">
            <p className="text-[10px] font-bold text-[#c4111d] uppercase tracking-[0.15em] mb-3">⭐ Haftanın Oyuncusu</p>
            {loading ? (
              <p className="text-sm text-[#8c919a]">Yükleniyor...</p>
            ) : playerOfTheWeek ? (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c4111d] to-[#e8766e] flex items-center justify-center shadow-md shadow-[#c4111d]/15">
                    <span className="text-white font-bold text-lg">
                      {playerOfTheWeek.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-base font-bold text-[#1a1a2e]">{playerOfTheWeek.name}</p>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={14}
                          className={s <= Math.round(playerOfTheWeek.avgRating)
                            ? "fill-amber-400 text-amber-400"
                            : "fill-none text-gray-300"
                          }
                        />
                      ))}
                      <span className="ml-1 text-xs font-semibold text-amber-600">
                        {playerOfTheWeek.avgRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1.5">
                    <Target size={12} className="text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-700">{playerOfTheWeek.goals}</span>
                    <span className="text-[10px] text-emerald-600">gol</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1.5">
                    <TrendingUp size={12} className="text-blue-600" />
                    <span className="text-sm font-bold text-blue-700">{playerOfTheWeek.assists}</span>
                    <span className="text-[10px] text-blue-600">asist</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#8c919a]">Bu hafta henüz maç oynanmadı.</p>
            )}
          </div>

          {/* Haftanın Takımı */}
          <div className="p-6 md:p-8">
            <p className="text-[10px] font-bold text-[#c4111d] uppercase tracking-[0.15em] mb-3">🛡️ Haftanın Takımı</p>
            {loading ? (
              <p className="text-sm text-[#8c919a]">Yükleniyor...</p>
            ) : teamOfTheWeek ? (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1a1a2e] to-[#5a6170] flex items-center justify-center shadow-md shadow-[#1a1a2e]/15">
                    <span className="text-white font-bold text-sm">{teamOfTheWeek.ageGroup}</span>
                  </div>
                  <div>
                    <p className="text-base font-bold text-[#1a1a2e]">{teamOfTheWeek.ageGroup}</p>
                    <p className="text-xs text-[#8c919a]">{teamOfTheWeek.matches} maç oynandı</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1.5">
                    <Trophy size={12} className="text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-700">{teamOfTheWeek.wins}</span>
                    <span className="text-[10px] text-emerald-600">galibiyet</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1.5">
                    <Target size={12} className="text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-700">{teamOfTheWeek.goalsFor}</span>
                    <span className="text-[10px] text-emerald-600">attığı gol</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-red-50 border border-red-100 rounded-lg px-2.5 py-1.5">
                    <Target size={12} className="text-red-500" />
                    <span className="text-sm font-bold text-red-700">{teamOfTheWeek.goalsAgainst}</span>
                    <span className="text-[10px] text-red-500">yediği gol</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#8c919a]">Bu hafta henüz maç oynanmadı.</p>
            )}
          </div>

          {/* Son Maç Sonuçları */}
          <div className="p-6 md:p-8">
            <p className="text-[10px] font-bold text-[#c4111d] uppercase tracking-[0.15em] mb-3">🏆 Son Sonuçlar</p>
            {loading ? (
              <p className="text-sm text-[#8c919a]">Yükleniyor...</p>
            ) : recentResults.length === 0 ? (
              <p className="text-sm text-[#8c919a]">Henüz maç sonucu yok.</p>
            ) : (
              <div className="space-y-2">
                {recentResults.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMatch(m)}
                    className="w-full flex items-center gap-2.5 group hover:bg-[#fef2f2] rounded-lg px-1.5 py-1 -mx-1.5 transition-colors cursor-pointer"
                  >
                    <span className={`text-[10px] font-bold w-5 h-5 rounded flex items-center justify-center border ${resultColor[m.result]}`}>
                      {resultMap[m.result]}
                    </span>
                    <span className="text-[10px] font-semibold text-white bg-[#c4111d]/80 px-1.5 py-0.5 rounded">
                      {m.ageGroup}
                    </span>
                    <span className="text-xs font-semibold text-[#1a1a2e]">
                      {m.scoreHome}-{m.scoreAway}
                    </span>
                    <span className="text-xs text-[#5a6170] truncate flex-1 text-left">vs {m.opponent}</span>
                    <span className="text-[10px] text-[#8c919a] shrink-0">{formatDate(m.date)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Haftalık Maç Takvimi ── */}
      <div className="rounded-2xl bg-gradient-to-br from-[#fff5f5] via-white to-[#fef2f2] border border-[#f5d0d0] overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 md:px-8 md:py-5 border-b border-[#f5d0d0]/60">
          <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
            <Calendar size={18} className="text-[#c4111d]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1a1a2e]">Haftalık Maç Takvimi</h2>
            <p className="text-xs text-[#8c919a]">Önümüzdeki 7 gün</p>
          </div>
        </div>

        <div className="p-6 md:p-8">
          {loading ? (
            <div className="text-center text-sm text-[#8c919a] py-6">Yükleniyor...</div>
          ) : upcomingMatches.length === 0 ? (
            <div className="text-center py-6">
              <Calendar size={32} className="mx-auto mb-2 text-[#f5d0d0]" />
              <p className="text-sm text-[#8c919a]">Önümüzdeki 7 gün içinde planlanmış maç yok.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {upcomingMatches.map((m) => (
                <MatchCard key={m.id} match={m} formatDate={formatDate} onClick={() => setSelectedMatch(m)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Gol & Asist Krallığı ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gol Krallığı */}
        <div className="bg-white border border-[#e2e5e9] rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-[#e2e5e9]">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Trophy size={18} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#1a1a2e]">Gol Krallığı</h2>
              <p className="text-xs text-[#8c919a]">Tüm maçlar · Top 10</p>
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-10 text-center text-sm text-[#8c919a]">Yükleniyor...</div>
          ) : goalLeaders.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-[#8c919a]">Henüz gol verisi yok.</div>
          ) : (
            <div className="divide-y divide-[#e2e5e9]">
              {goalLeaders.map((p, i) => (
                <LeaderRow key={p.id} rank={i + 1} name={p.name} stat={p.goals} matchCount={p.matches} statLabel="gol" />
              ))}
            </div>
          )}
        </div>

        {/* Asist Krallığı */}
        <div className="bg-white border border-[#e2e5e9] rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-[#e2e5e9]">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
              <Award size={18} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#1a1a2e]">Asist Krallığı</h2>
              <p className="text-xs text-[#8c919a]">Tüm maçlar · Top 10</p>
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-10 text-center text-sm text-[#8c919a]">Yükleniyor...</div>
          ) : assistLeaders.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-[#8c919a]">Henüz asist verisi yok.</div>
          ) : (
            <div className="divide-y divide-[#e2e5e9]">
              {assistLeaders.map((p, i) => (
                <LeaderRow key={p.id} rank={i + 1} name={p.name} stat={p.assists} matchCount={p.matches} statLabel="asist" />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modules Grid */}
      <div>
        <h2 className="text-lg font-semibold text-[#1a1a2e] mb-4">Modüller</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/dashboard/players"
            className="group bg-white border border-[#e2e5e9] rounded-xl p-6 hover:border-[#c4111d]/30 hover:shadow-lg hover:shadow-[#c4111d]/5 transition-all duration-200"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0 group-hover:bg-[#c4111d]/15 transition-colors">
                <Users size={24} className="text-[#c4111d]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-[#1a1a2e] group-hover:text-[#c4111d] transition-colors">
                  Oyuncular
                </h3>
                <p className="text-sm text-[#5a6170] mt-1">
                  Tüm oyuncuları görüntüle, ekle ve düzenle
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/teams"
            className="group bg-white border border-[#e2e5e9] rounded-xl p-6 hover:border-[#c4111d]/30 hover:shadow-lg hover:shadow-[#c4111d]/5 transition-all duration-200"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                <Shield size={24} className="text-blue-600" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-[#1a1a2e] group-hover:text-[#c4111d] transition-colors">
                  Takımlar & Maçlar
                </h3>
                <p className="text-sm text-[#5a6170] mt-1">
                  Maç sonuçları ve takım istatistikleri
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Match Detail Modal */}
      {selectedMatch && (
        <MatchDetailModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
          onEdit={() => setSelectedMatch(null)}
        />
      )}
    </div>
  );
}

/* ── Alt Bileşenler ── */

function MiniStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="text-center">
      <p className={`text-base sm:text-lg font-bold ${color || "text-[#1a1a2e]"}`}>{value}</p>
      <p className="text-[9px] sm:text-[10px] text-[#8c919a] font-medium whitespace-nowrap">{label}</p>
    </div>
  );
}

function MatchCard({ match, formatDate, onClick }: { match: Match; formatDate: (d: string) => string; onClick: () => void }) {
  const isHome = match.homeAway === "home";
  const dayName = new Date(match.date).toLocaleDateString("tr-TR", { weekday: "short" }).toUpperCase();
  const dayNum = new Date(match.date).getDate();

  return (
    <button onClick={onClick} className="bg-white border border-[#e2e5e9] rounded-xl overflow-hidden hover:shadow-lg hover:border-[#c4111d]/25 transition-all duration-200 text-left group">
      {/* Date strip */}
      <div className="flex items-stretch">
        <div className="w-14 bg-[#c4111d] flex flex-col items-center justify-center py-3 shrink-0">
          <span className="text-[10px] font-bold text-white/70 uppercase">{dayName}</span>
          <span className="text-xl font-black text-white leading-none">{dayNum}</span>
        </div>

        <div className="flex-1 p-3">
          {/* Badges */}
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[10px] font-bold text-white bg-[#1a1a2e] px-1.5 py-0.5 rounded">{match.ageGroup}</span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${isHome ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"}`}>
              {isHome ? "İÇ SAHA" : "DEPLASMAN"}
            </span>
          </div>

          {/* Teams vertical */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Image src="/Logo_S.png" alt="Beylerbeyi" width={20} height={20} className="rounded shrink-0" />
              <span className="text-sm font-bold text-[#c4111d] group-hover:text-[#9b0d16] transition-colors">Beylerbeyi</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-[#f1f3f5] flex items-center justify-center shrink-0">
                <span className="text-[9px] font-bold text-[#8c919a]">{match.opponent.charAt(0)}</span>
              </div>
              <span className="text-sm font-semibold text-[#1a1a2e] truncate">{match.opponent}</span>
            </div>
          </div>

          {/* Venue */}
          {match.venue && (
            <p className="text-[10px] text-[#8c919a] flex items-center gap-1 mt-2">
              <MapPin size={9} /> {match.venue}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

function LeaderRow({
  rank,
  name,
  stat,
  matchCount,
  statLabel,
}: {
  rank: number;
  name: string;
  stat: number;
  matchCount: number;
  statLabel: string;
}) {
  const rankColors =
    rank === 1
      ? "bg-amber-400 text-white"
      : rank === 2
        ? "bg-gray-300 text-gray-700"
        : rank === 3
          ? "bg-amber-600 text-white"
          : "bg-[#f1f3f5] text-[#5a6170]";

  return (
    <div className="flex items-center gap-4 px-6 py-3 hover:bg-[#f8f9fb] transition-colors">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${rankColors}`}>
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#1a1a2e] truncate">{name}</p>
        <p className="text-xs text-[#8c919a]">{matchCount} maç</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-lg font-bold text-[#1a1a2e]">{stat}</p>
        <p className="text-[10px] text-[#8c919a] uppercase tracking-wider">{statLabel}</p>
      </div>
    </div>
  );
}
