"use client";

import { useState, useEffect, useMemo } from "react";
import { Player, SkillLog, BodyLog } from "@/types/player";
import { Match } from "@/types/match";
import { fetchSkillLogs, fetchBodyLogs } from "@/lib/supabase/players";
import { fetchMatchesByPlayer } from "@/lib/supabase/matches";
import { fetchPlayerAttendanceStats } from "@/lib/supabase/trainingSchedule";
import { useAppData } from "@/lib/app-data";
import { X, Edit3, Trash2, TrendingUp, TrendingDown, ArrowUp, ArrowDown, Ruler, Weight, ChevronDown, Clock, Star, AlertTriangle, Ban, Users, FileDown } from "lucide-react";
import { getPositionColors } from "@/lib/positions";

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
  const { lookups } = useAppData();
  const activeSeason = lookups.seasons.length > 0 ? lookups.seasons[lookups.seasons.length - 1].value : "";

  const [skillLogs, setSkillLogs] = useState<SkillLog[]>([]);
  const [bodyLogs, setBodyLogs] = useState<BodyLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [attendanceStats, setAttendanceStats] = useState<{ total: number; geldi: number; gelmedi: number; izinli: number; sakat: number } | null>(null);
  const [tacticalOpen, setTacticalOpen] = useState(false);
  const [athleticOpen, setAthleticOpen] = useState(false);
  const [physicalOpen, setPhysicalOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [playerMatches, setPlayerMatches] = useState<Match[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>("ALL");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>("ALL");
  const [pdfLoading, setPdfLoading] = useState(false);

  const { from: gradFrom, to: gradTo } = getPositionColors(player.position);
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

  useEffect(() => {
    if (!activeSeason || !player.ageGroup) return;
    fetchPlayerAttendanceStats(player.id, player.ageGroup, activeSeason)
      .then(setAttendanceStats)
      .catch(() => {});
  }, [player.id, player.ageGroup, activeSeason]);

  // Sezon listesi (maçlardan türet)
  const availableSeasons = useMemo(() => {
    const seasons = new Set<string>();
    playerMatches.forEach(m => { if (m.season) seasons.add(m.season); });
    return Array.from(seasons).sort().reverse();
  }, [playerMatches]);

  // Yaş grubu listesi (maçlardan türet — birden fazlaysa göster)
  const availableAgeGroups = useMemo(() => {
    const groups = new Set<string>();
    playerMatches.forEach(m => { if (m.ageGroup) groups.add(m.ageGroup); });
    return Array.from(groups).sort();
  }, [playerMatches]);

  // Sezon + yaş grubuna göre filtrelenmiş maçlar
  const filteredMatches = useMemo(() => {
    return playerMatches.filter(m => {
      if (m.status !== "played") return false;
      if (selectedSeason !== "ALL" && m.season !== selectedSeason) return false;
      if (selectedAgeGroup !== "ALL" && m.ageGroup !== selectedAgeGroup) return false;
      return true;
    });
  }, [playerMatches, selectedSeason, selectedAgeGroup]);

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
      const isSureAlmadi = status.includes("süre almadı") || status.includes("süre yok");
      const isPlayed = status === "ana kadro" || status === "sonradan girdi" || isSureAlmadi || (!status && ps.minutesPlayed > 0);
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

  async function exportPDF() {
    setPdfLoading(true);
    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const { jsPDF } = await import("jspdf");
      const now = new Date().toLocaleDateString("tr-TR");
      const age = player.birthDate ? Math.floor((Date.now() - new Date(player.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : "";
      const passiveLabel = player.passiveReason === "gonderildi" ? "Gönderildi" :
                           player.passiveReason === "ayrildi"    ? "Ayrıldı" :
                           player.passiveReason === "transfer"   ? "Transfer Oldu" : "";

      const attPct = attendanceStats && attendanceStats.total > 0 ? Math.round((attendanceStats.geldi / attendanceStats.total) * 100) : null;

      const tacticalRows = userRole?.role !== "oyuncu" ? Object.entries({
        positioning: "Pozisyon Alma", passing: "Pas", crossing: "Orta", shooting: "Şut",
        dribbling: "Dribling", heading: "Kafa Vuruşu", tackling: "Top Kesme",
        marking: "Markaj", gameReading: "Oyun Okuma",
      }).map(([k, label]) => {
        const val = (player.tactical as unknown as Record<string, number>)[k] ?? 0;
        const c = val >= 8 ? "#22c55e" : val >= 6 ? "#f59e0b" : val >= 4 ? "#f97316" : "#ef4444";
        return `<tr><td style="padding:3px 6px;font-size:11px;color:#5a6170;width:120px;">${label}</td><td style="padding:3px 6px;"><div style="display:flex;align-items:center;gap:6px;"><div style="flex:1;height:5px;background:#e2e5e9;border-radius:3px;overflow:hidden;"><div style="height:100%;width:${val*10}%;background:${c};border-radius:3px;"></div></div><span style="font-size:11px;font-weight:700;color:#1a1a2e;min-width:14px;text-align:right;">${val}</span></div></td></tr>`;
      }).join("") : "";

      const athleticRows = userRole?.role !== "oyuncu" ? Object.entries({
        speed: "Hız", strength: "Güç", stamina: "Dayanıklılık", agility: "Çeviklik",
        jumping: "Sıçrama", balance: "Denge", flexibility: "Esneklik",
      }).map(([k, label]) => {
        const val = (player.athletic as unknown as Record<string, number>)[k] ?? 0;
        const c = val >= 8 ? "#22c55e" : val >= 6 ? "#f59e0b" : val >= 4 ? "#f97316" : "#ef4444";
        return `<tr><td style="padding:3px 6px;font-size:11px;color:#5a6170;width:120px;">${label}</td><td style="padding:3px 6px;"><div style="display:flex;align-items:center;gap:6px;"><div style="flex:1;height:5px;background:#e2e5e9;border-radius:3px;overflow:hidden;"><div style="height:100%;width:${val*10}%;background:${c};border-radius:3px;"></div></div><span style="font-size:11px;font-weight:700;color:#1a1a2e;min-width:14px;text-align:right;">${val}</span></div></td></tr>`;
      }).join("") : "";

      const prevTeamsHtml = player.previousTeams && player.previousTeams.length > 0
        ? player.previousTeams.map(pt => `<span style="font-size:10px;background:#f1f3f5;color:#5a6170;padding:2px 7px;border-radius:4px;margin-right:4px;">${pt.team} (${pt.years})</span>`).join("")
        : "<span style='font-size:10px;color:#8c919a;'>—</span>";

      const wrapper = document.createElement("div");
      wrapper.style.cssText = "background:#fff;width:800px;min-width:800px;padding:24px;font-family:sans-serif;";
      wrapper.innerHTML = `
        <!-- Header -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;padding-bottom:12px;border-bottom:2px solid #e2e5e9;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,#1a1a2e,#2d2d4e);display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:900;color:#fff;">${initials}</div>
            <div>
              <div style="font-size:18px;font-weight:900;color:${player.status === "passive" ? "#c4111d" : "#1a1a2e"};">
                ${player.firstName} ${player.lastName}
                ${player.status === "passive" ? `<span style="font-size:9px;background:#c4111d;color:#fff;padding:2px 7px;border-radius:4px;margin-left:6px;vertical-align:middle;">PASİF${passiveLabel ? " · " + passiveLabel : ""}</span>` : ""}
              </div>
              <div style="margin-top:3px;font-size:11px;color:#8c919a;">${player.position} · ${player.ageGroup} · ${age} yaş · ${player.foot} ayak</div>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:9px;font-weight:700;color:#c4111d;letter-spacing:2px;text-transform:uppercase;">BEYLERBEYİ AKADEMİ</div>
            <div style="font-size:10px;color:#8c919a;margin-top:2px;">Oyuncu Kartı · ${now}</div>
          </div>
        </div>

        <!-- 2 Sütun -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">

          <!-- SOL SÜTUN -->
          <div>
            <!-- Genel Bilgiler -->
            <div style="margin-bottom:12px;">
              <div style="font-size:9px;font-weight:700;color:#c4111d;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px;">Genel Bilgiler</div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px;">
                <div style="background:#f8f9fb;border:1px solid #e2e5e9;border-radius:8px;padding:7px 10px;">
                  <div style="font-size:9px;color:#8c919a;text-transform:uppercase;letter-spacing:0.5px;">Doğum Tarihi</div>
                  <div style="font-size:12px;font-weight:600;color:#1a1a2e;margin-top:2px;">${new Date(player.birthDate).toLocaleDateString("tr-TR")}</div>
                </div>
                <div style="background:#f8f9fb;border:1px solid #e2e5e9;border-radius:8px;padding:7px 10px;">
                  <div style="font-size:9px;color:#8c919a;text-transform:uppercase;letter-spacing:0.5px;">Boy / Kilo</div>
                  <div style="font-size:12px;font-weight:600;color:#1a1a2e;margin-top:2px;">${player.height} cm / ${player.weight} kg</div>
                </div>
              </div>
              ${(player.phone || player.parentPhone) ? `
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px;">
                ${player.phone ? `<div style="background:#f8f9fb;border:1px solid #e2e5e9;border-radius:8px;padding:7px 10px;"><div style="font-size:9px;color:#8c919a;">Telefon</div><div style="font-size:11px;font-weight:600;color:#1a1a2e;margin-top:2px;">${player.phone}</div></div>` : ""}
                ${player.parentPhone ? `<div style="background:#f8f9fb;border:1px solid #e2e5e9;border-radius:8px;padding:7px 10px;"><div style="font-size:9px;color:#8c919a;">Veli Telefonu</div><div style="font-size:11px;font-weight:600;color:#1a1a2e;margin-top:2px;">${player.parentPhone}</div></div>` : ""}
              </div>` : ""}
              <div style="background:#f8f9fb;border:1px solid #e2e5e9;border-radius:8px;padding:7px 10px;margin-bottom:6px;">
                <div style="font-size:9px;color:#8c919a;margin-bottom:4px;">Önceki Takımlar</div>
                <div>${prevTeamsHtml}</div>
              </div>
              ${player.notes ? `<div style="background:#f8f9fb;border:1px solid #e2e5e9;border-radius:8px;padding:7px 10px;"><div style="font-size:9px;color:#8c919a;margin-bottom:3px;">Notlar</div><div style="font-size:11px;color:#1a1a2e;line-height:1.4;">${player.notes}</div></div>` : ""}
            </div>

            <!-- Maç İstatistikleri -->
            <div style="margin-bottom:12px;">
              <div style="font-size:9px;font-weight:700;color:#c4111d;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px;">Maç İstatistikleri</div>
              <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-bottom:6px;">
                <div style="background:#1a1a2e;border-radius:8px;padding:8px;text-align:center;">
                  <div style="font-size:7px;color:rgba(255,255,255,0.5);text-transform:uppercase;">Maç</div>
                  <div style="font-size:20px;font-weight:900;color:#fff;">${seasonStats.matches}</div>
                </div>
                <div style="background:#f8f9fb;border:1px solid #e2e5e9;border-radius:8px;padding:8px;text-align:center;">
                  <div style="font-size:7px;color:#8c919a;text-transform:uppercase;">Dakika</div>
                  <div style="font-size:16px;font-weight:900;color:#1a1a2e;">${seasonStats.minutesPlayed}</div>
                </div>
                ${isGoalkeeper ? `
                <div style="background:#f8f9fb;border:1px solid #e2e5e9;border-radius:8px;padding:8px;text-align:center;">
                  <div style="font-size:7px;color:#8c919a;text-transform:uppercase;">Yenilen</div>
                  <div style="font-size:16px;font-weight:900;color:#ea580c;">${seasonStats.goalsConceded}</div>
                </div>
                <div style="background:#f8f9fb;border:1px solid #e2e5e9;border-radius:8px;padding:8px;text-align:center;">
                  <div style="font-size:7px;color:#8c919a;text-transform:uppercase;">Clean Sheet</div>
                  <div style="font-size:16px;font-weight:900;color:#16a34a;">${seasonStats.cleanSheets}</div>
                </div>` : `
                <div style="background:#f8f9fb;border:1px solid #e2e5e9;border-radius:8px;padding:8px;text-align:center;">
                  <div style="font-size:7px;color:#8c919a;text-transform:uppercase;">Gol</div>
                  <div style="font-size:16px;font-weight:900;color:#16a34a;">${seasonStats.goals}</div>
                </div>
                <div style="background:#f8f9fb;border:1px solid #e2e5e9;border-radius:8px;padding:8px;text-align:center;">
                  <div style="font-size:7px;color:#8c919a;text-transform:uppercase;">Asist</div>
                  <div style="font-size:16px;font-weight:900;color:#2563eb;">${seasonStats.assists}</div>
                </div>`}
              </div>
              <!-- Katılım -->
              <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:4px;margin-bottom:6px;">
                ${[
                  {label:"İlk 11",val:participationStats.ilk11,c:"#16a34a"},
                  {label:"Yedek",val:participationStats.yedek,c:"#2563eb"},
                  {label:"Süre Yok",val:participationStats.sureAlmadi,c:"#ca8a04"},
                  {label:"Kad. Yok",val:participationStats.kadroYok,c:"#8c919a"},
                  {label:"Sakat",val:participationStats.sakat,c:"#ea580c"},
                  {label:"Cezalı",val:participationStats.cezali,c:"#c4111d"},
                ].map(x=>`<div style="background:#f8f9fb;border:1px solid #e2e5e9;border-radius:6px;padding:5px 3px;text-align:center;"><div style="font-size:13px;font-weight:700;color:${x.c};">${x.val}</div><div style="font-size:8px;color:#8c919a;">${x.label}</div></div>`).join("")}
              </div>
              <!-- Kartlar -->
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;">
                <div style="background:#f8f9fb;border:1px solid #e2e5e9;border-radius:8px;padding:8px;display:flex;align-items:center;gap:8px;">
                  <div style="width:14px;height:18px;background:#fbbf24;border-radius:2px;"></div>
                  <div><div style="font-size:14px;font-weight:700;color:#1a1a2e;">${seasonStats.yellowCards}</div><div style="font-size:9px;color:#8c919a;">Sarı Kart</div></div>
                </div>
                <div style="background:#f8f9fb;border:1px solid #e2e5e9;border-radius:8px;padding:8px;display:flex;align-items:center;gap:8px;">
                  <div style="width:14px;height:18px;background:#ef4444;border-radius:2px;"></div>
                  <div><div style="font-size:14px;font-weight:700;color:#1a1a2e;">${seasonStats.redCards}</div><div style="font-size:9px;color:#8c919a;">Kırmızı Kart</div></div>
                </div>
              </div>
            </div>

            <!-- Antrenman Katılımı -->
            ${attendanceStats && attendanceStats.total > 0 ? `
            <div>
              <div style="font-size:9px;font-weight:700;color:#c4111d;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px;">Antrenman Katılımı</div>
              <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px;">
                ${[
                  {label:"Toplam",val:attendanceStats.total,c:"#1a1a2e"},
                  {label:"Geldi",val:attendanceStats.geldi,c:"#1b6e2a"},
                  {label:"Gelmedi",val:attendanceStats.gelmedi,c:"#c4111d"},
                  {label:"İzinli",val:attendanceStats.izinli,c:"#2563eb"},
                  {label:"Sakat",val:attendanceStats.sakat,c:"#d97706"},
                ].map(x=>`<div style="text-align:center;"><div style="background:${x.c};color:#fff;font-size:14px;font-weight:900;border-radius:6px;padding:4px 0;">${x.val}</div><div style="font-size:8px;color:#8c919a;margin-top:2px;">${x.label}</div></div>`).join("")}
              </div>
              <div style="font-size:10px;color:#8c919a;margin-top:4px;text-align:right;">%${attPct} katılım · ${activeSeason}</div>
            </div>` : ""}
          </div>

          <!-- SAĞ SÜTUN: Beceriler -->
          <div>
            ${userRole?.role !== "oyuncu" ? `
            <div style="margin-bottom:12px;">
              <div style="font-size:9px;font-weight:700;color:#c4111d;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px;">Taktik Beceriler</div>
              <table style="width:100%;border-collapse:collapse;">${tacticalRows}</table>
            </div>
            <div>
              <div style="font-size:9px;font-weight:700;color:#c4111d;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px;">Atletik Beceriler</div>
              <table style="width:100%;border-collapse:collapse;">${athleticRows}</table>
            </div>` : `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#8c919a;font-size:12px;">Beceri verileri gizlenmiştir.</div>`}
          </div>
        </div>

        <!-- Footer -->
        <div style="margin-top:14px;padding-top:8px;border-top:1px solid #e2e5e9;display:flex;justify-content:space-between;">
          <div style="font-size:9px;color:#9ca3af;">Beylerbeyi Akademi — Oyuncu Kartı</div>
          <div style="font-size:9px;color:#9ca3af;">${now}</div>
        </div>
      `;

      document.body.appendChild(wrapper);
      const canvas = await html2canvas(wrapper, { scale: 2, useCORS: true, backgroundColor: "#ffffff", logging: false });
      document.body.removeChild(wrapper);

      const imgW = canvas.width;
      const imgH = canvas.height;
      const orientation = imgW >= imgH ? "landscape" : "portrait";
      const pdf = new jsPDF({ orientation, unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const pdfImgW = pageW - margin * 2;
      const pdfImgH = imgH * (pdfImgW / imgW);
      const pageContentH = pageH - margin * 2;
      const totalPages = Math.ceil(pdfImgH / pageContentH);
      const imgData = canvas.toDataURL("image/png");
      for (let i = 0; i < totalPages; i++) {
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", margin, margin - i * pageContentH, pdfImgW, pdfImgH);
      }
      pdf.save(`${player.firstName}-${player.lastName}-kart.pdf`);
    } catch (e) {
      console.error("PDF oluşturulamadı:", e);
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#e2e5e9] animate-slide-in-up">
        {/* Renkli Header */}
        <div className={`relative bg-gradient-to-br ${gradFrom} ${gradTo} px-4 sm:px-6 py-3 sm:py-4 rounded-t-2xl`}>
          {/* Kapat butonu */}
          <button
            onClick={onClose}
            className="absolute top-2.5 right-2.5 p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white/70 hover:text-white z-10"
          >
            <X size={16} />
          </button>
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
          <button
            onClick={exportPDF}
            disabled={pdfLoading}
            className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-[#f1f3f5] text-[#1a1a2e] text-[11px] font-semibold rounded-lg transition-all border border-[#e2e5e9] shadow-sm disabled:opacity-50 ml-auto"
            title="PDF İndir"
          >
            {pdfLoading ? (
              <div className="w-3 h-3 border-2 border-[#e2e5e9] border-t-[#1a1a2e] rounded-full animate-spin" />
            ) : (
              <FileDown size={12} />
            )}
            <span>PDF</span>
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">

          {/* Genel Bilgiler */}
          <Section title="Genel Bilgiler">
            {player.status === "passive" && (
              <div className="flex items-center gap-2.5 bg-red-50 border border-[#c4111d]/20 rounded-xl px-4 py-3 mb-3">
                <span className="text-[9px] font-black uppercase tracking-wider bg-[#c4111d] text-white px-2 py-0.5 rounded shrink-0">PASİF</span>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-[#c4111d]">
                    {player.passiveReason === "gonderildi" ? "Gönderildi" :
                     player.passiveReason === "ayrildi"    ? "Ayrıldı" :
                     player.passiveReason === "transfer"   ? "Transfer Oldu" : "—"}
                  </span>
                  {player.passiveNote && (
                    <span className="text-xs text-[#c4111d]/70 ml-1.5">· {player.passiveNote}</span>
                  )}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <InfoBox label="Doğum Tarihi" value={new Date(player.birthDate).toLocaleDateString("tr-TR")} />
              <InfoBox label="Boy" value={`${player.height} cm`} />
              <InfoBox label="Kilo" value={`${player.weight} kg`} />
              <InfoBox label="Ayak" value={player.foot} />
            </div>
            <div className="grid grid-cols-1 gap-2 mt-2">
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
          <section>
            <div className="flex items-center justify-between mb-2">
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
            {/* Yaş Grubu Filtresi — sadece birden fazla yaş grubu varsa */}
            {availableAgeGroups.length > 1 && (
              <div className="flex items-center gap-1 mb-3 overflow-x-auto">
                <span className="text-[9px] font-semibold text-[#8c919a] uppercase tracking-wider shrink-0 mr-1">Yaş Grubu</span>
                <button
                  onClick={() => setSelectedAgeGroup("ALL")}
                  className={`px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all whitespace-nowrap ${
                    selectedAgeGroup === "ALL"
                      ? "bg-[#c4111d] text-white shadow-sm"
                      : "text-[#5a6170] bg-[#f1f3f5] hover:text-[#1a1a2e]"
                  }`}
                >
                  Tümü
                </button>
                {availableAgeGroups.map(ag => (
                  <button
                    key={ag}
                    onClick={() => setSelectedAgeGroup(ag)}
                    className={`px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all whitespace-nowrap ${
                      selectedAgeGroup === ag
                        ? "bg-[#c4111d] text-white shadow-sm"
                        : "text-[#5a6170] bg-[#f1f3f5] hover:text-[#1a1a2e]"
                    }`}
                  >
                    {ag}
                  </button>
                ))}
              </div>
            )}
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

          {/* Antrenman Katılım İstatistikleri */}
          {attendanceStats && attendanceStats.total > 0 && (
            <div className="bg-[#f8f9fb] rounded-xl p-3 border border-[#e2e5e9]">
              <p className="text-[11px] text-[#8c919a] font-semibold uppercase tracking-wider mb-2.5">
                Antrenman Katılımı · {activeSeason}
              </p>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { label: "Toplam", value: attendanceStats.total, color: "bg-[#1a1a2e] text-white" },
                  { label: "Geldi", value: attendanceStats.geldi, color: "bg-[#1b6e2a] text-white" },
                  { label: "Gelmedi", value: attendanceStats.gelmedi, color: "bg-[#c4111d] text-white" },
                  { label: "İzinli", value: attendanceStats.izinli, color: "bg-[#2563eb] text-white" },
                  { label: "Sakat", value: attendanceStats.sakat, color: "bg-[#d97706] text-white" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex flex-col items-center gap-0.5">
                    <span className={`w-full text-center text-base font-black rounded-lg py-1.5 ${color}`}>{value}</span>
                    <span className="text-[10px] text-[#8c919a] font-medium">{label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2.5">
                <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
                  {attendanceStats.geldi > 0 && <div className="bg-[#1b6e2a] rounded-full" style={{ width: `${(attendanceStats.geldi / attendanceStats.total) * 100}%` }} />}
                  {attendanceStats.gelmedi > 0 && <div className="bg-[#c4111d] rounded-full" style={{ width: `${(attendanceStats.gelmedi / attendanceStats.total) * 100}%` }} />}
                  {attendanceStats.izinli > 0 && <div className="bg-[#2563eb] rounded-full" style={{ width: `${(attendanceStats.izinli / attendanceStats.total) * 100}%` }} />}
                  {attendanceStats.sakat > 0 && <div className="bg-[#d97706] rounded-full" style={{ width: `${(attendanceStats.sakat / attendanceStats.total) * 100}%` }} />}
                </div>
                <p className="text-[10px] text-[#8c919a] mt-1 text-right">
                  %{Math.round((attendanceStats.geldi / attendanceStats.total) * 100)} katılım oranı
                </p>
              </div>
            </div>
          )}

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

