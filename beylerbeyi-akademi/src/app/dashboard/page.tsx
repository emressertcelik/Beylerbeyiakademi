"use client";
import { useMemo, useState, useEffect } from "react";
import { Users, TrendingUp, Calendar, Award, Trophy, Target, Shield, MapPin, Star, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAppData } from "@/lib/app-data";
import { Match } from "@/types/match";
import MatchDetailModal from "@/components/MatchDetailModal";

export default function DashboardPage() {
    // Yaş grubu renkleri
    const ageGroupColors: Record<string, string> = {
      U14: 'bg-blue-500',
      U15: 'bg-green-500',
      U16: 'bg-yellow-500',
      U17: 'bg-purple-500',
      U19: 'bg-red-500',
      default: 'bg-gray-400',
    };
    const { players, matches, loading } = useAppData();

    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

    // Dynamic puan durumu state
    const [selectedAge, setSelectedAge] = useState('U15');
    const [puanTable, setPuanTable] = useState<Array<Array<string | number>>>([]);
    const [tableLoading, setTableLoading] = useState(false);
    const [showFullTable, setShowFullTable] = useState(false);

    // Age group link and group info
    const ageGroupInfo: Record<string, { url: string; group: string }> = {
      U14: { url: 'https://bakhaberinolsun.com/gelisim-ligi-u-14/', group: 'GELİŞİM 5.GRUP' },
      U15: { url: 'https://bakhaberinolsun.com/gelisim-ligi-u-15/', group: 'GELİŞİM 5.GRUP' },
      U16: { url: 'https://bakhaberinolsun.com/gelisim-ligi-u-16/', group: 'GELİŞİM 4.GRUP' },
      U17: { url: 'https://bakhaberinolsun.com/gelisim-ligi-u-17/', group: 'GELİŞİM 4.GRUP' },
      U19: { url: 'https://bakhaberinolsun.com/gelisim-ligleri-u-19/', group: 'U-19 GELİŞİM 3.GRUP' },
    };

    // Fetch puan durumu table (mocked for now)
    const fetchPuanTable = async (age: string) => {
      setTableLoading(true);
      // Yeni mockTables U14, U15, U16, U17 ve U19 ile başlıyor
      const mockTables: Record<string, Array<Array<string | number>>> = {
        U14: [
          [1, "İNEGÖL KAFKASSPOR", 20, 17, 2, 1, 76, 18, 58, 53],
          [2, "KESTEL ÇİLEKSPOR", 20, 15, 1, 4, 56, 24, 32, 46],
          [3, "GEBZESPOR", 20, 13, 3, 4, 67, 27, 40, 42],
          [4, "PANAYIRSPOR", 20, 13, 3, 4, 68, 34, 34, 42],
          [5, "DEĞİRMENDERE", 20, 12, 2, 6, 55, 31, 24, 38],
          [6, "KARACABEY BEL.SPOR", 20, 10, 3, 7, 57, 47, 10, 33],
          [7, "BULVARSPOR", 20, 9, 2, 9, 51, 49, 2, 29],
          [8, "BEYOĞLU YENİÇARŞI", 20, 7, 3, 10, 46, 50, -4, 24],
          [9, "BEYLERBEYİ 1911 FK.", 20, 7, 3, 10, 39, 46, -7, 24],
          [10, "GÖLCÜKSPOR", 20, 6, 5, 9, 30, 36, -6, 23],
          [11, "İNKİLAPSPOR", 20, 7, 1, 12, 33, 57, -24, 22],
          [12, "KAVACIKSPOR", 20, 6, 2, 12, 29, 51, -22, 20],
          [13, "ZARA EKİNLİ", 20, 1, 2, 17, 15, 79, -64, 5],
          [14, "SAKARYA TEKSPOR", 20, 1, 0, 19, 25, 97, -72, 3],
        ],
        U15: [
          [1, "İNEGÖL KAFKASSPOR", 20, 16, 1, 3, 97, 19, 78, 49],
          [2, "KESTEL ÇİLEKLİSPOR", 20, 15, 1, 4, 70, 21, 49, 46],
          [3, "GEBZESPOR", 20, 13, 3, 4, 52, 18, 34, 42],
          [4, "BEYLERBEYİ 1911 FK.", 20, 12, 2, 6, 60, 34, 26, 38],
          [5, "BEYOĞLU YENİÇARŞI", 20, 10, 6, 4, 39, 30, 9, 35],
          [6, "DEĞİRMENDERESPOR", 20, 10, 4, 6, 42, 29, 13, 34],
          [7, "BULVARSPOR", 20, 9, 6, 5, 40, 29, 11, 33],
          [8, "KARACABEY BEL.SPOR", 20, 9, 4, 7, 41, 39, 2, 31],
          [9, "GÖLCÜKSPOR", 20, 7, 2, 11, 35, 46, -11, 23],
          [10, "ZARA EKİNLİ", 20, 7, 2, 11, 44, 60, -16, 23],
          [11, "PANAYIRSPOR", 20, 6, 2, 12, 32, 43, -11, 20],
          [12, "KAVACIKSPOR", 20, 4, 1, 15, 20, 55, -45, 13],
          [13, "İNKİLAPSPOR", 20, 3, 3, 14, 21, 64, -43, 12],
          [14, "SAKARYA TEKSPOR", 20, 0, 1, 19, 15, 111, -96, 1],
        ],
        U16: [
          [1, "ARNAVUTKÖY BEL.SPOR", 18, 15, 1, 2, 59, 17, 42, 46],
          [2, "AYAZAĞASPOR", 18, 13, 1, 4, 53, 24, 29, 40],
          [3, "FERİKÖYSPOR", 18, 13, 1, 4, 42, 17, 25, 40],
          [4, "BEYLERBEYİ 1911 FK", 18, 12, 2, 4, 52, 23, 29, 38],
          [5, "K.ÇEKMECE SİNOP", 18, 11, 1, 6, 37, 22, 15, 34],
          [6, "TUNÇSPOR", 18, 11, 0, 7, 50, 35, 15, 33],
          [7, "GÜNGÖREN BEL.", 18, 9, 3, 6, 35, 25, 10, 30],
          [8, "İNKİLAPSPOR", 18, 8, 4, 6, 39, 31, 8, 28],
          [9, "K.ÇEKMECESPOR", 18, 7, 2, 9, 33, 28, 5, 23],
          [10, "İST.BEYLİKDÜZÜ", 18, 7, 1, 10, 29, 39, -10, 22],
          [11, "BAŞAKŞEHİRSPOR", 18, 4, 1, 13, 24, 49, -25, 13],
          [12, "ZARA EKİNLİ", 18, 3, 1, 14, 15, 66, -51, 10],
          [13, "İST.GENÇLERBİRLİGİ", 18, 3, 0, 15, 20, 41, -21, 9],
          [14, "KAVACIKSPOR", 18, 1, 0, 17, 10, 69, -56, 3],
        ],
      };
      setTimeout(() => {
        setPuanTable(mockTables[age] || []);
        setTableLoading(false);
      }, 500);
    };

    // Fetch on mount and when age changes
    useEffect(() => {
      fetchPuanTable(selectedAge);
    }, [selectedAge]);

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

  // ── Son 7 gün oynanan maçlar ──
  const recentResults = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    return playedMatches
      .filter((m) => {
        const d = new Date(m.date);
        return d >= weekAgo && d <= today;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
      {/* Haftanın Panoraması ve Puan Durumu birlikte */}
      <div className="rounded-2xl bg-white border border-[#e8eaed] overflow-hidden shadow-sm">
        {/* Top bar */}
        <div className="px-5 py-3 md:px-6 md:py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-[#e8eaed] bg-[#f8f9fb]">
          <div className="flex items-center gap-2.5">
            <Image
              src="/Logo_S.png"
              alt="Beylerbeyi 1911 Akademi"
              width={32}
              height={32}
              className="rounded-lg shrink-0"
            />
            <div>
              <h1 className="text-sm font-semibold text-[#1a1a2e] tracking-tight">Haftanın Panoraması</h1>
              <p className="text-[10px] text-[#8c919a]">{todayStr}</p>
            </div>
          </div>
          {/* Mini stats */}
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2 sm:flex sm:items-center sm:gap-3 w-full max-w-full overflow-x-auto">
            <MiniStat label="Atılan Gol" value={loading ? "—" : String(weeklyStats.goalsScored)} color="text-emerald-600" />
            <div className="hidden sm:block w-px h-5 bg-[#e8eaed]" />
            <MiniStat label="Yenilen Gol" value={loading ? "—" : String(weeklyStats.goalsConceded)} color="text-red-500" />
            <div className="hidden sm:block w-px h-5 bg-[#e8eaed]" />
            <MiniStat label="Galibiyet" value={loading ? "—" : String(weeklyStats.wins)} color="text-emerald-600" />
            <div className="hidden sm:block w-px h-5 bg-[#e8eaed]" />
            <MiniStat label="Beraberlik" value={loading ? "—" : String(weeklyStats.draws)} color="text-amber-600" />
            <div className="hidden sm:block w-px h-5 bg-[#e8eaed]" />
            <MiniStat label="Mağlubiyet" value={loading ? "—" : String(weeklyStats.losses)} color="text-red-600" />
          </div>
        </div>
        {/* Content: Puan Durumu + Son Maçlar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 md:p-5">

          {/* ── Puan Durumu Kartı ── */}
          <div className="rounded-xl overflow-hidden border border-[#e8eaed]">
            {/* Başlık */}
            <div className="px-4 py-2.5 flex items-center justify-between bg-[#1a1a2e]">
              <h3 className="text-[11px] font-semibold text-white/90 uppercase tracking-wider">{selectedAge} Puan Durumu</h3>
              <span className="text-[9px] font-semibold text-white bg-[#c4111d] px-2 py-0.5 rounded-full">CANLI</span>
            </div>
            {/* Yaş grubu seçici */}
            <div className="px-3 py-1.5 flex gap-1 justify-center border-b border-[#e8eaed] bg-[#f8f9fb]">
              {['U14', 'U15', 'U16', 'U17', 'U19'].map((age) => (
                <button
                  key={age}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${selectedAge === age ? 'bg-[#1a1a2e] text-white' : 'text-[#5a6170] hover:bg-[#e2e5e9]'}`}
                  onClick={() => { setSelectedAge(age); setShowFullTable(false); }}
                >
                  {age}
                </button>
              ))}
            </div>
            {/* Tablo */}
            <div className="bg-white">
              {tableLoading ? (
                <div className="py-6 text-center text-[#8c919a] text-[10px]">Yükleniyor...</div>
              ) : puanTable.length === 0 ? (
                <div className="py-6 text-center text-[#8c919a] text-[10px]">Tablo bulunamadı.</div>
              ) : (
                <div className="overflow-x-auto">
                  {/* Tablo başlığı */}
                  <div className="grid grid-cols-[32px_1fr_32px_32px] items-center px-3 py-1.5 text-[9px] font-medium text-[#8c919a] uppercase tracking-wider border-b border-[#f0f1f3]">
                    <span>#</span>
                    <span>Takım</span>
                    <span className="text-center">O</span>
                    <span className="text-center">P</span>
                  </div>
                  {/* Satırlar */}
                  {(showFullTable ? puanTable : puanTable.slice(0, 6)).map((row, idx) => {
                    const teamName = String(row[1]);
                    const isBeylerbeyi = teamName.toUpperCase().includes("BEYLERBEYİ");
                    return (
                      <div
                        key={row[0]}
                        className={`grid grid-cols-[32px_1fr_32px_32px] items-center px-3 py-2 text-[11px] transition-colors ${
                          isBeylerbeyi
                            ? "bg-[#fef2f2] border-l-2 border-l-[#c4111d]"
                            : idx % 2 === 0
                            ? "bg-white"
                            : "bg-[#fafbfc]"
                        } hover:bg-[#f0f1f3]`}
                      >
                        <span className={`font-semibold ${isBeylerbeyi ? "text-[#c4111d]" : "text-[#8c919a]"}`}>{row[0]}</span>
                        <span className={`font-medium truncate ${isBeylerbeyi ? "text-[#c4111d]" : "text-[#1a1a2e]"}`}>{row[1]}</span>
                        <span className="text-center text-[#5a6170]">{row[2]}</span>
                        <span className={`text-center font-semibold ${isBeylerbeyi ? "text-[#c4111d]" : "text-[#1a1a2e]"}`}>{row[9]}</span>
                      </div>
                    );
                  })}
                  {/* Tümünü göster / gizle */}
                  {puanTable.length > 6 && (
                    <button
                      onClick={() => setShowFullTable(!showFullTable)}
                      className="w-full py-2 text-[10px] font-semibold text-[#c4111d] hover:bg-[#fef2f2] transition-colors border-t border-[#f0f1f3]"
                    >
                      {showFullTable ? "▲ Daralt" : `▼ Tümünü Göster (${puanTable.length} takım)`}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Son Maçlar Kartı ── */}
          <div className="rounded-xl overflow-hidden border border-[#e8eaed]">
            {/* Başlık */}
            <div className="px-4 py-2.5 bg-[#1a1a2e]">
              <h3 className="text-[11px] font-semibold text-white/90 uppercase tracking-wider">Son Maçlar</h3>
            </div>
            {/* Maç listesi */}
            <div className="bg-white divide-y divide-[#f0f1f3]">
              {loading ? (
                <div className="py-6 text-center text-[#8c919a] text-[10px]">Yükleniyor...</div>
              ) : recentResults.length === 0 ? (
                <div className="py-6 text-center text-[#8c919a] text-[10px]">Henüz maç oynanmadı.</div>
              ) : (
                recentResults.slice(0, 5).map((m) => {
                  const matchDate = new Date(m.date);
                  const dayMonth = matchDate.toLocaleDateString("tr-TR", { day: "numeric", month: "long" }).toUpperCase();
                  const weekNum = m.week ? `${m.week}. HAFTA` : "";
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMatch(m)}
                      className="w-full px-4 py-3 hover:bg-[#f8f9fb] transition-colors text-left"
                    >
                      {/* Hafta, yaş grubu ve tarih */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-medium text-[#8c919a] tracking-wider uppercase">{weekNum}</span>
                          <span className="text-[9px] font-semibold text-white bg-[#1a1a2e] px-1.5 py-0.5 rounded">{m.ageGroup}</span>
                        </div>
                        <span className="text-[9px] font-medium text-[#8c919a] tracking-wider uppercase">{dayMonth}</span>
                      </div>
                      {/* Skor satırı */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <Image src="/Logo_S.png" alt="Beylerbeyi" width={16} height={16} className="rounded shrink-0" />
                          <span className="text-[11px] font-bold text-[#c4111d] truncate">Beylerbeyi</span>
                        </div>
                        <div className="flex items-center gap-1 mx-2">
                          <span className={`w-6 h-6 rounded flex items-center justify-center text-[11px] font-bold text-white ${m.scoreHome > m.scoreAway ? 'bg-[#c4111d]' : m.scoreHome === m.scoreAway ? 'bg-amber-500' : 'bg-[#1a1a2e]'}`}>
                            {m.scoreHome}
                          </span>
                          <span className={`w-6 h-6 rounded flex items-center justify-center text-[11px] font-bold text-white ${m.scoreAway > m.scoreHome ? 'bg-[#c4111d]' : m.scoreAway === m.scoreHome ? 'bg-amber-500' : 'bg-[#1a1a2e]'}`}>
                            {m.scoreAway}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-[#1a1a2e] flex-1 truncate text-right">{m.opponent}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── Haftalık Maç Takvimi ── */}
      <div className="rounded-2xl bg-white border border-[#e2e5e9] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-[#e2e5e9]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg bg-[#c4111d] flex items-center justify-center">
              <Calendar size={14} className="text-white md:hidden" />
              <Calendar size={18} className="text-white hidden md:block" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-bold text-[#1a1a2e]">Haftalık Maç Takvimi</h2>
              <p className="text-[10px] md:text-xs text-[#8c919a]">Önümüzdeki 7 gün</p>
            </div>
          </div>
          {!loading && upcomingMatches.length > 0 && (
            <span className="text-[10px] md:text-xs font-bold text-[#c4111d] bg-[#fef2f2] px-2 py-0.5 md:px-2.5 md:py-1 rounded-full">
              {upcomingMatches.length} maç
            </span>
          )}
        </div>

        <div className="p-3 md:p-5">
          {loading ? (
            <div className="text-center text-sm text-[#8c919a] py-6">Yükleniyor...</div>
          ) : upcomingMatches.length === 0 ? (
            <div className="text-center py-8">
              <Calendar size={28} className="mx-auto mb-2 text-[#e2e5e9]" />
              <p className="text-xs font-medium text-[#5a6170]">Planlanmış maç yok</p>
              <p className="text-[10px] text-[#8c919a] mt-1">Önümüzdeki 7 gün içinde maç bulunmuyor.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingMatches.map((m) => {
                const d = new Date(m.date);
                const dayName = d.toLocaleDateString("tr-TR", { weekday: "long" });
                const dayNum = d.getDate();
                const monthStr = d.toLocaleDateString("tr-TR", { month: "long" });
                const isHome = m.homeAway === "home";
                const isToday = d.toDateString() === new Date().toDateString();

                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMatch(m)}
                    className={`w-full flex items-stretch rounded-lg md:rounded-xl border transition-all duration-200 text-left group hover:shadow-md ${
                      isToday
                        ? "border-[#c4111d]/30 bg-[#fef8f8] hover:border-[#c4111d]/50 hover:shadow-[#c4111d]/10"
                        : "border-[#e2e5e9] bg-white hover:border-[#c4111d]/25 hover:shadow-[#c4111d]/5"
                    }`}
                  >
                    {/* Tarih bloğu */}
                    <div className={`w-14 md:w-20 shrink-0 flex flex-col items-center justify-center py-2.5 md:py-4 rounded-l-lg md:rounded-l-xl ${
                      isToday ? "bg-[#c4111d]" : "bg-[#f8f9fb]"
                    }`}>
                      <span className={`text-[8px] md:text-[10px] font-semibold uppercase ${isToday ? "text-white/70" : "text-[#8c919a]"}`}>
                        {isToday ? "BUGÜN" : dayName.slice(0, 3)}
                      </span>
                      <span className={`text-lg md:text-2xl font-black leading-none ${isToday ? "text-white" : "text-[#1a1a2e]"}`}>
                        {dayNum}
                      </span>
                      <span className={`text-[8px] md:text-[10px] font-medium ${isToday ? "text-white/60" : "text-[#8c919a]"}`}>
                        {monthStr.slice(0, 3)}
                      </span>
                    </div>

                    {/* İçerik */}
                    <div className="flex-1 min-w-0 p-2.5 md:p-4 flex flex-col sm:flex-row sm:items-center gap-1.5 md:gap-3">
                      {/* Maç bilgisi */}
                      <div className="flex-1 min-w-0">
                        {/* Etiketler */}
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-[8px] md:text-[10px] font-bold text-white bg-[#1a1a2e] px-1 md:px-1.5 py-0.5 rounded">
                            {m.ageGroup}
                          </span>
                          <span className={`text-[8px] md:text-[10px] font-semibold px-1 md:px-1.5 py-0.5 rounded ${
                            isHome ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
                          }`}>
                            {isHome ? "EV" : "DEP"}
                          </span>
                          {m.status === "played" && (
                            <span className="text-[8px] md:text-[10px] font-semibold px-1 md:px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600">
                              OYNANDI
                            </span>
                          )}
                        </div>

                        {/* Takımlar */}
                        <div className="flex items-center gap-1.5">
                          <Image src="/Logo_S.png" alt="Beylerbeyi" width={14} height={14} className="rounded shrink-0 md:w-[18px] md:h-[18px]" />
                          <span className="text-[11px] md:text-sm font-bold text-[#c4111d]">Beylerbeyi</span>
                          <span className="text-[10px] md:text-xs font-bold text-[#8c919a]">vs</span>
                          <span className="text-[11px] md:text-sm font-semibold text-[#1a1a2e] truncate">{m.opponent}</span>
                        </div>
                      </div>

                      {/* Saat & Konum bilgisi */}
                      <div className="flex sm:flex-col items-center sm:items-end gap-1.5 sm:gap-1 shrink-0">
                        {m.matchTime && (
                          <div className="flex items-center gap-1 bg-[#f8f9fb] border border-[#e2e5e9] rounded px-1.5 py-1 md:rounded-lg md:px-2.5 md:py-1.5">
                            <Clock size={10} className="text-[#c4111d] md:hidden" />
                            <Clock size={12} className="text-[#c4111d] hidden md:block" />
                            <span className="text-[10px] md:text-xs font-bold text-[#1a1a2e]">{m.matchTime}</span>
                          </div>
                        )}
                        {m.venue && (
                          <div className="flex items-center gap-1 text-[8px] md:text-[10px] text-[#8c919a]">
                            <MapPin size={8} className="shrink-0 md:hidden" />
                            <MapPin size={10} className="shrink-0 hidden md:block" />
                            <span className="truncate max-w-[100px] md:max-w-[140px]">{m.venue}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
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
      <p className={`text-sm sm:text-base font-semibold ${color || "text-[#1a1a2e]"}`}>{value}</p>
      <p className="text-[8px] sm:text-[9px] text-[#8c919a] font-medium whitespace-nowrap">{label}</p>
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
        U19: [
          [1, "ARNAVUTKÖY BELEDİYESPOR", 18, 15, 2, 1, 54, 13, 41, 47],
          [2, "K.ÇEKMECE SİNOPSPOR", 18, 13, 2, 3, 44, 18, 26, 41],
          [3, "İSTANBUL BEYLİKDÜZÜ", 18, 12, 2, 4, 44, 22, 22, 38],
          [4, "FERİKÖYSPOR", 18, 11, 3, 4, 38, 19, 19, 36],
          [5, "AYAZAĞASPOR", 18, 10, 3, 5, 38, 23, 15, 33],
          [6, "K.ÇEKMECESPOR", 18, 9, 4, 5, 36, 25, 11, 31],
          [7, "BEYLERBEYİ 1911 FK.", 18, 8, 3, 7, 32, 28, 4, 27],
          [8, "İST. GENÇLERBİRLİĞİ", 18, 7, 4, 7, 29, 29, 0, 25],
          [9, "BAŞAKŞEHİRSPOR", 18, 6, 3, 9, 27, 34, -7, 21],
          [10, "TUNÇSPOR", 18, 5, 4, 9, 24, 36, -12, 19],
          [11, "GÜNGÖREN BELEDİYESPOR", 18, 4, 3, 11, 19, 38, -19, 15],
          [12, "İNKİLAPSPOR", 18, 3, 2, 13, 18, 44, -26, 11],
          [13, "KAVACIKSPOR", 18, 2, 2, 14, 14, 54, -40, 8],
          [14, "ZARA EKİNLİSPOR", 18, 1, 1, 16, 10, 60, -50, 4],
        ],
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
