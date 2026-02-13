"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { AgeGroup } from "@/types/player";
import { Match, TeamStats } from "@/types/match";
import { useAppData } from "@/lib/app-data";
import MatchFormModal from "@/components/MatchFormModal";
import { Search } from "lucide-react";
import MatchDetailModal from "@/components/MatchDetailModal";
import { useToast } from "@/components/Toast";
import EnablePushButton from "@/components/EnablePushButton";
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'played' | 'scheduled'>('all');
  const { players, matches, lookups, saveMatch, removeMatch, userRole } = useAppData();

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

  // Filter by userRole (antrenor: only own age group)
  const filteredMatches = useMemo(() => {
    let filtered = matches;
    if (userRole?.role === "antrenor" && userRole.age_group) {
      filtered = filtered.filter((m) => m.ageGroup === userRole.age_group);
    }
    filtered = filtered.filter((m) => {
      const ageOk = selectedAge === "ALL" || m.ageGroup === selectedAge;
      const seasonOk = selectedSeason === "ALL" || m.season === selectedSeason;
      const searchOk = search === "" || m.opponent.toLowerCase().includes(search.toLowerCase());
      const statusOk = statusFilter === 'all' || m.status === statusFilter;
      return ageOk && seasonOk && searchOk && statusOk;
    });
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [matches, userRole, selectedAge, selectedSeason, search, statusFilter]);

  const teamStats = useMemo(
    () => computeTeamStats(matches, selectedAge, selectedSeason),
    [matches, selectedAge, selectedSeason]
  );

  const handleSaveMatch = async (saved: Match) => {
    try {
      setSaving(true);
      const isEdit = matches.some((m) => m.id === saved.id);
      // Antrenör ise sadece kendi yaş grubuna kayıt yapılabilir
      if (userRole?.role === "antrenor" && userRole.age_group && saved.ageGroup !== userRole.age_group) {
        showToast("error", "Sadece kendi yaş grubunuz için maç ekleyebilirsiniz.");
        setSaving(false);
        return;
      }
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

  // Only allow add/edit for own age group (antrenor)
  const canEdit = userRole?.role === "yonetici" || (userRole?.role === "antrenor" && !!userRole.age_group);

  return (
    <div className="space-y-6">
      {/* Web Push Enable Button */}
      <EnablePushButton />
      {/* ...puan durumu linki kaldırıldı... */}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-xl font-bold text-[#1a1a2e]">Takımlar</h1>
        {canEdit && (
          <button
            onClick={() => setEditingMatch(null)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#c4111d] hover:bg-[#9b0d16] text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm shadow-[#c4111d]/25 focus-ring"
          >
            <Plus size={18} />
            Yeni Maç Ekle
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white border border-[#e2e5e9] rounded-xl p-3 overflow-visible relative">
        {/* Maç Durumu Filtresi */}
        <div className="flex gap-1">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${statusFilter === 'all' ? 'bg-[#c4111d] text-white shadow-sm' : 'text-[#5a6170] hover:text-[#1a1a2e] bg-[#f1f3f5]'}`}
          >Tüm Maçlar</button>
          <button
            onClick={() => setStatusFilter('played')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${statusFilter === 'played' ? 'bg-[#c4111d] text-white shadow-sm' : 'text-[#5a6170] hover:text-[#1a1a2e] bg-[#f1f3f5]'}`}
          >Oynanmış</button>
          <button
            onClick={() => setStatusFilter('scheduled')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${statusFilter === 'scheduled' ? 'bg-[#c4111d] text-white shadow-sm' : 'text-[#5a6170] hover:text-[#1a1a2e] bg-[#f1f3f5]'}`}
          >Planlanmış</button>
        </div>
        {/* Age group tabs */}
        <div className="flex gap-1 bg-[#f1f3f5] rounded-lg p-1 min-w-[260px]">
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

        {/* Maç arama inputu */}
        <div className="flex-1 flex items-center gap-2 min-w-[200px]">
          <div className="relative w-full">
            <input
              type="text"
              className="w-full px-3 py-2 rounded-lg border border-[#e2e5e9] bg-white text-sm text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#c4111d] pl-9"
              placeholder="Rakip ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Search size={18} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#c4111d] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Team Stats Cards */}
      {teamStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {filteredMatches.map((match) => {
            const isPlayed = match.status === "played";
            const rc = isPlayed ? resultColors[match.result] : { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" };
            return (
              <button
                key={match.id}
                onClick={() => setSelectedMatch(match)}
                className="bg-white border border-[#e2e5e9] rounded-2xl p-0 flex flex-col shadow-sm hover:border-[#c4111d]/30 hover:shadow-md transition-all duration-200 group min-w-[260px] overflow-hidden"
              >
                <div className="flex items-center gap-0 p-0">
                  {/* Sonuç/Statü Badge */}
                  <div className={`w-12 h-12 rounded-br-2xl flex items-center justify-center text-lg font-black ${rc.bg} ${rc.text} border-b ${rc.border} shrink-0`}>
                    {isPlayed ? resultLabels[match.result] : "📅"}
                  </div>
                  <div className="flex-1 min-w-0 flex items-center gap-2 px-3 py-2">
                    <div className="w-8 h-8 relative flex items-center justify-center">
                      <img src="/Logo_S.png" alt="Beylerbeyi" className="w-8 h-8 object-contain" />
                    </div>
                    {isPlayed ? (
                      <span className="text-lg font-black text-[#c4111d]">{match.scoreHome} - {match.scoreAway}</span>
                    ) : (
                      <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700">Planlandı</span>
                    )}
                    <span className="text-base font-bold text-[#1a1a2e] truncate">{match.opponent}</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1 text-[11px] sm:text-[12px] text-[#8c919a] px-2 sm:px-4 pb-2 sm:pb-3 pt-1">
                  {match.week && (
                    <>
                      <span className="font-bold text-[#c4111d]">Hafta {match.week}</span>
                      <span>·</span>
                    </>
                  )}
                  <span className="text-[11px] sm:text-[12px] font-medium">{new Date(match.date).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}</span>
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
                  {isPlayed && (
                    <>
                      <span>·</span>
                      <span className="font-medium text-[#c4111d]">{match.playerStats.length} oyuncu</span>
                    </>
                  )}
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
          {...(canEdit && (userRole?.role === "yonetici" || (userRole?.role === "antrenor" && selectedMatch.ageGroup === userRole.age_group)) ? { onEdit: handleEditFromDetail } : {})}
          {...(userRole?.role === "yonetici" ? { onDelete: handleDeleteMatch } : {})}
        />
      )}

      {/* Form Modal */}
      {editingMatch !== undefined && canEdit && (
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
