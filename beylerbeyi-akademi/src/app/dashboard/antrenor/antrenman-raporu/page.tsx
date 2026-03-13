"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Printer, CalendarDays, Users } from "lucide-react";
import { useAppData } from "@/lib/app-data";
import {
  fetchSchedulesForWeek,
  fetchDetailItemsByScheduleIds,
  fetchPlayersByAgeGroupAndSeason,
  fetchAttendanceByScheduleId,
} from "@/lib/supabase/trainingSchedule";
import {
  TrainingSchedule,
  TrainingDetailItem,
  AttendanceStatus,
  PlayerSummary,
} from "@/types/trainingSchedule";

// ─── helpers ─────────────────────────────────────────────────
const AGE_GROUP_ORDER = ["U19", "U17", "U16", "U15", "U14", "U13", "U12"];
const DAYS_TR = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
const DAYS_SHORT = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const MONTHS_TR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

const TYPE_LABEL: Record<string, string> = {
  normal: "Normal", izin: "İzin", mac: "Maç", ozel: "Özel",
};
const TYPE_BADGE: Record<string, string> = {
  normal: "bg-[#f1f5f9] text-[#334155]",
  izin:   "bg-[#d1fae5] text-[#065f46]",
  mac:    "bg-[#fee2e2] text-[#991b1b]",
  ozel:   "bg-[#fef3c7] text-[#92400e]",
};
const STATUS_CONFIG: Record<AttendanceStatus, { label: string; cell: string; text: string }> = {
  geldi:   { label: "Geldi",   cell: "bg-[#dcfce7]", text: "text-[#166534]" },
  gelmedi: { label: "Gelmedi", cell: "bg-[#fee2e2]", text: "text-[#991b1b] font-semibold" },
  izinli:  { label: "İzinli",  cell: "bg-[#dbeafe]", text: "text-[#1e40af]" },
  sakat:   { label: "Sakat",   cell: "bg-[#ffedd5]", text: "text-[#9a3412]" },
};

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  d.setHours(0, 0, 0, 0);
  return d;
}
function getWeekDates(ws: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(ws); d.setDate(d.getDate() + i); return d;
  });
}
function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function fmtShort(d: Date) {
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function fmtLong(d: Date) {
  return `${d.getDate()} ${MONTHS_TR[d.getMonth()]} ${d.getFullYear()}`;
}
function getISOWeek(d: Date) {
  const u = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = u.getUTCDay() || 7;
  u.setUTCDate(u.getUTCDate() + 4 - day);
  return Math.ceil(((u.getTime() - new Date(Date.UTC(u.getUTCFullYear(), 0, 1)).getTime()) / 86400000 + 1) / 7);
}
function dayIndex(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00").getDay();
  return d === 0 ? 6 : d - 1;
}

interface DayData {
  date: Date;
  schedule: TrainingSchedule;
  items: TrainingDetailItem[];
  attendance: Record<string, AttendanceStatus>;
}

// ─── sayfa ───────────────────────────────────────────────────
export default function AntrenmanRaporuPage() {
  const { lookups, userRole } = useAppData();

  const isYonetici  = userRole?.role === "yonetici";
  const myAgeGroup  = userRole?.age_group ?? null;

  const [weekStart, setWeekStart] = useState<Date>(() => getWeekStart(new Date()));
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("");
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState<DayData[]>([]);
  const [players, setPlayers] = useState<PlayerSummary[]>([]);

  const activeSeason = lookups.seasons.length > 0
    ? lookups.seasons[lookups.seasons.length - 1].value : "";

  // Yönetici tüm yaş gruplarını görür; antrenör yalnızca kendi grubunu
  const allAgeGroups = AGE_GROUP_ORDER.filter(ag => lookups.ageGroups.some(l => l.value === ag));
  const ageGroups = isYonetici ? allAgeGroups : allAgeGroups.filter(ag => ag === myAgeGroup);

  const weekDates = getWeekDates(weekStart);
  const weekNum   = getISOWeek(weekStart);

  useEffect(() => {
    if (!selectedAgeGroup && ageGroups.length > 0) setSelectedAgeGroup(ageGroups[0]);
  }, [ageGroups, selectedAgeGroup]);

  const load = useCallback(async () => {
    if (!activeSeason || !selectedAgeGroup) return;
    setLoading(true);
    try {
      const start = toISODate(weekStart);
      const end   = toISODate(weekDates[6]);
      const [schedules, playerList] = await Promise.all([
        fetchSchedulesForWeek(activeSeason, start, end),
        fetchPlayersByAgeGroupAndSeason(selectedAgeGroup, activeSeason),
      ]);
      const filtered = schedules
        .filter(s => s.age_group === selectedAgeGroup)
        .sort((a, b) => a.training_date.localeCompare(b.training_date));

      const ids = filtered.map(s => s.id);
      const allItems = ids.length ? await fetchDetailItemsByScheduleIds(ids) : [];
      const attLists = await Promise.all(filtered.map(s => fetchAttendanceByScheduleId(s.id)));

      const result: DayData[] = filtered.map((schedule, i) => {
        const date = weekDates.find(d => toISODate(d) === schedule.training_date) ?? weekDates[0];
        const items = allItems.filter(it => it.schedule_id === schedule.id);
        const attendance: Record<string, AttendanceStatus> = {};
        attLists[i].forEach(a => { attendance[a.player_id] = a.status; });
        return { date, schedule, items, attendance };
      });

      setDays(result);
      setPlayers(playerList);
    } catch (e) {
      console.error("Rapor yüklenemedi:", e);
    } finally {
      setLoading(false);
    }
  }, [weekStart, activeSeason, selectedAgeGroup]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  // Tablo 1: en fazla kaç detail item var?
  const maxItems = Math.max(0, ...days.map(d => d.items.length));

  return (
    <div className="space-y-5">

      {/* ── Filtre çubuğu (baskıda gizli) ──────────────────── */}
      <div className="rounded-2xl bg-white border border-[#e2e5e9] px-5 py-4 print:hidden">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5 mr-auto">
            <div className="w-9 h-9 rounded-lg bg-[#1b6e2a] flex items-center justify-center shrink-0">
              <CalendarDays size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-[#1a1a2e]">Antrenman Raporu</h1>
              <p className="text-[11px] text-[#6b7280]">{activeSeason} · {weekNum}. Hafta</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Users size={14} className="text-[#6b7280]" />
            {isYonetici ? (
              <select
                value={selectedAgeGroup}
                onChange={e => setSelectedAgeGroup(e.target.value)}
                className="text-sm font-medium border border-[#e5e7eb] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1b6e2a]/20 focus:border-[#1b6e2a]"
              >
                {ageGroups.map(ag => <option key={ag} value={ag}>{ag}</option>)}
              </select>
            ) : (
              <span className="text-sm font-bold text-[#1a1a2e] px-3 py-1.5 bg-[#f1f5f9] rounded-lg border border-[#e5e7eb]">
                {selectedAgeGroup}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => setWeekStart(p => { const d = new Date(p); d.setDate(d.getDate()-7); return d; })}
              className="p-1.5 rounded-lg border border-[#e5e7eb] hover:bg-[#f9fafb] text-[#6b7280]">
              <ChevronLeft size={15} />
            </button>
            <span className="px-2 text-xs font-medium text-[#6b7280]">
              {fmtShort(weekDates[0])} – {fmtShort(weekDates[6])}
            </span>
            <button onClick={() => setWeekStart(p => { const d = new Date(p); d.setDate(d.getDate()+7); return d; })}
              className="p-1.5 rounded-lg border border-[#e5e7eb] hover:bg-[#f9fafb] text-[#6b7280]">
              <ChevronRight size={15} />
            </button>
            <button onClick={() => setWeekStart(getWeekStart(new Date()))}
              className="px-2 py-1.5 rounded-lg border border-[#e5e7eb] text-[10px] font-medium text-[#6b7280] hover:bg-[#f9fafb]">
              Bu hafta
            </button>
          </div>

          <button onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1a2e] text-white text-xs font-semibold hover:bg-[#2d2d4e] transition-colors">
            <Printer size={13} /> Yazdır / PDF
          </button>
        </div>
      </div>

      {/* ── Rapor gövdesi ───────────────────────────────────── */}
      {loading ? (
        <div className="rounded-2xl bg-white border border-[#e2e5e9] flex items-center justify-center py-16">
          <div className="flex items-center gap-3 text-[#6b7280]">
            <div className="w-5 h-5 border-2 border-[#1b6e2a] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Yükleniyor…</span>
          </div>
        </div>
      ) : days.length === 0 ? (
        <div className="rounded-2xl bg-white border border-[#e2e5e9] flex items-center justify-center py-16 text-sm text-[#9aa3af]">
          Bu hafta {selectedAgeGroup} için kayıtlı program bulunamadı
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-[#e2e5e9] overflow-hidden space-y-0">

          {/* Rapor başlık (baskıda görünür) */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-[#e2e5e9]">
            <Image src="/Logo_S.png" alt="Beylerbeyi" width={32} height={32} className="object-contain" />
            <div>
              <h2 className="text-sm font-black text-[#1a1a2e]">
                Beylerbeyi Akademi · {selectedAgeGroup} Antrenman Raporu
              </h2>
              <p className="text-[11px] text-[#6b7280]">
                {fmtLong(weekDates[0])} – {fmtLong(weekDates[6])} · {activeSeason} · {weekNum}. Hafta
              </p>
            </div>
          </div>

          {/* ── TABLO 1: Antrenman Detayı ─────────────────── */}
          <div className="px-6 pt-5 pb-4">
            <h3 className="text-xs font-bold text-[#6b7280] uppercase tracking-widest mb-3">
              Antrenman Detayı
            </h3>
            <div className="overflow-x-auto rounded-xl border border-[#e2e5e9]">
              <table className="w-full border-collapse table-fixed" style={{ minWidth: days.length * 140 + 120 }}>
                <colgroup>
                  <col style={{ width: 36 }} />
                  {days.map((_, i) => <col key={i} />)}
                </colgroup>
                <thead>
                  <tr className="bg-[#1b6e2a]">
                    {/* boş köşe */}
                    <th className="px-2 py-3 border-r border-white/20" />
                    {days.map(day => (
                      <th key={day.schedule.id} className="px-3 py-3 text-center border-r last:border-r-0 border-white/20">
                        <div className="text-[11px] font-extrabold uppercase tracking-wide text-white">
                          {DAYS_SHORT[dayIndex(day.schedule.training_date)]}
                        </div>
                        <div className="text-[12px] font-semibold text-white mt-0.5">
                          {fmtShort(day.date)}
                        </div>
                      </th>
                    ))}
                  </tr>
                  {/* Program tipi + saat satırı */}
                  <tr className="bg-[#f8f9fb] border-b border-[#e2e5e9]">
                    <td className="px-2 py-2 border-r border-[#e2e5e9] text-[9px] font-bold text-[#9aa3af] uppercase text-center">Tip</td>
                    {days.map(day => (
                      <td key={day.schedule.id} className="px-3 py-2 text-center border-r last:border-r-0 border-[#e2e5e9]">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${TYPE_BADGE[day.schedule.schedule_type]}`}>
                          {TYPE_LABEL[day.schedule.schedule_type]}
                        </span>
                        {day.schedule.training_time && (
                          <div className="text-[11px] font-bold text-[#1a1a2e] mt-0.5">{day.schedule.training_time}</div>
                        )}
                        {day.schedule.cell_label && (
                          <div className="text-[10px] text-[#6b7280] mt-0.5 leading-tight">{day.schedule.cell_label}</div>
                        )}
                      </td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {maxItems === 0 ? (
                    <tr>
                      <td colSpan={days.length + 1} className="px-4 py-5 text-center text-xs text-[#9aa3af]">
                        Antrenman içeriği girilmemiş
                      </td>
                    </tr>
                  ) : (
                    Array.from({ length: maxItems }, (_, rowIdx) => (
                      <tr key={rowIdx} className={rowIdx % 2 === 0 ? "bg-white" : "bg-[#f9fafb]"}>
                        <td className="px-2 py-2.5 border-r border-b border-[#e2e5e9] text-center">
                          <span className="text-[10px] font-bold text-[#9aa3af]">{rowIdx + 1}</span>
                        </td>
                        {days.map(day => (
                          <td key={day.schedule.id} className="px-3 py-2.5 border-r last:border-r-0 border-b border-[#e2e5e9]">
                            <span className="text-xs text-[#1a1a2e] leading-snug">
                              {day.items[rowIdx]?.content ?? ""}
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── TABLO 2: Yoklama ─────────────────────────── */}
          <div className="px-6 pt-2 pb-6">
            <h3 className="text-xs font-bold text-[#6b7280] uppercase tracking-widest mb-3">
              Oyuncu Yoklaması
            </h3>
            <div className="overflow-x-auto rounded-xl border border-[#e2e5e9]">
              <table className="w-full border-collapse table-fixed" style={{ minWidth: days.length * 110 + 200 }}>
                <colgroup>
                  <col style={{ width: 32 }} />
                  <col style={{ width: 160 }} />
                  {days.map((_, i) => <col key={i} />)}
                </colgroup>
                <thead>
                  <tr className="bg-[#c4111d]">
                    <th className="px-2 py-3 border-r border-white/20 text-[10px] font-bold text-white text-center">#</th>
                    <th className="px-3 py-3 text-left border-r border-white/20 text-[11px] font-bold text-white uppercase tracking-wide">
                      Oyuncu
                    </th>
                    {days.map(day => (
                      <th key={day.schedule.id} className="px-2 py-3 text-center border-r last:border-r-0 border-white/20">
                        <div className="text-[11px] font-extrabold uppercase tracking-wide text-white">
                          {DAYS_SHORT[dayIndex(day.schedule.training_date)]}
                        </div>
                        <div className="text-[12px] font-semibold text-white mt-0.5">
                          {fmtShort(day.date)}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {players.length === 0 ? (
                    <tr>
                      <td colSpan={days.length + 2} className="px-4 py-5 text-center text-xs text-[#9aa3af]">
                        Kayıtlı oyuncu bulunamadı
                      </td>
                    </tr>
                  ) : (
                    players.map((player, rowIdx) => {
                      const isAnyAbsent = days.some(d => d.attendance[player.id] === "gelmedi");
                      return (
                        <tr key={player.id} className={rowIdx % 2 === 0 ? "bg-white" : "bg-[#f9fafb]"}>
                          <td className="px-2 py-2.5 border-r border-b border-[#e2e5e9] text-center">
                            <span className="text-[10px] font-bold text-[#9aa3af]">{player.jersey_number}</span>
                          </td>
                          <td className={`px-3 py-2.5 border-r border-b border-[#e2e5e9] text-xs font-medium ${isAnyAbsent ? "text-[#991b1b]" : "text-[#1a1a2e]"}`}>
                            {player.first_name} {player.last_name}
                          </td>
                          {days.map(day => {
                            const status = day.attendance[player.id] as AttendanceStatus | undefined;
                            const cfg = status ? STATUS_CONFIG[status] : null;
                            const isAbsent = status === "gelmedi";
                            return (
                              <td
                                key={day.schedule.id}
                                className={`px-2 py-2.5 border-r last:border-r-0 border-b border-[#e2e5e9] text-center ${isAbsent ? "bg-[#fee2e2]" : cfg ? cfg.cell : ""}`}
                              >
                                {cfg ? (
                                  <span className={`text-[10px] font-semibold ${cfg.text}`}>
                                    {cfg.label}
                                  </span>
                                ) : (
                                  <span className="text-[#d1d5db] text-[10px]">—</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {/* Özet satır */}
                {players.length > 0 && (
                  <tfoot>
                    <tr className="bg-[#f1f5f9] border-t-2 border-[#e2e5e9]">
                      <td colSpan={2} className="px-3 py-2 text-[10px] font-bold text-[#6b7280] uppercase tracking-wide border-r border-[#e2e5e9]">
                        Özet
                      </td>
                      {days.map(day => {
                        const total = players.length;
                        const came   = players.filter(p => day.attendance[p.id] === "geldi").length;
                        const absent = players.filter(p => day.attendance[p.id] === "gelmedi").length;
                        const hasData = Object.keys(day.attendance).length > 0;
                        return (
                          <td key={day.schedule.id} className="px-2 py-2 text-center border-r last:border-r-0 border-[#e2e5e9]">
                            {hasData ? (
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="text-[10px] font-bold text-[#166534]">✓ {came}/{total}</span>
                                {absent > 0 && <span className="text-[10px] font-bold text-[#991b1b]">✗ {absent}</span>}
                              </div>
                            ) : (
                              <span className="text-[#d1d5db] text-[10px]">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* Alt bilgi */}
          <div className="px-6 py-3 border-t border-[#f0f1f3] bg-[#f8f9fb]">
            <p className="text-[10px] text-[#9aa3af] text-right">
              Beylerbeyi Akademi · {selectedAgeGroup} · {activeSeason} · {new Date().toLocaleDateString("tr-TR")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
