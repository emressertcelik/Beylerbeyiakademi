"use client";

import { useState, useEffect, useMemo } from "react";
import { Player, SkillLog, BodyLog } from "@/types/player";
import { Match } from "@/types/match";
import { fetchSkillLogs, fetchBodyLogs } from "@/lib/supabase/players";
import { fetchMatchesByPlayer } from "@/lib/supabase/matches";
import { X, Edit3, Trash2, TrendingUp, TrendingDown, ArrowUp, ArrowDown, Ruler, Weight, ChevronDown, UserCheck, ArrowRightLeft, Cross, ShieldBan, UserX, Clock, Star, AlertTriangle, Ban, Users } from "lucide-react";

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

  // Katılım istatistiklerini hesapla
  const participationStats = useMemo(() => {
    const stats = { ilk11: 0, yedek: 0, sureAlmadi: 0, kadroYok: 0, sakat: 0, cezali: 0 };
    playerMatches.forEach(match => {
      if (match.status !== "played") return;
      const ps = match.playerStats.find(p => p.playerId === player.id);
      if (!ps) return;
      const s = (ps.participationStatus || "").toLowerCase();
      if (s === "ana kadro") stats.ilk11++;
      else if (s === "sonradan girdi") stats.yedek++;
      else if (s.includes("süre")) stats.sureAlmadi++;
      else if (s === "kadroda yok") stats.kadroYok++;
      else if (s === "sakat") stats.sakat++;
      else if (s.includes("ceza")) stats.cezali++;
    });
    return stats;
  }, [playerMatches, player.id]);

  const playerAllMatches = useMemo(() => {
    return playerMatches
      .filter(m => m.status === "played")
      .map(match => ({
        match,
        playerStat: match.playerStats.find(ps => ps.playerId === player.id),
      }));
  }, [playerMatches, player.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#e2e5e9] animate-slide-in-up">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-[#e2e5e9] px-4 sm:px-6 py-4 sm:py-5 z-10 rounded-t-2xl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl bg-[#c4111d]/10 flex items-center justify-center text-lg sm:text-xl font-black text-[#c4111d] shrink-0">
                {player.jerseyNumber}
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-[#1a1a2e] truncate">
                  {player.firstName} {player.lastName}
                </h2>
                <p className="text-xs sm:text-sm text-[#5a6170] truncate">
                  {player.position} · {player.ageGroup} · {player.foot} Ayak
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <a
                href={`/dashboard/reports/${player.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-[#c4111d] hover:bg-[#9b0d16] text-white text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 shadow-sm"
                title="Özel Raporu Gör"
              >
                <span>Rapor</span>
              </a>
              {onEdit && (
                <button
                  onClick={() => onEdit(player)}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-[#f1f3f5] hover:bg-[#e2e5e9] text-[#c4111d] text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 border border-[#e2e5e9]"
                >
                  <Edit3 size={14} />
                  <span className="hidden sm:inline">Düzenle</span>
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => { if (confirm(`${player.firstName} ${player.lastName} silinecek. Emin misiniz?`)) onDelete(player.id); }}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-white hover:bg-red-50 text-[#c4111d] text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 border border-[#e2e5e9] hover:border-[#c4111d]/30"
                >
                  <Trash2 size={14} />
                  <span className="hidden sm:inline">Sil</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#f1f3f5] rounded-lg transition-colors text-[#5a6170]"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
          {/* Genel Bilgiler */}
          <Section title="Genel Bilgiler">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <InfoBox label="Doğum Tarihi" value={new Date(player.birthDate).toLocaleDateString("tr-TR")} />
              <InfoBox label="Boy" value={`${player.height} cm`} />
              <InfoBox label="Kilo" value={`${player.weight} kg`} />
              <InfoBox label="Forma No" value={`#${player.jerseyNumber}`} />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <InfoBox label="Sezon" value={player.seasons.join(", ")} />
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
          <Section title="Maç İstatistikleri">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatBox label="Maç" value={player.stats.matches} />
              <StatBox label="Dk. Oynanan" value={player.stats.minutesPlayed} />
              {isGoalkeeper ? (
                <>
                  <StatBox label="Yenilen Gol" value={player.stats.goalsConceded} color="text-orange-500" />
                  <StatBox label="Clean Sheet" value={player.stats.cleanSheets} color="text-emerald-500" />
                </>
              ) : (
                <>
                  <StatBox label="Gol" value={player.stats.goals} color="text-emerald-500" />
                  <StatBox label="Asist" value={player.stats.assists} color="text-blue-500" />
                </>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="bg-[#f8f9fb] rounded-xl p-4 flex items-center gap-3 border border-[#e2e5e9]">
                <span className="inline-block w-4 h-5 rounded-[3px] bg-yellow-400" />
                <div>
                  <p className="text-base font-bold text-[#1a1a2e]">{player.stats.yellowCards}</p>
                  <p className="text-[11px] text-[#8c919a]">Sarı Kart</p>
                </div>
              </div>
              <div className="bg-[#f8f9fb] rounded-xl p-4 flex items-center gap-3 border border-[#e2e5e9]">
                <span className="inline-block w-4 h-5 rounded-[3px] bg-red-500" />
                <div>
                  <p className="text-base font-bold text-[#1a1a2e]">{player.stats.redCards}</p>
                  <p className="text-[11px] text-[#8c919a]">Kırmızı Kart</p>
                </div>
              </div>
            </div>
            {/* Katılım Durumu */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3">
              <StatBox label="İlk 11" value={participationStats.ilk11} color="text-emerald-500" />
              <StatBox label="Yedek" value={participationStats.yedek} color="text-blue-500" />
              <StatBox label="Süre Almadı" value={participationStats.sureAlmadi} color="text-amber-500" />
              <StatBox label="Kadroda Yok" value={participationStats.kadroYok} />
              <StatBox label="Sakat" value={participationStats.sakat} color="text-orange-500" />
              <StatBox label="Cezalı" value={participationStats.cezali} color="text-red-500" />
            </div>
            {/* Oyuncunun Maçları */}
            <div className="mt-4">
              <p className="text-[11px] text-[#8c919a] font-medium uppercase tracking-wider mb-2">Oynadığı Maçlar</p>
              {logsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="w-5 h-5 border-2 border-[#e2e5e9] border-t-[#c4111d] rounded-full animate-spin" />
                </div>
              ) : playerAllMatches.length === 0 ? (
                <p className="text-xs text-[#8c919a] text-center py-3">Henüz oynanan maç bulunmuyor.</p>
              ) : (
                <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                  {playerAllMatches.map(({ match, playerStat }) => {
                      // TEST: Konsola veri yazdır
                      console.log('MATCH:', match);
                      console.log('PLAYERSTAT:', playerStat);
                      console.log('PARTICIPATION STATUS:', playerStat?.participationStatus);
                    const played = match.status === "played";
                    const status = playerStat?.participationStatus || "";
                    let StatusIcon = null;
                    let statusObj = null;
                    if (status === "İlk 11") {
                      StatusIcon = Star;
                      statusObj = { text: "text-emerald-600", bg: "bg-emerald-50" };
                    } else if (status === "Sonradan Girdi") {
                      StatusIcon = Clock;
                      statusObj = { text: "text-blue-600", bg: "bg-blue-50" };
                    } else if (status === "Sakat") {
                      StatusIcon = AlertTriangle;
                      statusObj = { text: "text-orange-600", bg: "bg-orange-50" };
                    } else if (status === "Cezalı") {
                      StatusIcon = Ban;
                      statusObj = { text: "text-red-600", bg: "bg-red-50" };
                    } else if (status === "Kadroda Yok") {
                      StatusIcon = Users;
                      statusObj = { text: "text-gray-600", bg: "bg-gray-50" };
                    } else if (status === "Süre Almadı") {
                      StatusIcon = Clock;
                      statusObj = { text: "text-yellow-600", bg: "bg-yellow-50" };
                    }
                    return (
                      <div key={match.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 bg-[#f8f9fb] rounded-lg px-3 sm:px-4 py-3 border border-[#e2e5e9] mb-2">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="text-xs font-semibold text-[#1a1a2e]">{match.date}</span>
                          <span className="text-xs text-[#8c919a]">{match.opponent}</span>
                          {status && StatusIcon && statusObj ? (
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg shrink-0 ${statusObj.bg}`}>
                              <StatusIcon size={12} className={statusObj.text} />
                              <span className={`text-[9px] font-semibold ${statusObj.text}`}>{playerStat?.participationStatus}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-lg shrink-0 bg-gray-50">
                              <span className="text-[9px] text-gray-300">—</span>
                            </div>
                          )}
                        </div>
                        {/* Alt satır: istatistikler (tüm katılım durumları için) */}
                        {playerStat && (
                          <div className="flex items-center gap-0 border-t border-[#f0f1f3] bg-[#fafbfc]">
                            {status === "İlk 11" || status === "Sonradan Girdi" ? (
                              <>
                                <MatchMiniStat label="DK" value={String(playerStat.minutesPlayed)} />
                                <MatchMiniStat label="GOL" value={String(playerStat.goals)} highlight={playerStat.goals > 0} color="emerald" />
                                <MatchMiniStat label="AST" value={String(playerStat.assists)} highlight={playerStat.assists > 0} color="blue" />
                                <MatchMiniStat label="SK" value={String(playerStat.yellowCards)} highlight={playerStat.yellowCards > 0} color="yellow" />
                                <MatchMiniStat label="KK" value={String(playerStat.redCards)} highlight={playerStat.redCards > 0} color="red" />
                                <MatchMiniStat label="YG" value={String(playerStat.goalsConceded)} highlight={playerStat.goalsConceded > 0} color="orange" />
                                <MatchMiniStat label="CS" value={playerStat.cleanSheet ? "✓" : "—"} highlight={playerStat.cleanSheet} color="emerald" />
                              </>
                            ) : (
                              <MatchMiniStat label="Katılım" value={status} />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Section>

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
    <div className="bg-[#f8f9fb] rounded-lg p-3 border border-[#e2e5e9]">
      <p className="text-[10px] text-[#8c919a] font-medium mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-[#1a1a2e]">{value}</p>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-[#f8f9fb] rounded-lg p-3 text-center border border-[#e2e5e9]">
      <p className={`text-lg font-bold ${color || "text-[#1a1a2e]"}`}>{value}</p>
      <p className="text-[10px] text-[#8c919a] font-medium">{label}</p>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className="text-[9px] text-[#8c919a]">{label}</span>
      <span className={`text-[10px] font-bold ${color || "text-[#1a1a2e]"}`}>{value}</span>
    </span>
  );
}

function MatchMiniStat({ label, value, highlight, color }: {
  label: string;
  value: string;
  highlight?: boolean;
  color?: "emerald" | "blue" | "yellow" | "red" | "orange";
}) {
  const colorMap = {
    emerald: "text-emerald-600",
    blue: "text-blue-600",
    yellow: "text-yellow-600",
    red: "text-red-600",
    orange: "text-orange-500",
  };
  return (
    <div className="flex-1 flex flex-col items-center py-1.5 border-r border-[#f0f1f3] last:border-r-0">
      <span className={`text-[11px] font-bold leading-none ${highlight && color ? colorMap[color] : "text-[#1a1a2e]"}`}>
        {value}
      </span>
      <span className="text-[8px] text-[#8c919a] mt-0.5 uppercase tracking-wider">{label}</span>
    </div>
  );
}