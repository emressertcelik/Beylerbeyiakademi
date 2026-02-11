"use client";

import { useMemo } from "react";
import { Users, TrendingUp, Calendar, Award, Trophy, Target, Swords, MapPin } from "lucide-react";
import Link from "next/link";
import { useAppData } from "@/lib/app-data";
import { Match } from "@/types/match";

export default function DashboardPage() {
  const { players, matches, loading } = useAppData();

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
    for (const match of matches) {
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
  }, [matches]);

  // ── Asist Krallığı (Top 10) ──
  const assistLeaders = useMemo(() => {
    const map = new Map<string, { name: string; assists: number; matches: number }>();
    for (const match of matches) {
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
  }, [matches]);

  // ── Quick stats ──
  const totalGoals = useMemo(() => matches.reduce((s, m) => s + m.scoreHome, 0), [matches]);
  const totalAssists = useMemo(
    () => matches.reduce((s, m) => s + m.playerStats.reduce((a, p) => a + p.assists, 0), 0),
    [matches]
  );
  const thisMonthMatches = useMemo(() => {
    const now = new Date();
    return matches.filter((m) => {
      const d = new Date(m.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [matches]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("tr-TR", { weekday: "short", day: "numeric", month: "short" });
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#c4111d] to-[#9b0d16] rounded-2xl p-8 md:p-10 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
            Hoş Geldiniz 👋
          </h1>
          <p className="text-white/75 text-sm md:text-base max-w-md">
            Beylerbeyi Futbol Akademi Yönetim Paneli
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickStat icon={Users} label="Toplam Oyuncu" value={loading ? "—" : String(players.length)} color="text-[#c4111d]" bgColor="bg-red-50" />
        <QuickStat icon={Calendar} label="Bu Ay Maç" value={loading ? "—" : String(thisMonthMatches)} color="text-blue-600" bgColor="bg-blue-50" />
        <QuickStat icon={Target} label="Toplam Gol" value={loading ? "—" : String(totalGoals)} color="text-emerald-600" bgColor="bg-emerald-50" />
        <QuickStat icon={TrendingUp} label="Toplam Asist" value={loading ? "—" : String(totalAssists)} color="text-amber-600" bgColor="bg-amber-50" />
      </div>

      {/* ── Haftalık Maç Takvimi ── */}
      <div className="bg-white border border-[#e2e5e9] rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#e2e5e9]">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <Calendar size={18} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#1a1a2e]">Haftalık Maç Takvimi</h2>
            <p className="text-xs text-[#8c919a]">Önümüzdeki 7 gün</p>
          </div>
        </div>

        {loading ? (
          <div className="px-6 py-10 text-center text-sm text-[#8c919a]">Yükleniyor...</div>
        ) : upcomingMatches.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-[#8c919a]">
            Önümüzdeki 7 gün içinde planlanmış maç yok.
          </div>
        ) : (
          <div className="divide-y divide-[#e2e5e9]">
            {upcomingMatches.map((m) => (
              <MatchRow key={m.id} match={m} formatDate={formatDate} />
            ))}
          </div>
        )}
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
                <Swords size={24} className="text-blue-600" />
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
    </div>
  );
}

/* ── Alt Bileşenler ── */

function QuickStat({
  icon: Icon,
  label,
  value,
  color,
  bgColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="bg-white border border-[#e2e5e9] rounded-xl p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-9 h-9 rounded-lg ${bgColor} flex items-center justify-center`}>
          <Icon size={18} className={color} />
        </div>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-[#8c919a] font-medium mt-0.5">{label}</p>
    </div>
  );
}

function MatchRow({ match, formatDate }: { match: Match; formatDate: (d: string) => string }) {
  return (
    <div className="flex items-center gap-4 px-6 py-3.5 hover:bg-[#f8f9fb] transition-colors">
      {/* Tarih */}
      <div className="w-20 shrink-0 text-center">
        <p className="text-sm font-semibold text-[#1a1a2e]">{formatDate(match.date)}</p>
      </div>

      {/* Bilgi */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-white bg-[#c4111d] px-1.5 py-0.5 rounded">
            {match.ageGroup}
          </span>
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${match.homeAway === "home" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}>
            {match.homeAway === "home" ? "İç Saha" : "Deplasman"}
          </span>
        </div>
        <p className="text-sm font-medium text-[#1a1a2e] mt-1 truncate">
          Beylerbeyi vs {match.opponent}
        </p>
        {match.venue && (
          <p className="text-xs text-[#8c919a] flex items-center gap-1 mt-0.5">
            <MapPin size={12} /> {match.venue}
          </p>
        )}
      </div>
    </div>
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
