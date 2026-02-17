"use client";

import { useState, useEffect, useMemo } from "react";
import { Player, SkillLog, BodyLog } from "@/types/player";
import { Match } from "@/types/match";
import { fetchSkillLogs, fetchBodyLogs } from "@/lib/supabase/players";
import { fetchMatchesByPlayer } from "@/lib/supabase/matches";
import { X, Edit3, Trash2, TrendingUp, TrendingDown, ArrowUp, ArrowDown, Ruler, Weight, ChevronDown, Clock, Star, AlertTriangle, Ban, Users } from "lucide-react";

interface PlayerDetailModalProps {
  player: Player;
  onClose: () => void;
  onEdit: (player: Player) => void;
  onDelete?: (playerId: string) => void;
  userRole?: { role: string };
}

// Beceri alan adlarının Türkçe karşılıkları
const SKILL_LABELS: Record<string, string> = {
  positioning: "Pozisyon Alma",
  passing: "Pas",
  crossing: "Orta",
  shooting: "Şut",
  dribbling: "Dribling",
  heading: "Kafa Vuruşu",
  tackling: "Top Kesme",
  marking: "Markaj",
  game_reading: "Oyun Okuma",
  speed: "Hız",
  strength: "Güç",
  stamina: "Dayanıklılık",
  agility: "Çeviklik",
  jumping: "Sıçrama",
  balance: "Denge",
  flexibility: "Esneklik",
};

function SkillBar({ label, value, max = 10 }: { label: string; value: number; max?: number }) {
  const color =
    value >= 8 ? "bg-emerald-500" : value >= 6 ? "bg-amber-400" : value >= 4 ? "bg-orange-400" : "bg-red-400";
  const percent = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[#5a6170] w-20 sm:w-24 shrink-0">{label}</span>
      <div className="flex-1 bg-[#e2e5e9] rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs font-bold text-[#1a1a2e] w-7 text-right">{value}</span>
    </div>
  );
}

