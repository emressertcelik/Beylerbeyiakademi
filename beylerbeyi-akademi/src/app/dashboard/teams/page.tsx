"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { AgeGroup } from "@/types/player";
import { Match, TeamStats } from "@/types/match";
import { useAppData } from "@/lib/app-data";
import MatchFormModal from "@/components/MatchFormModal";
import { Search } from "lucide-react";
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
    // Yaş grubu renkleri
    const ageGroupColors: Record<string, string> = {
      U14: 'bg-blue-500 text-white',
      U15: 'bg-green-500 text-white',
      U16: 'bg-yellow-500 text-black',
      U17: 'bg-purple-500 text-white',
      U19: 'bg-red-500 text-white',
      default: 'bg-gray-400 text-white',
    };
    const ageGroupCardColors: Record<string, { border: string; headerBg: string }> = {
      U14: { border: 'border-l-blue-500', headerBg: 'bg-blue-50' },
      U15: { border: 'border-l-green-500', headerBg: 'bg-green-50' },
      U16: { border: 'border-l-yellow-500', headerBg: 'bg-yellow-50' },
      U17: { border: 'border-l-purple-500', headerBg: 'bg-purple-50' },
      U19: { border: 'border-l-red-500', headerBg: 'bg-red-50' },
      default: { border: 'border-l-gray-400', headerBg: 'bg-gray-50' },
    };
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

  // Filter by userRole (antrenor/oyuncu: only own age group)
  const filteredMatches = useMemo(() => {
    let filtered = matches;
    if ((userRole?.role === "antrenor" || userRole?.role === "oyuncu") && userRole.age_group) {
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
        <div className="flex gap-1 overflow-x-auto sm:overflow-visible">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 whitespace-nowrap ${statusFilter === 'all' ? 'bg-[#c4111d] text-white shadow-sm' : 'text-[#5a6170] hover:text-[#1a1a2e] bg-[#f1f3f5]'}`}
          >Tüm Maçlar</button>
          <button
            onClick={() => setStatusFilter('played')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 whitespace-nowrap ${statusFilter === 'played' ? 'bg-[#c4111d] text-white shadow-sm' : 'text-[#5a6170] hover:text-[#1a1a2e] bg-[#f1f3f5]'}`}
          >Oynanmış</button>
          <button
            onClick={() => setStatusFilter('scheduled')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 whitespace-nowrap ${statusFilter === 'scheduled' ? 'bg-[#c4111d] text-white shadow-sm' : 'text-[#5a6170] hover:text-[#1a1a2e] bg-[#f1f3f5]'}`}
          >Planlanmış</button>
        </div>
        {/* Age group tabs */}
        <div className="flex gap-1 bg-[#f1f3f5] rounded-lg p-1 overflow-x-auto sm:overflow-visible">
          {AGE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setSelectedAge(f.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 whitespace-nowrap shrink-0 ${
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4">
          {filteredMatches.map((match) => {
            const isPlayed = match.status === "played";
            const rc = isPlayed ? resultColors[match.result] : null;
            const resultLetter = isPlayed ? resultLabels[match.result] : null;
            const matchDate = new Date(match.date);
            const dayMonth = matchDate.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
            const year = matchDate.getFullYear();

            const cardColor = ageGroupCardColors[match.ageGroup] || ageGroupCardColors.default;

            return (
              <button
                key={match.id}
                onClick={() => setSelectedMatch(match)}
                className={`bg-white border border-[#e2e5e9] border-l-4 ${cardColor.border} rounded-xl overflow-hidden text-left hover:shadow-lg hover:shadow-[#c4111d]/5 transition-all duration-200 group w-full`}
              >
                {/* Üst bar: tarih & yaş grubu & sonuç */}
                <div className={`flex items-center justify-between px-3 py-2 ${cardColor.headerBg} border-b border-[#e2e5e9]`}>
                  <div className="flex items-center gap-1.5">
                    {match.week && (
                      <span className="text-[9px] font-bold text-[#c4111d] bg-[#fef2f2] px-1.5 py-0.5 rounded">{match.week}. Hafta</span>
                    )}
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${ageGroupColors[match.ageGroup] || ageGroupColors.default}`}>{match.ageGroup}</span>
                  </div>
                  <span className="text-[9px] font-medium text-[#8c919a]">{dayMonth} {year}</span>
                </div>

                {/* Maç bilgisi: takımlar ve skor */}
                <div className="px-3 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <img src="/Logo_S.png" alt="Beylerbeyi" className="w-6 h-6 object-contain shrink-0" />
                      <span className="text-[11px] font-bold text-[#1a1a2e] truncate">Beylerbeyi</span>
                    </div>

                    {isPlayed ? (
                      <div className="flex items-center gap-1 mx-2 shrink-0">
                        <span className={`w-7 h-7 rounded flex items-center justify-center text-sm font-black text-white ${match.scoreHome > match.scoreAway ? 'bg-[#c4111d]' : match.scoreHome === match.scoreAway ? 'bg-amber-500' : 'bg-[#1a1a2e]'}`}>
                          {match.scoreHome}
                        </span>
                        <span className={`w-7 h-7 rounded flex items-center justify-center text-sm font-black text-white ${match.scoreAway > match.scoreHome ? 'bg-[#c4111d]' : match.scoreAway === match.scoreHome ? 'bg-amber-500' : 'bg-[#1a1a2e]'}`}>
                          {match.scoreAway}
                        </span>
                      </div>
                    ) : (
                      <div className="mx-2 shrink-0">
                        <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded">VS</span>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 flex-1 min-w-0">
                      <span className="text-[11px] font-bold text-[#1a1a2e] truncate text-right">{match.opponent}</span>
                    </div>
                  </div>
                </div>

                {/* Alt bilgi satırı */}
                <div className="flex items-center justify-between px-3 py-1.5 border-t border-[#f0f1f3] bg-[#fafbfc]">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${match.homeAway === 'home' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                      {match.homeAway === "home" ? "EV" : "DEP"}
                    </span>
                    {match.venue && (
                      <span className="text-[9px] text-[#8c919a] truncate max-w-[100px]">{match.venue}</span>
                    )}
                  </div>
                  {isPlayed && rc && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${rc.bg} ${rc.text}`}>
                      {resultLetter === "G" ? "GALİBİYET" : resultLetter === "B" ? "BERABERLİK" : "MAĞLUBİYET"}
                    </span>
                  )}
                  {!isPlayed && match.matchTime && (
                    <span className="text-[9px] font-semibold text-[#1a1a2e] bg-[#f1f3f5] px-1.5 py-0.5 rounded">{match.matchTime}</span>
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
    <div className="bg-white border border-[#e2e5e9] rounded-xl px-3 py-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-[#f8f9fb] flex items-center justify-center text-[#8c919a] shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[9px] text-[#8c919a] font-medium uppercase tracking-wider">{label}</p>
        <p className={`text-base font-bold ${color || "text-[#1a1a2e]"}`}>{value}</p>
      </div>
    </div>
  );
}
