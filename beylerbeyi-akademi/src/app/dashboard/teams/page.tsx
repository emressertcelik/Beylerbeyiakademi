"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { AgeGroup } from "@/types/player";
import { Match, TeamStats } from "@/types/match";
import { useAppData } from "@/lib/app-data";
import MatchFormModal from "@/components/MatchFormModal";
import MatchDetailModal from "@/components/MatchDetailModal";
import { useToast } from "@/components/Toast";
import {
  Plus,
  Calendar,
  Trophy,
  Target,
  Shield,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

const resultColors: Record<string, { bg: string; text: string; border: string }> = {
  W: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  D: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  L: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
};

const resultLabels: Record<string, string> = { W: "G", D: "B", L: "M" };

function computeTeamStats(matches: Match[], ageGroup: AgeGroup | "ALL", season: string): TeamStats | null {
  const filtered = matches.filter((m) => {
    const ageOk = ageGroup === "ALL" || m.ageGroup === ageGroup;
    const seasonOk = season === "ALL" || m.season === season;
    const played = m.status === "played";
    return ageOk && seasonOk && played;
  });

  if (filtered.length === 0) return null;

  const wins = filtered.filter((m) => m.result === "W").length;
  const draws = filtered.filter((m) => m.result === "D").length;
  const losses = filtered.filter((m) => m.result === "L").length;
  const goalsFor = filtered.reduce((s, m) => s + m.scoreHome, 0);
  const goalsAgainst = filtered.reduce((s, m) => s + m.scoreAway, 0);

  return {
    ageGroup: ageGroup === "ALL" ? "U15" : ageGroup,
    season: season === "ALL" ? "Tümü" : season,
    totalMatches: filtered.length,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    goalDifference: goalsFor - goalsAgainst,
    points: wins * 3 + draws,
    winRate: Math.round((wins / filtered.length) * 100),
  };
}

export default function TeamsPage() {
  const { players, matches, lookups, saveMatch, removeMatch } = useAppData();

  const AGE_FILTERS = useMemo(() => [
    { label: "Tümü", value: "ALL" as AgeGroup | "ALL" },
    ...lookups.ageGroups.filter((a) => a.isActive).map((a) => ({ label: a.value, value: a.value as AgeGroup | "ALL" })),
  ], [lookups.ageGroups]);

  const SEASON_FILTERS = useMemo(() => [
    { label: "Tüm Sezonlar", value: "ALL" },
    ...lookups.seasons.filter((s) => s.isActive).map((s) => ({ label: s.value, value: s.value })),
  ], [lookups.seasons]);
  const [selectedAge, setSelectedAge] = useState<AgeGroup | "ALL">("ALL");
  const [selectedSeason, setSelectedSeason] = useState<string>("ALL");
  const [seasonOpen, setSeasonOpen] = useState(false);
  const seasonRef = useRef<HTMLDivElement>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [editingMatch, setEditingMatch] = useState<Match | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (seasonRef.current && !seasonRef.current.contains(e.target as Node)) {
        setSeasonOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedSeasonLabel = SEASON_FILTERS.find((f) => f.value === selectedSeason)?.label || "Tüm Sezonlar";

  const filteredMatches = useMemo(
    () => matches.filter((m) => {
      const ageOk = selectedAge === "ALL" || m.ageGroup === selectedAge;
      const seasonOk = selectedSeason === "ALL" || m.season === selectedSeason;
      return ageOk && seasonOk;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [matches, selectedAge, selectedSeason]
  );

  const teamStats = useMemo(
    () => computeTeamStats(matches, selectedAge, selectedSeason),
    [matches, selectedAge, selectedSeason]
  );

  const handleSaveMatch = async (saved: Match) => {
    try {
      setSaving(true);
      const isEdit = matches.some((m) => m.id === saved.id);
      await saveMatch(saved, isEdit);
      setEditingMatch(undefined);
      setSelectedMatch(null);
      showToast("success", isEdit ? "Maç başarıyla güncellendi" : "Maç başarıyla kaydedildi");
    } catch (err) {
      console.error("Maç kaydedilemedi:", err);
      showToast("error", "Maç kaydedilemedi. Lütfen tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditFromDetail = (match: Match) => {
    setSelectedMatch(null);
    setEditingMatch(match);
  };

  const handleDeleteMatch = async (matchId: string) => {
    try {
      await removeMatch(matchId);
      setSelectedMatch(null);
      showToast("success", "Maç başarıyla silindi");
    } catch (err) {
      console.error("Maç silinemedi:", err);
      showToast("error", "Maç silinemedi. Lütfen tekrar deneyin.");
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* ...puan durumu linki kaldırıldı... */}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e] tracking-tight">Takımlar</h1>
          <p className="text-sm text-[#5a6170] mt-1">
            {filteredMatches.length} maç {selectedAge !== "ALL" ? `· ${selectedAge}` : ""}
          </p>
        </div>
        <button
          onClick={() => setEditingMatch(null)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#c4111d] hover:bg-[#9b0d16] text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm shadow-[#c4111d]/25 focus-ring"
        >
          <Plus size={18} />
          Yeni Maç Ekle
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white border border-[#e2e5e9] rounded-xl p-3">
        {/* Age group tabs */}
        <div className="flex gap-1 bg-[#f1f3f5] rounded-lg p-1">
          {AGE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setSelectedAge(f.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${
                selectedAge === f.value
                  ? "bg-white text-[#c4111d] shadow-sm"
                  : "text-[#5a6170] hover:text-[#1a1a2e]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Season filter */}
        <div className="relative" ref={seasonRef}>
          <button
            onClick={() => setSeasonOpen(!seasonOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 h-[34px] bg-[#f1f3f5] rounded-lg text-xs font-semibold transition-all duration-200 border ${
              seasonOpen
                ? "border-[#c4111d]/30 ring-2 ring-[#c4111d]/20 text-[#c4111d]"
                : "border-transparent hover:border-[#e2e5e9] text-[#1a1a2e]"
            }`}
          >
            <Calendar size={14} className="text-[#8c919a] shrink-0" />
            <span className="whitespace-nowrap">{selectedSeasonLabel}</span>
            <svg className={`w-3 h-3 text-[#8c919a] transition-transform duration-200 ${seasonOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 10 6"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          {seasonOpen && (
            <div className="absolute top-full left-0 mt-1.5 bg-white border border-[#e2e5e9] rounded-xl shadow-lg shadow-black/8 py-1 min-w-[160px] z-50 animate-fade-in">
              {SEASON_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => {
                    setSelectedSeason(f.value);
                    setSeasonOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors duration-150 ${
                    selectedSeason === f.value
                      ? "text-[#c4111d] bg-[#c4111d]/5"
                      : "text-[#1a1a2e] hover:bg-[#f1f3f5]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {selectedSeason === f.value && (
                      <svg className="w-3.5 h-3.5 text-[#c4111d] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    )}
                    <span className={selectedSeason !== f.value ? "ml-[22px]" : ""}>{f.label}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Team Stats Cards */}
      {teamStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <StatCard icon={<Shield size={16} />} label="Toplam Maç" value={teamStats.totalMatches} />
          <StatCard icon={<Trophy size={16} />} label="Galibiyet" value={teamStats.wins} color="text-emerald-600" />
          <StatCard icon={<Shield size={16} />} label="Beraberlik" value={teamStats.draws} color="text-amber-600" />
          <StatCard icon={<Target size={16} />} label="Mağlubiyet" value={teamStats.losses} color="text-red-600" />
          <StatCard icon={<TrendingUp size={16} />} label="Gol A / Y" value={`${teamStats.goalsFor} / ${teamStats.goalsAgainst}`} />
          <StatCard icon={<Trophy size={16} />} label="Kazanma %" value={`%${teamStats.winRate}`} color="text-[#c4111d]" />
        </div>
      )}

      {/* Match List */}
      {filteredMatches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-[#f1f3f5] flex items-center justify-center mb-4">
            <Shield size={28} className="text-[#8c919a]" />
          </div>
          <p className="text-sm font-medium text-[#5a6170]">Maç bulunamadı</p>
          <p className="text-xs text-[#8c919a] mt-1">Bu filtre için henüz maç eklenmemiş</p>
        </div>
      ) : (
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-[#1a1a2e]">Maçlar</h2>
          {filteredMatches.map((match) => {
            const isPlayed = match.status === "played";
            const rc = isPlayed ? resultColors[match.result] : { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" };
            return (
              <button
                key={match.id}
                onClick={() => setSelectedMatch(match)}
                className="w-full bg-white border border-[#e2e5e9] rounded-xl p-4 text-left hover:border-[#c4111d]/30 hover:shadow-md hover:shadow-[#c4111d]/5 transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  {/* Result / Status Badge */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black ${rc.bg} ${rc.text} border ${rc.border} shrink-0`}>
                    {isPlayed ? resultLabels[match.result] : "📅"}
                  </div>

                  {/* Match Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {isPlayed ? (
                        <p className="text-sm font-semibold text-[#1a1a2e] group-hover:text-[#c4111d] transition-colors truncate">
                          Beylerbeyi <span className="font-black">{match.scoreHome} - {match.scoreAway}</span> {match.opponent}
                        </p>
                      ) : (
                        <p className="text-sm font-semibold text-[#1a1a2e] group-hover:text-[#c4111d] transition-colors truncate">
                          Beylerbeyi vs {match.opponent}
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700">Planlandı</span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#8c919a]">
                      <span>{new Date(match.date).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}</span>
                      <span>·</span>
                      <span>{match.ageGroup}</span>
                      <span>·</span>
                      <span>{match.homeAway === "home" ? "Ev" : "Deplasman"}</span>
                      {match.venue && (
                        <>
                          <span>·</span>
                          <span className="truncate">{match.venue}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Player count */}
                  {isPlayed && (
                    <div className="text-[11px] text-[#8c919a] font-medium shrink-0 hidden sm:block">
                      {match.playerStats.length} oyuncu
                    </div>
                  )}

                  <ChevronRight size={16} className="text-[#8c919a] shrink-0 group-hover:text-[#c4111d] transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedMatch && (
        <MatchDetailModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
          onEdit={handleEditFromDetail}
          onDelete={handleDeleteMatch}
        />
      )}

      {/* Form Modal */}
      {editingMatch !== undefined && (
        <MatchFormModal
          match={editingMatch}
          players={players}
          saving={saving}
          onClose={() => setEditingMatch(undefined)}
          onSave={handleSaveMatch}
        />
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="bg-white border border-[#e2e5e9] rounded-xl p-4">
      <div className="flex items-center gap-1.5 text-[#8c919a] mb-2">
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-xl font-black ${color || "text-[#1a1a2e]"}`}>{value}</p>
    </div>
  );
}