export default function PlayerDetailModal({ player, onClose, onEdit, onDelete, userRole }: PlayerDetailModalProps) {
  const isGoalkeeper = player.position === "Kaleci";
  const [skillLogs, setSkillLogs] = useState<SkillLog[]>([]);
  const [bodyLogs, setBodyLogs] = useState<BodyLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [tacticalOpen, setTacticalOpen] = useState(false);
  const [athleticOpen, setAthleticOpen] = useState(false);
  const [physicalOpen, setPhysicalOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [playerMatches, setPlayerMatches] = useState<Match[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>("ALL");

  // Position-based header gradient colors (matching PlayerCard)
  const positionGradient: Record<string, string> = {
    Kaleci: "from-amber-500 to-amber-600",
    Defans: "from-[#7a8a9e] to-[#5a6a80]",
    "Orta Saha": "from-[#a0a5b5] to-[#858a9a]",
    Forvet: "from-[#c4111d] to-[#8b0d15]",
    "Kanat Forvet": "from-[#c4111d] to-[#8b0d15]",
  };
  const gradient = positionGradient[player.position] || "from-[#a0a5b5] to-[#858a9a]";
  const initials = `${player.firstName.charAt(0)}${player.lastName.charAt(0)}`;
  const birthYear = player.birthDate ? new Date(player.birthDate).getFullYear() : "";

  useEffect(() => {
    let cancelled = false;
    async function loadLogs() {
      try {
        const [skills, body, matches] = await Promise.all([
          fetchSkillLogs(player.id),
          fetchBodyLogs(player.id),
          fetchMatchesByPlayer(player.id),
        ]);
        if (!cancelled) {
          setSkillLogs(skills);
          setBodyLogs(body);
          setPlayerMatches(matches);
        }
      } catch {
        // hata halinde boş bırak
      } finally {
        if (!cancelled) setLogsLoading(false);
      }
    }
    loadLogs();
    return () => { cancelled = true; };
  }, [player.id]);

  // Sezon listesi (maçlardan türet)
  const availableSeasons = useMemo(() => {
    const seasons = new Set<string>();
    playerMatches.forEach(m => { if (m.season) seasons.add(m.season); });
    return Array.from(seasons).sort().reverse();
  }, [playerMatches]);

  // Sezona göre filtrelenmiş maçlar
  const filteredMatches = useMemo(() => {
    return playerMatches.filter(m => {
      if (m.status !== "played") return false;
      if (selectedSeason !== "ALL" && m.season !== selectedSeason) return false;
      return true;
    });
  }, [playerMatches, selectedSeason]);

  // Katılım istatistiklerini hesapla (sezon bazlı)
  const participationStats = useMemo(() => {
    const stats = { ilk11: 0, yedek: 0, sureAlmadi: 0, kadroYok: 0, sakat: 0, cezali: 0 };
    filteredMatches.forEach(match => {
      const ps = match.playerStats.find(p => p.playerId === player.id);
      if (!ps) return;
      const s = (ps.participationStatus || "").toLowerCase();
      if (s === "ana kadro") stats.ilk11++;
      else if (s === "sonradan girdi") stats.yedek++;
      else if (s.includes("süre")) stats.sureAlmadi++;
      else if (s === "kadroda yok") stats.kadroYok++;
      else if (s === "sakat") stats.sakat++;
      else if (s.includes("ceza")) stats.cezali++;
      else if (!s && ps.minutesPlayed > 0) {
        // participationStatus boş ama dakikası varsa oynamış demektir
        stats.ilk11++;
      } else if (!s && ps.minutesPlayed === 0) {
        stats.sureAlmadi++;
      }
    });
    return stats;
  }, [filteredMatches, player.id]);

  // Sezon bazlı maç istatistikleri
  const seasonStats = useMemo(() => {
    const s = { matches: 0, minutesPlayed: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, goalsConceded: 0, cleanSheets: 0 };
    filteredMatches.forEach(match => {
      const ps = match.playerStats.find(p => p.playerId === player.id);
      if (!ps) return;
      const status = (ps.participationStatus || "").toLowerCase();
      // Oyuncunun maça katıldığı durumlar: ana kadro, sonradan girdi, veya status boş ama dakika > 0
      const isPlayed = status === "ana kadro" || status === "sonradan girdi" || (!status && ps.minutesPlayed > 0);
      if (isPlayed) {
        s.matches++;
        s.minutesPlayed += ps.minutesPlayed || 0;
        s.goals += ps.goals || 0;
        s.assists += ps.assists || 0;
        s.yellowCards += ps.yellowCards || 0;
        s.redCards += ps.redCards || 0;
        s.goalsConceded += ps.goalsConceded || 0;
        if (ps.cleanSheet) s.cleanSheets++;
      }
      // Sakat/cezalı oyuncuların da kart bilgilerini sayalım (maç dışı kırmızı kart gibi)
      if (status === "sakat" || status === "cezali" || status === "cezalı") {
        s.yellowCards += ps.yellowCards || 0;
        s.redCards += ps.redCards || 0;
      }
    });
    return s;
  }, [filteredMatches, player.id]);

  const playerAllMatches = useMemo(() => {
    return filteredMatches
      .map(match => ({
        match,
        playerStat: match.playerStats.find(ps => ps.playerId === player.id),
      }));
  }, [filteredMatches, player.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#e2e5e9] animate-slide-in-up">
        {/* Renkli Header */}
        <div className={`relative bg-gradient-to-br ${gradient} px-4 sm:px-6 py-3 sm:py-4 rounded-t-2xl`}>
          {/* Kapat butonu */}
          <button
            onClick={onClose}
            className="absolute top-2.5 right-2.5 p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white/70 hover:text-white z-10"
          >
            <X size={16} />
          </button>
          {/* Forma numarası */}
          <span className="absolute top-2 right-10 text-2xl sm:text-3xl font-black text-white/15 italic leading-none">
            #{player.jerseyNumber}
          </span>
          {/* İsim baş harfleri */}
          <div className="w-10 h-10 rounded-lg bg-white/90 backdrop-blur flex items-center justify-center text-sm font-black text-[#1a1a2e] shadow-sm mb-2">
            {initials}
          </div>
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
            {player.firstName} {player.lastName}
          </h2>
          <p className="text-[10px] text-white/60 mt-0.5">
            {player.position} · {player.ageGroup} · {birthYear}
          </p>
        </div>

        {/* Aksiyon butonları */}
        <div className="flex items-center gap-2 px-4 sm:px-6 py-2.5 border-b border-[#e2e5e9] bg-[#f8f9fb]">
          {onEdit && (
            <button
              onClick={() => onEdit(player)}
              className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-[#f1f3f5] text-[#1a1a2e] text-[11px] font-semibold rounded-lg transition-all border border-[#e2e5e9] shadow-sm"
            >
              <Edit3 size={12} />
              <span>Düzenle</span>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => { if (confirm(`${player.firstName} ${player.lastName} silinecek. Emin misiniz?`)) onDelete(player.id); }}
              className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-red-50 text-red-500 text-[11px] font-semibold rounded-lg transition-all border border-[#e2e5e9] shadow-sm"
            >
              <Trash2 size={12} />
              <span>Sil</span>
            </button>
          )}
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Genel Bilgiler */}
          <Section title="Genel Bilgiler">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <InfoBox label="Doğum Tarihi" value={new Date(player.birthDate).toLocaleDateString("tr-TR")} />
              <InfoBox label="Boy" value={`${player.height} cm`} />
              <InfoBox label="Kilo" value={`${player.weight} kg`} />
              <InfoBox label="Ayak" value={player.foot} />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <InfoBox label="Sezon" value={player.seasons.join(", ")} />
              <InfoBox label="Forma No" value={`#${player.jerseyNumber}`} />
            </div>
            {player.previousTeams && player.previousTeams.length > 0 && (
              <div className="mt-3 bg-[#f8f9fb] rounded-xl p-4 border border-[#e2e5e9]">
                <p className="text-[11px] text-[#8c919a] font-medium uppercase tracking-wider mb-2">Önceki Takımlar</p>
                <div className="space-y-2">
                  {player.previousTeams.map((pt, i) => (
                    <div key={i} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-[#e2e5e9]">
                      <span className="text-sm font-medium text-[#1a1a2e]">{pt.team}</span>
                      <span className="text-xs text-[#8c919a] bg-[#f1f3f5] px-2 py-0.5 rounded-md">{pt.years}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {(player.phone || player.parentPhone) && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                {player.phone && <InfoBox label="Telefon" value={player.phone} />}
                {player.parentPhone && <InfoBox label="Veli Telefonu" value={player.parentPhone} />}
              </div>
            )}
            {player.notes && (
              <div className="mt-3 bg-[#f8f9fb] rounded-xl p-4 border border-[#e2e5e9]">
                <p className="text-[11px] text-[#8c919a] font-medium uppercase tracking-wider mb-1.5">Notlar</p>
                <p className="text-sm text-[#1a1a2e] leading-relaxed">{player.notes}</p>
              </div>
            )}
          </Section>

          {/* Fiziksel Gelişim */}
          <CollapsibleSection title="Fiziksel Gelişim" isOpen={physicalOpen} onToggle={() => setPhysicalOpen(!physicalOpen)}>
            {logsLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="w-6 h-6 border-2 border-[#e2e5e9] border-t-[#c4111d] rounded-full animate-spin" />
              </div>
            ) : bodyLogs.length === 0 ? (
              <div className="bg-[#f8f9fb] rounded-xl p-5 text-center border border-[#e2e5e9]">
                <p className="text-sm text-[#8c919a]">Henüz boy/kilo değişikliği kaydı bulunmuyor.</p>
                <p className="text-xs text-[#8c919a] mt-1">Boy veya kilo güncellendiğinde geçmiş burada görünür.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                {bodyLogs.map((log) => {
                  const diff = log.newValue - log.oldValue;
                  const isUp = diff > 0;
                  const isHeight = log.measurement === "height";
                  const unit = isHeight ? "cm" : "kg";
                  return (
                    <div
                      key={log.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 bg-[#f8f9fb] rounded-lg px-3 sm:px-4 py-3 border border-[#e2e5e9]"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isHeight ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
                        }`}>
                          {isHeight ? <Ruler size={16} /> : <Weight size={16} />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#1a1a2e]">
                              {isHeight ? "Boy" : "Kilo"}
                            </span>
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                              isHeight ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
                            }`}>
                              {unit}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#8c919a] mt-0.5">
                            {new Date(log.changedAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                            {" · "}
                            {new Date(log.changedAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-10 sm:ml-auto">
                        <span className="text-sm font-medium text-[#8c919a]">{log.oldValue} {unit}</span>
                        <div className={`flex items-center gap-0.5 px-2 py-1 rounded-md text-xs font-bold ${
                          isUp
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-500"
                        }`}>
                          {isUp ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                          {Math.abs(diff)}
                        </div>
                        <span className="text-sm font-bold text-[#1a1a2e]">{log.newValue} {unit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CollapsibleSection>

          {/* İstatistikler */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-[#8c919a] uppercase tracking-wider">Maç İstatistikleri</h3>
              {/* Sezon Filtresi */}
              <div className="flex items-center gap-1 overflow-x-auto">
                <button
                  onClick={() => setSelectedSeason("ALL")}
                  className={`px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all whitespace-nowrap ${
                    selectedSeason === "ALL"
                      ? "bg-[#c4111d] text-white shadow-sm"
                      : "text-[#5a6170] bg-[#f1f3f5] hover:text-[#1a1a2e]"
                  }`}
                >
                  Tümü
                </button>
                {availableSeasons.map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSeason(s)}
                    className={`px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all whitespace-nowrap ${
                      selectedSeason === s
                        ? "bg-[#c4111d] text-white shadow-sm"
                        : "text-[#5a6170] bg-[#f1f3f5] hover:text-[#1a1a2e]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <StatBox label="Maç" value={seasonStats.matches} />
              <StatBox label="Dk. Oynanan" value={seasonStats.minutesPlayed} />
              {isGoalkeeper ? (
                <>
                  <StatBox label="Yenilen Gol" value={seasonStats.goalsConceded} color="text-orange-500" />
                  <StatBox label="Clean Sheet" value={seasonStats.cleanSheets} color="text-emerald-500" />
                </>
              ) : (
                <>
                  <StatBox label="Gol" value={seasonStats.goals} color="text-emerald-500" />
                  <StatBox label="Asist" value={seasonStats.assists} color="text-blue-500" />
                </>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="bg-[#f8f9fb] rounded-xl p-4 flex items-center gap-3 border border-[#e2e5e9]">
                <span className="inline-block w-4 h-5 rounded-[3px] bg-yellow-400" />
                <div>
                  <p className="text-base font-bold text-[#1a1a2e]">{seasonStats.yellowCards}</p>
                  <p className="text-[11px] text-[#8c919a]">Sarı Kart</p>
                </div>
              </div>
              <div className="bg-[#f8f9fb] rounded-xl p-4 flex items-center gap-3 border border-[#e2e5e9]">
                <span className="inline-block w-4 h-5 rounded-[3px] bg-red-500" />
                <div>
                  <p className="text-base font-bold text-[#1a1a2e]">{seasonStats.redCards}</p>
                  <p className="text-[11px] text-[#8c919a]">Kırmızı Kart</p>
                </div>
              </div>
            </div>
            {/* Katılım Durumu */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-2">
              <StatBox label="İlk 11" value={participationStats.ilk11} color="text-emerald-500" />
              <StatBox label="Yedek" value={participationStats.yedek} color="text-blue-500" />
              <StatBox label="Süre Almadı" value={participationStats.sureAlmadi} color="text-amber-500" />
              <StatBox label="Kadroda Yok" value={participationStats.kadroYok} />
              <StatBox label="Sakat" value={participationStats.sakat} color="text-orange-500" />
              <StatBox label="Cezalı" value={participationStats.cezali} color="text-red-500" />
            </div>
            {/* Oyuncunun Maçları - Mini Fikstür */}
            <div className="mt-4">
              <p className="text-[11px] text-[#8c919a] font-medium uppercase tracking-wider mb-2">Oynadığı Maçlar</p>
              {logsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="w-5 h-5 border-2 border-[#e2e5e9] border-t-[#c4111d] rounded-full animate-spin" />
                </div>
              ) : playerAllMatches.length === 0 ? (
                <p className="text-xs text-[#8c919a] text-center py-3">Henüz oynanan maç bulunmuyor.</p>
              ) : (
                <div className="bg-[#f8f9fb] rounded-xl border border-[#e2e5e9] divide-y divide-[#e2e5e9] max-h-[400px] overflow-y-auto">
                  {playerAllMatches.map(({ match, playerStat }) => {
                    const status = playerStat?.participationStatus || "";
                    let StatusIcon: typeof Star | null = null;
                    let statusObj: { text: string; bg: string; tag: string; border: string } | null = null;
                    if (status.toLowerCase() === "ana kadro" || status === "İlk 11") {
                      StatusIcon = Star;
                      statusObj = { text: "text-emerald-600", bg: "bg-emerald-50", tag: "İlk 11", border: "border-l-emerald-400" };
                    } else if (status === "Sonradan Girdi") {
                      StatusIcon = Clock;
                      statusObj = { text: "text-blue-600", bg: "bg-blue-50", tag: "Yedek", border: "border-l-blue-400" };
                    } else if (status === "Sakat") {
                      StatusIcon = AlertTriangle;
                      statusObj = { text: "text-orange-600", bg: "bg-orange-50", tag: "Sakat", border: "border-l-orange-400" };
                    } else if (status === "Cezalı") {
                      StatusIcon = Ban;
                      statusObj = { text: "text-red-600", bg: "bg-red-50", tag: "Cezalı", border: "border-l-red-400" };
                    } else if (status === "Kadroda Yok") {
                      StatusIcon = Users;
                      statusObj = { text: "text-gray-500", bg: "bg-gray-50", tag: "Kadroda Yok", border: "border-l-gray-300" };
                    } else if (status === "Süre Almadı") {
                      StatusIcon = Clock;
                      statusObj = { text: "text-yellow-600", bg: "bg-yellow-50", tag: "Süre Almadı", border: "border-l-yellow-400" };
                    } else if (!status && playerStat && playerStat.minutesPlayed > 0) {
                      // participationStatus boş ama dakikası var - oynadı
                      StatusIcon = Star;
                      statusObj = { text: "text-emerald-600", bg: "bg-emerald-50", tag: "Oynadı", border: "border-l-emerald-400" };
                    } else if (!status && playerStat && playerStat.minutesPlayed === 0) {
                      StatusIcon = Clock;
                      statusObj = { text: "text-yellow-600", bg: "bg-yellow-50", tag: "Süre Almadı", border: "border-l-yellow-400" };
                    }

                    const matchDate = new Date(match.date);
                    const day = matchDate.getDate();
                    const month = matchDate.toLocaleDateString("tr-TR", { month: "short" }).toUpperCase();
                    const isActive = statusObj && (statusObj.tag === "İlk 11" || statusObj.tag === "Yedek" || statusObj.tag === "Oynadı");
                    const resultBg = match.scoreHome > match.scoreAway ? "bg-emerald-500" :
                                     match.scoreHome < match.scoreAway ? "bg-red-500" : "bg-amber-400";

                    const ageGroupColor: Record<string, string> = {
                      U14: "bg-blue-100 text-blue-700",
                      U15: "bg-green-100 text-green-700",
                      U16: "bg-yellow-100 text-yellow-700",
                      U17: "bg-purple-100 text-purple-700",
                      U19: "bg-red-100 text-red-700",
                    };

                    return (
                      <div key={match.id} className={`bg-white border-l-[3px] ${statusObj?.border || "border-l-gray-200"}`}>
                        {/* Fikstür satırı */}
                        <div className="flex items-center px-2.5 py-2 gap-2">
                          {/* Tarih bloğu */}
                          <div className="w-8 shrink-0 text-center">
                            <p className="text-sm font-black text-[#1a1a2e] leading-none">{day}</p>
                            <p className="text-[7px] font-bold text-[#8c919a] tracking-wider mt-0.5">{month}</p>
                          </div>

                          {/* Beylerbeyi logo + skor + rakip */}
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <img src="/Logo_S.png" alt="BB" className="w-5 h-5 object-contain shrink-0" />
                            <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded ${resultBg} shrink-0`}>
                              <span className="text-[11px] font-black text-white leading-none">{match.scoreHome}</span>
                              <span className="text-[9px] text-white/60 font-medium">-</span>
                              <span className="text-[11px] font-black text-white leading-none">{match.scoreAway}</span>
                            </div>
                            <span className="text-[11px] font-semibold text-[#1a1a2e] truncate">{match.opponent}</span>
                          </div>

                          {/* Yaş grubu badge */}
                          {match.ageGroup && (
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded shrink-0 ${ageGroupColor[match.ageGroup] || "bg-gray-100 text-gray-600"}`}>
                              {match.ageGroup}
                            </span>
                          )}

                          {/* Katılım badge - tam yazılı + ikonlu */}
                          {statusObj && StatusIcon && (
                            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded shrink-0 ${statusObj.bg}`}>
                              <StatusIcon size={10} className={statusObj.text} />
                              <span className={`text-[9px] font-bold ${statusObj.text}`}>{statusObj.tag}</span>
                            </div>
                          )}
                        </div>

                        {/* İstatistik ikonları (sadece oynadıysa) */}
                        {isActive && playerStat && (
                          <div className="flex items-center gap-3 px-2.5 pb-2 ml-10">
                            {playerStat.minutesPlayed > 0 && (
                              <span className="flex items-center gap-1 text-[10px] text-[#5a6170]">
                                <Clock size={10} className="text-[#8c919a]" />
                                <span className="font-semibold">{playerStat.minutesPlayed}&apos;</span>
                              </span>
                            )}
                            {playerStat.goals > 0 && (
                              <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold" title="Gol">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 2 L14 8 L20 8 L15 12 L17 18 L12 14 L7 18 L9 12 L4 8 L10 8 Z" fill="currentColor" opacity="0.3"/><circle cx="12" cy="12" r="3.5" fill="currentColor"/></svg>
                                {playerStat.goals}
                              </span>
                            )}
                            {playerStat.assists > 0 && (
                              <span className="flex items-center gap-1 text-[10px] text-blue-600 font-bold" title="Asist">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="12" r="2" fill="currentColor"/><line x1="12" y1="2" x2="12" y2="6" stroke="currentColor" strokeWidth="1.5"/><line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5"/><line x1="2" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="1.5"/><line x1="18" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5"/></svg>
                                {playerStat.assists}
                              </span>
                            )}
                            {isGoalkeeper && playerStat.goalsConceded > 0 && (
                              <span className="flex items-center gap-1 text-[10px] text-orange-500 font-bold" title="Yenilen Gol">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="4" width="20" height="16" rx="1" stroke="currentColor" strokeWidth="2"/><line x1="12" y1="4" x2="12" y2="20" stroke="currentColor" strokeWidth="1" opacity="0.4"/><line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1" opacity="0.4"/><circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.5"/></svg>
                                {playerStat.goalsConceded}
                              </span>
                            )}
                            {playerStat.yellowCards > 0 && (
                              <span className="flex items-center gap-1 text-[10px] text-yellow-600 font-bold" title="Sarı Kart">
                                <span className="inline-block w-2.5 h-3.5 rounded-[2px] bg-yellow-400 shadow-sm" />
                                {playerStat.yellowCards}
                              </span>
                            )}
                            {playerStat.redCards > 0 && (
                              <span className="flex items-center gap-1 text-[10px] text-red-600 font-bold" title="Kırmızı Kart">
                                <span className="inline-block w-2.5 h-3.5 rounded-[2px] bg-red-500 shadow-sm" />
                                {playerStat.redCards}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Taktik Değerler */}
          {userRole?.role !== "oyuncu" && (
            <CollapsibleSection title="Taktik Değerler" isOpen={tacticalOpen} onToggle={() => setTacticalOpen(!tacticalOpen)}>
              <div className="bg-[#f8f9fb] rounded-xl p-5 space-y-3 border border-[#e2e5e9]">
                <SkillBar label="Pozisyon Alma" value={player.tactical.positioning} />
                <SkillBar label="Pas" value={player.tactical.passing} />
                <SkillBar label="Orta" value={player.tactical.crossing} />
                <SkillBar label="Şut" value={player.tactical.shooting} />
                <SkillBar label="Dribling" value={player.tactical.dribbling} />
                <SkillBar label="Kafa Vuruşu" value={player.tactical.heading} />
                <SkillBar label="Top Kesme" value={player.tactical.tackling} />
                <SkillBar label="Markaj" value={player.tactical.marking} />
                <SkillBar label="Oyun Okuma" value={player.tactical.gameReading} />
              </div>
            </CollapsibleSection>
          )}

          {/* Atletik Değerler */}
          {userRole?.role !== "oyuncu" && (
            <CollapsibleSection title="Atletik Değerler" isOpen={athleticOpen} onToggle={() => setAthleticOpen(!athleticOpen)}>
              <div className="bg-[#f8f9fb] rounded-xl p-5 space-y-3 border border-[#e2e5e9]">
                <SkillBar label="Hız" value={player.athletic.speed} />
                <SkillBar label="Güç" value={player.athletic.strength} />
                <SkillBar label="Dayanıklılık" value={player.athletic.stamina} />
                <SkillBar label="Çeviklik" value={player.athletic.agility} />
                <SkillBar label="Sıçrama" value={player.athletic.jumping} />
                <SkillBar label="Denge" value={player.athletic.balance} />
                <SkillBar label="Esneklik" value={player.athletic.flexibility} />
              </div>
            </CollapsibleSection>
          )}

          {/* Gelişim Logu */}
          {userRole?.role !== "oyuncu" && (
            <CollapsibleSection title="Gelişim Geçmişi" isOpen={historyOpen} onToggle={() => setHistoryOpen(!historyOpen)}>
              {logsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-[#e2e5e9] border-t-[#c4111d] rounded-full animate-spin" />
                </div>
              ) : skillLogs.length === 0 ? (
                <div className="bg-[#f8f9fb] rounded-xl p-6 text-center border border-[#e2e5e9]">
                  <p className="text-sm text-[#8c919a]">Henüz beceri değişikliği kaydı bulunmuyor.</p>
                  <p className="text-xs text-[#8c919a] mt-1">Taktik veya atletik değerler güncellendiğinde gelişim burada görünür.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {skillLogs.map((log) => {
                    const diff = log.newValue - log.oldValue;
                    const isUp = diff > 0;
                    return (
                      <div
                        key={log.id}
                        className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 bg-[#f8f9fb] rounded-lg px-3 sm:px-4 py-3 border border-[#e2e5e9]"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                          }`}>
                            {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-[#1a1a2e]">
                                {SKILL_LABELS[log.skillName] || log.skillName}
                              </span>
                              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                log.category === "tactical"
                                  ? "bg-blue-50 text-blue-600"
                                  : "bg-purple-50 text-purple-600"
                              }`}>
                                {log.category === "tactical" ? "Taktik" : "Atletik"}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#8c919a] mt-0.5">
                              {new Date(log.changedAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                              {" · "}
                              {new Date(log.changedAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-10 sm:ml-auto">
                          <span className="text-sm font-medium text-[#8c919a]">{log.oldValue}</span>
                          <div className={`flex items-center gap-0.5 px-2 py-1 rounded-md text-xs font-bold ${
                            isUp
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-red-50 text-red-500"
                          }`}>
                            {isUp ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                            {Math.abs(diff)}
                          </div>
                          <span className="text-sm font-bold text-[#1a1a2e]">{log.newValue}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CollapsibleSection>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-xs font-semibold text-[#8c919a] uppercase tracking-wider mb-3">{title}</h3>
      {children}
    </section>
  );
}

function CollapsibleSection({ title, isOpen, onToggle, children }: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section>
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full py-1 group"
        type="button"
      >
        <h3 className="text-xs font-semibold text-[#8c919a] uppercase tracking-wider group-hover:text-[#1a1a2e] transition-colors">{title}</h3>
        <ChevronDown
          size={16}
          className={`text-[#8c919a] group-hover:text-[#1a1a2e] transition-all duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[600px] opacity-100 mt-3" : "max-h-0 opacity-0"
        }`}
      >
        {children}
      </div>
    </section>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#f8f9fb] rounded-lg px-3 py-2 border border-[#e2e5e9]">
      <p className="text-[9px] text-[#8c919a] font-medium uppercase tracking-wider">{label}</p>
      <p className="text-xs font-semibold text-[#1a1a2e] mt-0.5">{value}</p>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-[#f8f9fb] rounded-lg px-3 py-2 text-center border border-[#e2e5e9]">
      <p className={`text-base font-bold ${color || "text-[#1a1a2e]"}`}>{value}</p>
      <p className="text-[9px] text-[#8c919a] font-medium uppercase tracking-wider">{label}</p>
    </div>
  );
}

