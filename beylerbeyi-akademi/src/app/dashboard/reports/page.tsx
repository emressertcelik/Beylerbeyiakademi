
"use client";
import React from "react";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAppData } from "@/lib/app-data";
import {
  Trophy, Target, Clock, Shield, AlertTriangle,
  ChevronDown, Star, TrendingUp, Users, Filter,
  Award, Zap, BarChart3, Handshake, ShieldCheck,
} from "lucide-react";

type SortField =
  | "matches" | "goals" | "assists" | "minutesPlayed"
  | "yellowCards" | "redCards" | "goalsConceded" | "cleanSheets"
  | "rating" | "goalsPerMatch" | "tacticalAvg" | "athleticAvg";

interface PlayerReport {
  id: string;
  name: string;
  jerseyNumber: number;
  position: string;
  ageGroup: string;
  matches: number;
  starts: number;
  sub: number;
  minutesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  goalsConceded: number;
  cleanSheets: number;
  avgRating: number;
  ratingCount: number;
  goalsPerMatch: number;
  assistsPerMatch: number;
  tacticalAvg: number;
  athleticAvg: number;
}

export default function ReportsPage() {
  const { players, matches, lookups, loading } = useAppData();
  const AGE_GROUPS = lookups.ageGroups.filter((a) => a.isActive).map((a) => a.value);
  const SEASONS = lookups.seasons.filter((s) => s.isActive).map((s) => s.value);

  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>("all");
  const [selectedSeason, setSelectedSeason] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("goals");
  const [sortAsc, setSortAsc] = useState(false);
  const [positionFilter, setPositionFilter] = useState<string>("all");

  // Build player reports from match data
  const playerReports = useMemo(() => {
    const playedMatches = matches.filter((m) => {
      if (m.status !== "played") return false;
      if (selectedSeason !== "all" && m.season !== selectedSeason) return false;
      if (selectedAgeGroup !== "all" && m.ageGroup !== selectedAgeGroup) return false;
      return true;
    });

    const map = new Map<string, PlayerReport>();

    for (const match of playedMatches) {
      // Aynı maçta bir oyuncu birden fazla satırda olabilir, hepsini toplamalıyız
      const playerStatsById: Record<string, { starts: number; sub: number; matches: number; psList: any[] }> = {};
      for (const ps of match.playerStats) {
        const statusLower = (ps.participationStatus || "").toLowerCase();
        const isStart = statusLower.includes("ilk");
        const isSub = statusLower.includes("yedek") || statusLower.includes("sonradan");
        if (!playerStatsById[ps.playerId]) {
          playerStatsById[ps.playerId] = { starts: 0, sub: 0, matches: 0, psList: [] };
        }
        if (isStart) playerStatsById[ps.playerId].starts++;
        if (isSub) playerStatsById[ps.playerId].sub++;
        playerStatsById[ps.playerId].matches++;
        playerStatsById[ps.playerId].psList.push(ps);
      }
      for (const playerId in playerStatsById) {
        const { starts, sub, matches: matchCount, psList } = playerStatsById[playerId];
        const existing = map.get(playerId);
        // Tüm istatistikleri topla
        let minutesPlayed = 0, goals = 0, assists = 0, yellowCards = 0, redCards = 0, goalsConceded = 0, cleanSheets = 0, avgRating = 0, ratingCount = 0;
        for (const ps of psList) {
          minutesPlayed += ps.minutesPlayed;
          goals += ps.goals;
          assists += ps.assists;
          yellowCards += ps.yellowCards;
          redCards += ps.redCards;
          goalsConceded += ps.goalsConceded;
          if (ps.cleanSheet) cleanSheets++;
          if (ps.rating) {
            avgRating += ps.rating;
            ratingCount++;
          }
        }
        const player = players.find((p) => p.id === playerId);
        if (existing) {
          existing.matches++;
          existing.starts += starts;
          existing.sub += sub;
          existing.minutesPlayed += minutesPlayed;
          existing.goals += goals;
          existing.assists += assists;
          existing.yellowCards += yellowCards;
          existing.redCards += redCards;
          existing.goalsConceded += goalsConceded;
          existing.cleanSheets += cleanSheets;
          if (ratingCount > 0) {
            existing.avgRating = ((existing.avgRating * existing.ratingCount) + avgRating) / (existing.ratingCount + ratingCount);
            existing.ratingCount += ratingCount;
          }
        } else {
          map.set(playerId, {
            id: playerId,
            name: player?.firstName + " " + player?.lastName,
            jerseyNumber: player?.jerseyNumber || 0,
            position: player?.position || psList[0].position,
            ageGroup: player?.ageGroup || "",
            matches: 1,
            starts: starts,
            sub: sub,
            minutesPlayed,
            goals,
            assists,
            yellowCards,
            redCards,
            goalsConceded,
            cleanSheets,
            avgRating: ratingCount > 0 ? avgRating / ratingCount : 0,
            ratingCount,
            goalsPerMatch: 0,
            assistsPerMatch: 0,
            tacticalAvg: player
              ? +(
                  (player.tactical.positioning + player.tactical.passing + player.tactical.crossing +
                   player.tactical.shooting + player.tactical.dribbling + player.tactical.heading +
                   player.tactical.tackling + player.tactical.marking + player.tactical.gameReading) / 9
                ).toFixed(1)
              : 0,
            athleticAvg: player
              ? +(
                  (player.athletic.speed + player.athletic.strength + player.athletic.stamina +
                   player.athletic.agility + player.athletic.jumping + player.athletic.balance +
                   player.athletic.flexibility) / 7
                ).toFixed(1)
              : 0,
          });
        }
      }
    }

    // Maç başı istatistikleri hesapla
    for (const report of map.values()) {
      report.goalsPerMatch = report.matches > 0 ? +(report.goals / report.matches).toFixed(2) : 0;
      report.assistsPerMatch = report.matches > 0 ? +(report.assists / report.matches).toFixed(2) : 0;
    }

    return [...map.values()];
  }, [matches, players, selectedAgeGroup, selectedSeason]);

  // Filter by position
  const filteredReports = useMemo(() => {
    if (positionFilter === "all") return playerReports;
    return playerReports.filter((r) => r.position === positionFilter);
  }, [playerReports, positionFilter]);

  // Sort
  const sortedReports = useMemo(() => {
    const sorted = [...filteredReports];
    const fieldMap: Record<SortField, keyof PlayerReport> = {
      matches: "matches",
      goals: "goals",
      assists: "assists",
      minutesPlayed: "minutesPlayed",
      yellowCards: "yellowCards",
      redCards: "redCards",
      goalsConceded: "goalsConceded",
      cleanSheets: "cleanSheets",
      rating: "avgRating",
      goalsPerMatch: "goalsPerMatch",
      tacticalAvg: "tacticalAvg",
      athleticAvg: "athleticAvg",
    };
    const key = fieldMap[sortField];
    sorted.sort((a, b) => {
      const aVal = a[key] as number;
      const bVal = b[key] as number;
      return sortAsc ? aVal - bVal : bVal - aVal;
    });
    return sorted;
  }, [filteredReports, sortField, sortAsc]);

  // Top performers
  const topScorer = useMemo(() => [...playerReports].filter(r => r.goals > 0).sort((a, b) => b.goals - a.goals)[0], [playerReports]);
  const topAssist = useMemo(() => [...playerReports].filter(r => r.assists > 0).sort((a, b) => b.assists - a.assists)[0], [playerReports]);
  const topContributor = useMemo(() => [...playerReports].filter(r => (r.goals + r.assists) > 0).sort((a, b) => (b.goals + b.assists) - (a.goals + a.assists))[0], [playerReports]);
  const topMinutes = useMemo(() => [...playerReports].filter(r => r.minutesPlayed > 0).sort((a, b) => b.minutesPlayed - a.minutesPlayed)[0], [playerReports]);
  const topRated = useMemo(() => [...playerReports].filter(r => r.ratingCount >= 1).sort((a, b) => b.avgRating - a.avgRating)[0], [playerReports]);
  const topCleanSheet = useMemo(() => [...playerReports].filter(r => r.cleanSheets > 0).sort((a, b) => b.cleanSheets - a.cleanSheets)[0], [playerReports]);

  // Available positions from current data
  const positions = useMemo(() => {
    const set = new Set(playerReports.map((r) => r.position).filter(Boolean));
    return [...set].sort();
  }, [playerReports]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const SortHeader = ({ field, label, className }: { field: SortField; label: string; className?: string }) => (
    <button
      onClick={() => handleSort(field)}
      className={`flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider hover:text-[#1a1a2e] transition-colors ${
        sortField === field ? "text-[#c4111d]" : "text-[#8c919a]"
      } ${className || ""}`}
    >
      {label}
      {sortField === field && (
        <ChevronDown size={10} className={`transition-transform ${sortAsc ? "rotate-180" : ""}`} />
      )}
    </button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-[#e2e5e9] border-t-[#c4111d] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1a1a2e] flex items-center gap-2">
            <BarChart3 size={24} className="text-[#c4111d]" />
            Oyuncu Raporları
          </h1>
          <p className="text-sm text-[#5a6170] mt-1">
            Maç bazlı istatistik ve performans analizi
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#e2e5e9] p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={14} className="text-[#8c919a]" />
          <span className="text-xs font-semibold text-[#8c919a] uppercase tracking-wider">Filtreler</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[10px] font-medium text-[#8c919a] mb-1">Yaş Grubu</label>
            <select
              value={selectedAgeGroup}
              onChange={(e) => setSelectedAgeGroup(e.target.value)}
              className="w-full px-3 py-2 bg-[#f8f9fb] border border-[#e2e5e9] rounded-lg text-sm text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#c4111d]/20"
            >
              <option value="all">Tümü</option>
              {AGE_GROUPS.map((ag) => (
                <option key={ag} value={ag}>{ag}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-[#8c919a] mb-1">Sezon</label>
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="w-full px-3 py-2 bg-[#f8f9fb] border border-[#e2e5e9] rounded-lg text-sm text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#c4111d]/20"
            >
              <option value="all">Tümü</option>
              {SEASONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-[#8c919a] mb-1">Mevki</label>
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#f8f9fb] border border-[#e2e5e9] rounded-lg text-sm text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#c4111d]/20"
            >
              <option value="all">Tümü</option>
              {positions.map((pos) => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-[#8c919a] mb-1">Sıralama</label>
            <select
              value={sortField}
              onChange={(e) => { setSortField(e.target.value as SortField); setSortAsc(false); }}
              className="w-full px-3 py-2 bg-[#f8f9fb] border border-[#e2e5e9] rounded-lg text-sm text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#c4111d]/20"
            >
              <option value="goals">Gol</option>
              <option value="assists">Asist</option>
              <option value="matches">Maç</option>
              <option value="minutesPlayed">Dakika</option>
              <option value="goalsPerMatch">Maç Başı Gol</option>
              <option value="rating">Puan</option>
              <option value="yellowCards">Sarı Kart</option>
              <option value="redCards">Kırmızı Kart</option>
              <option value="cleanSheets">Gole Kapatan</option>
              <option value="tacticalAvg">Taktik Ort.</option>
              <option value="athleticAvg">Atletik Ort.</option>
            </select>
          </div>
        </div>
      </div>

      {/* Top Performers - Modern Glassmorphism Grid */}
      {(topScorer || topAssist || topMinutes || topRated || topContributor || topCleanSheet) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {topScorer && (
            <TopCard
              icon={Trophy}
              iconColor="text-amber-500"
              iconBg="bg-gradient-to-br from-amber-100/80 to-amber-200/60"
              title="Gol Kralı"
              name={topScorer.name}
              jersey={topScorer.jerseyNumber}
              value={`${topScorer.goals} gol`}
              sub={`${topScorer.matches} maçta`}
            />
          )}
          {topAssist && (
            <TopCard
              icon={Target}
              iconColor="text-blue-500"
              iconBg="bg-gradient-to-br from-blue-100/80 to-blue-200/60"
              title="Asist Kralı"
              name={topAssist.name}
              jersey={topAssist.jerseyNumber}
              value={`${topAssist.assists} asist`}
              sub={`${topAssist.matches} maçta`}
            />
          )}
          {topContributor && (
            <TopCard
              icon={Handshake}
              iconColor="text-teal-500"
              iconBg="bg-gradient-to-br from-teal-100/80 to-teal-200/60"
              title="Gol Katkısı"
              name={topContributor.name}
              jersey={topContributor.jerseyNumber}
              value={`${topContributor.goals + topContributor.assists} katkı`}
              sub={`${topContributor.goals}G + ${topContributor.assists}A`}
            />
          )}
          {topMinutes && (
            <TopCard
              icon={Clock}
              iconColor="text-emerald-500"
              iconBg="bg-gradient-to-br from-emerald-100/80 to-emerald-200/60"
              title="En Çok Süre"
              name={topMinutes.name}
              jersey={topMinutes.jerseyNumber}
              value={`${topMinutes.minutesPlayed} dk`}
              sub={`${topMinutes.matches} maç`}
            />
          )}
          {topRated && (
            <TopCard
              icon={Star}
              iconColor="text-purple-500"
              iconBg="bg-gradient-to-br from-purple-100/80 to-purple-200/60"
              title="En İyi Puan"
              name={topRated.name}
              jersey={topRated.jerseyNumber}
              value={`${topRated.avgRating.toFixed(1)} ★`}
              sub={`${topRated.ratingCount} değerlendirme`}
            />
          )}
          {topCleanSheet && (
            <TopCard
              icon={ShieldCheck}
              iconColor="text-cyan-500"
              iconBg="bg-gradient-to-br from-cyan-100/80 to-cyan-200/60"
              title="Gole Kapatan"
              name={topCleanSheet.name}
              jersey={topCleanSheet.jerseyNumber}
              value={`${topCleanSheet.cleanSheets} maç`}
              sub={`${topCleanSheet.matches} maçta gol yemedi`}
            />
          )}
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-[#e2e5e9] shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-[#e2e5e9] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#1a1a2e] flex items-center gap-2">
            <Users size={16} className="text-[#c4111d]" />
            Oyuncu İstatistikleri
            <span className="text-xs font-normal text-[#8c919a]">({sortedReports.length} oyuncu)</span>
          </h3>
        </div>

        {sortedReports.length === 0 ? (
          <tbody>
            <tr>
              <td colSpan={15} className="text-center py-12">
                <BarChart3 size={40} className="mx-auto text-[#e2e5e9] mb-3" />
                <p className="text-sm text-[#8c919a]">Seçilen filtrelere uygun veri bulunamadı.</p>
              </td>
            </tr>
          </tbody>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#f0f1f3] bg-[#fafbfc]">
                  <th className="px-3 py-2.5 text-[10px] font-semibold text-[#8c919a] uppercase tracking-wider w-8">#</th>
                  <th className="px-3 py-2.5 text-[10px] font-semibold text-[#8c919a] uppercase tracking-wider min-w-[140px]">Oyuncu</th>
                  <th className="px-2 py-2.5"><SortHeader field="matches" label="Maç" /></th>
                  <th className="px-2 py-2.5 text-[10px] font-semibold text-[#8c919a] uppercase tracking-wider">İ11/Y</th>
                  <th className="px-2 py-2.5"><SortHeader field="minutesPlayed" label="DK" /></th>
                  <th className="px-2 py-2.5"><SortHeader field="goals" label="Gol" /></th>
                  <th className="px-2 py-2.5"><SortHeader field="assists" label="Ast" /></th>
                  <th className="px-2 py-2.5"><SortHeader field="goalsPerMatch" label="G/M" /></th>
                  <th className="px-2 py-2.5"><SortHeader field="yellowCards" label="SK" /></th>
                  <th className="px-2 py-2.5"><SortHeader field="redCards" label="KK" /></th>
                  <th className="px-2 py-2.5"><SortHeader field="goalsConceded" label="YG" /></th>
                  <th className="px-2 py-2.5"><SortHeader field="cleanSheets" label="GK" /></th>
                  <th className="px-2 py-2.5"><SortHeader field="rating" label="Puan" /></th>
                  <th className="px-2 py-2.5"><SortHeader field="tacticalAvg" label="TAK" /></th>
                  <th className="px-2 py-2.5"><SortHeader field="athleticAvg" label="ATL" /></th>
                </tr>
              </thead>
              <tbody>
                {sortedReports.map((r, idx) => (
                  <tr
                    key={r.id}
                    className="border-b border-[#f0f1f3] last:border-b-0 hover:bg-[#fafbfc] transition-colors"
                  >
                    <td className="px-3 py-2.5 text-xs text-[#8c919a] font-medium">{idx + 1}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-md bg-[#c4111d]/10 flex items-center justify-center text-[10px] font-black text-[#c4111d] shrink-0">
                          {r.jerseyNumber}
                        </span>
                        <div className="min-w-0">
                          <Link href={`/dashboard/reports/${r.id}`} className="text-xs font-semibold text-[#1a1a2e] truncate hover:text-[#c4111d] transition-colors cursor-pointer block">
                            {r.name}
                          </Link>
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] text-[#8c919a]">{r.position}</span>
                            <span className="text-[8px] text-[#8c919a]">·</span>
                            <span className="text-[9px] text-[#8c919a]">{r.ageGroup}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-2.5 text-xs font-bold text-[#1a1a2e] text-center">{r.matches}</td>
                    <td className="px-2 py-2.5 text-[10px] text-[#5a6170] text-center">{r.starts}/{r.sub}</td>
                    <td className="px-2 py-2.5 text-xs text-[#5a6170] text-center">{r.minutesPlayed}</td>
                    <td className="px-2 py-2.5 text-center">
                      <span className={`text-xs font-bold ${r.goals > 0 ? "text-emerald-600" : "text-[#8c919a]"}`}>{r.goals}</span>
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      <span className={`text-xs font-bold ${r.assists > 0 ? "text-blue-600" : "text-[#8c919a]"}`}>{r.assists}</span>
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      <span className={`text-[10px] font-semibold ${r.goalsPerMatch > 0 ? "text-emerald-600" : "text-[#8c919a]"}`}>
                        {r.goalsPerMatch.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      <span className={`text-xs ${r.yellowCards > 0 ? "font-bold text-yellow-600" : "text-[#8c919a]"}`}>{r.yellowCards}</span>
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      <span className={`text-xs ${r.redCards > 0 ? "font-bold text-red-600" : "text-[#8c919a]"}`}>{r.redCards}</span>
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      <span className={`text-xs ${r.goalsConceded > 0 ? "font-bold text-orange-500" : "text-[#8c919a]"}`}>{r.goalsConceded}</span>
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      <span className={`text-xs ${r.cleanSheets > 0 ? "font-bold text-emerald-600" : "text-[#8c919a]"}`}>{r.cleanSheets}</span>
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      {r.ratingCount > 0 ? (
                        <span className="text-xs font-bold text-purple-600">{r.avgRating.toFixed(1)}</span>
                      ) : (
                        <span className="text-[10px] text-[#8c919a]">—</span>
                      )}
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      <SkillBadge value={r.tacticalAvg} />
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      <SkillBadge value={r.athleticAvg} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      {sortedReports.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Disiplin */}
          <div className="bg-white rounded-xl border border-[#e2e5e9] p-4 shadow-sm">
            <h4 className="text-xs font-semibold text-[#8c919a] uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <AlertTriangle size={13} className="text-yellow-500" />
              Disiplin Raporu
            </h4>
            <div className="space-y-2">
              {playerReports
                .filter((r) => r.yellowCards + r.redCards > 0)
                .sort((a, b) => (b.yellowCards + b.redCards * 3) - (a.yellowCards + a.redCards * 3))
                .slice(0, 5)
                .map((r) => (
                  <div key={r.id} className="flex items-center justify-between bg-[#f8f9fb] rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-[#c4111d]">#{r.jerseyNumber}</span>
                      <span className="text-xs font-medium text-[#1a1a2e]">{r.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {r.yellowCards > 0 && (
                        <span className="flex items-center gap-0.5">
                          <span className="w-2.5 h-3.5 rounded-[2px] bg-yellow-400 inline-block" />
                          <span className="text-[10px] font-bold text-yellow-600">{r.yellowCards}</span>
                        </span>
                      )}
                      {r.redCards > 0 && (
                        <span className="flex items-center gap-0.5">
                          <span className="w-2.5 h-3.5 rounded-[2px] bg-red-500 inline-block" />
                          <span className="text-[10px] font-bold text-red-600">{r.redCards}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              {playerReports.filter((r) => r.yellowCards + r.redCards > 0).length === 0 && (
                <p className="text-xs text-[#8c919a] text-center py-2">Kart alan oyuncu yok.</p>
              )}
            </div>
          </div>

          {/* Beceri Liderleri */}
          <div className="bg-white rounded-xl border border-[#e2e5e9] p-4 shadow-sm">
            <h4 className="text-xs font-semibold text-[#8c919a] uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <TrendingUp size={13} className="text-blue-500" />
              Taktik Liderleri
            </h4>
            <div className="space-y-2">
              {playerReports
                .filter((r) => r.tacticalAvg > 0)
                .sort((a, b) => b.tacticalAvg - a.tacticalAvg)
                .slice(0, 5)
                .map((r, i) => (
                  <div key={r.id} className="flex items-center justify-between bg-[#f8f9fb] rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black ${i === 0 ? "text-amber-500" : "text-[#8c919a]"}`}>{i + 1}.</span>
                      <span className="text-[10px] font-black text-[#c4111d]">#{r.jerseyNumber}</span>
                      <span className="text-xs font-medium text-[#1a1a2e]">{r.name}</span>
                    </div>
                    <SkillBadge value={r.tacticalAvg} />
                  </div>
                ))}
            </div>
          </div>

          {/* Atletik Liderleri */}
          <div className="bg-white rounded-xl border border-[#e2e5e9] p-4 shadow-sm">
            <h4 className="text-xs font-semibold text-[#8c919a] uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <Zap size={13} className="text-emerald-500" />
              Atletik Liderleri
            </h4>
            <div className="space-y-2">
              {playerReports
                .filter((r) => r.athleticAvg > 0)
                .sort((a, b) => b.athleticAvg - a.athleticAvg)
                .slice(0, 5)
                .map((r, i) => (
                  <div key={r.id} className="flex items-center justify-between bg-[#f8f9fb] rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black ${i === 0 ? "text-amber-500" : "text-[#8c919a]"}`}>{i + 1}.</span>
                      <span className="text-[10px] font-black text-[#c4111d]">#{r.jerseyNumber}</span>
                      <span className="text-xs font-medium text-[#1a1a2e]">{r.name}</span>
                    </div>
                    <SkillBadge value={r.athleticAvg} />
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Helper Components ── */

function TopCard({ icon: Icon, iconColor, iconBg, title, name, jersey, value, sub }: {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  name: string;
  jersey: number;
  value: string;
  sub: string;
}) {
  return (
    <div className="bg-white/80 border border-[#e5e7eb] rounded-xl shadow p-3 flex flex-col items-center text-center transition hover:shadow-md duration-150 min-w-0">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${iconBg}`}>
        <Icon size={18} className={iconColor} />
      </div>
      <div className="text-[10px] font-semibold text-[#c4111d] uppercase tracking-wider mb-0.5">{title}</div>
      <div className="flex items-center justify-center gap-1 mb-1 max-w-full">
        <span className="text-[10px] font-bold text-[#c4111d] bg-[#fff0f3] rounded px-1 py-0.5">#{jersey}</span>
        <span className="text-xs font-semibold text-[#1a1a2e] truncate max-w-[140px] sm:max-w-[180px] md:max-w-[220px] lg:max-w-[260px] xl:max-w-[320px]">{name}</span>
      </div>
      <div className="flex flex-col items-center gap-0.5 mt-0.5">
        <span className="text-lg font-extrabold text-[#1a1a2e]">{value}</span>
        <span className="text-[10px] text-[#64748b] font-medium">{sub}</span>
      </div>
    </div>
  );
}

function SkillBadge({ value }: { value: number }) {
  if (value === 0) return <span className="text-[10px] text-[#8c919a]">—</span>;
  const color = value >= 8 ? "bg-emerald-50 text-emerald-700" : value >= 6 ? "bg-amber-50 text-amber-700" : value >= 4 ? "bg-orange-50 text-orange-700" : "bg-red-50 text-red-600";
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${color}`}>{value}</span>
  );
}