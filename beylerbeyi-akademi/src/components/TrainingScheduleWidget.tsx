"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useAppData } from "@/lib/app-data";
import { fetchSchedulesForWeek, fetchTrainingWeekNumber, fetchNormalSessionsUpTo, fetchSessionOffsets } from "@/lib/supabase/trainingSchedule";
import { TrainingSchedule, ScheduleType } from "@/types/trainingSchedule";

// ─── helpers ────────────────────────────────────────────────
const AGE_GROUP_ORDER = ["U19", "U17", "U16", "U15", "U14", "U13", "U12"];
const DAYS_TR = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  d.setHours(0, 0, 0, 0);
  return d;
}
function getWeekDates(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}
function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function fmtDate(d: Date) {
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function scheduleKey(ag: string, date: string) { return `${ag}__${date}`; }

function buildSessionCountMap(
  sessions: Array<{ age_group: string; training_date: string }>,
  offsets: Record<string, number> = {}
): Record<string, number> {
  const countByGroup: Record<string, number> = {};
  const map: Record<string, number> = {};
  sessions.forEach(s => {
    countByGroup[s.age_group] = (countByGroup[s.age_group] ?? 0) + 1;
    map[scheduleKey(s.age_group, s.training_date)] =
      countByGroup[s.age_group] + (offsets[s.age_group] ?? 0);
  });
  return map;
}

function cellStyle(type: ScheduleType): string {
  switch (type) {
    case "izin":  return "bg-[#d1fae5] text-[#065f46] border border-[#6ee7b7]";
    case "mac":   return "bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5]";
    case "ozel":  return "bg-[#fef3c7] text-[#92400e] border border-[#fcd34d]";
    default:      return "bg-white text-[#1e293b] border border-[#94a3b8]";
  }
}

function cellText(s: TrainingSchedule): { time: string | null; label: string | null } {
  switch (s.schedule_type) {
    case "izin": return { time: null, label: s.cell_label ?? "İZİN" };
    case "mac":  return { time: s.training_time ?? null, label: s.cell_label ?? "MAÇ" };
    case "ozel": return { time: s.training_time ?? null, label: s.cell_label ?? "ÖZEL" };
    default:     return { time: s.training_time ?? null, label: s.cell_label ?? null };
  }
}

// ─── bileşen ────────────────────────────────────────────────
export default function TrainingScheduleWidget() {
  const { lookups } = useAppData();

  const [weekStart, setWeekStart] = useState<Date>(() => getWeekStart(new Date()));
  const [schedules, setSchedules] = useState<Record<string, TrainingSchedule>>({});
  const [sessionCounts, setSessionCounts] = useState<Record<string, number>>({});
  const [trainingWeekNum, setTrainingWeekNum] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const activeSeason = lookups.seasons.length > 0
    ? lookups.seasons[lookups.seasons.length - 1].value
    : "";

  const ageGroups = AGE_GROUP_ORDER.filter(ag =>
    lookups.ageGroups.some(l => l.value === ag)
  );
  const weekDates = getWeekDates(weekStart);
  const weekNumber = getISOWeekNumber(weekStart);

  const load = useCallback(async (start: Date, season: string) => {
    if (!season) return;
    setLoading(true);
    try {
      const startStr = toISODate(start);
      const endDate = new Date(start);
      endDate.setDate(endDate.getDate() + 6);
      const endStr = toISODate(endDate);

      const [rows, weekCfg, normalSessions, offsets] = await Promise.all([
        fetchSchedulesForWeek(season, startStr, endStr),
        fetchTrainingWeekNumber(season, startStr),
        fetchNormalSessionsUpTo(season, endStr),
        fetchSessionOffsets(season),
      ]);

      const map: Record<string, TrainingSchedule> = {};
      rows.forEach(r => { map[scheduleKey(r.age_group, r.training_date)] = r; });
      setSchedules(map);
      setTrainingWeekNum(weekCfg);
      setSessionCounts(buildSessionCountMap(normalSessions, offsets));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeSeason) load(weekStart, activeSeason);
  }, [weekStart, activeSeason, load]);

  return (
    <div className="rounded-2xl bg-white border border-[#e2e5e9] overflow-hidden">

      {/* Başlık */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#e2e5e9]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1b6e2a] flex items-center justify-center shrink-0">
            <CalendarDays size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#1a1a2e]">Haftalık Antrenman Programı</h2>
            <p className="text-[11px] text-[#6b7280]">
              {trainingWeekNum ? `${trainingWeekNum}. Antrenman Haftası` : `${weekNumber}. Takvim Haftası`}
              {activeSeason && <span className="ml-1.5 text-[#9ca3af]">· {activeSeason}</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setWeekStart(prev => { const d = new Date(prev); d.setDate(d.getDate() - 7); return d; })}
            className="p-1.5 rounded-lg border border-[#e5e7eb] hover:bg-[#f9fafb] text-[#6b7280] transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => setWeekStart(getWeekStart(new Date()))}
            className="px-2 py-1 rounded-lg border border-[#e5e7eb] text-[10px] font-medium text-[#6b7280] hover:bg-[#f9fafb] transition-colors"
          >
            Bu hafta
          </button>
          <button
            onClick={() => setWeekStart(prev => { const d = new Date(prev); d.setDate(d.getDate() + 7); return d; })}
            className="p-1.5 rounded-lg border border-[#e5e7eb] hover:bg-[#f9fafb] text-[#6b7280] transition-colors"
          >
            <ChevronRight size={14} />
          </button>

        </div>
      </div>

      {/* Tablo */}
      <div className="overflow-x-auto">
        <table className="border-collapse table-fixed" style={{ width: "100%", minWidth: 560 }}>
          <colgroup>
            <col style={{ width: 56 }} />
            <col style={{ width: "calc((100% - 56px) / 7)" }} />
            <col style={{ width: "calc((100% - 56px) / 7)" }} />
            <col style={{ width: "calc((100% - 56px) / 7)" }} />
            <col style={{ width: "calc((100% - 56px) / 7)" }} />
            <col style={{ width: "calc((100% - 56px) / 7)" }} />
            <col style={{ width: "calc((100% - 56px) / 7)" }} />
            <col style={{ width: "calc((100% - 56px) / 7)" }} />
          </colgroup>
          <thead>
            <tr className="bg-[#1b6e2a]">
              {/* Logo */}
              <th className="sticky left-0 z-10 px-2 py-2.5 border-r border-white/20 bg-[#1b6e2a]">
                <div className="flex flex-col items-center gap-0.5">
                  <Image src="/Logo_S.png" alt="Beylerbeyi" width={24} height={24} className="object-contain" />
                  <span className="text-[7px] font-bold uppercase tracking-wider text-white/60">Yaş</span>
                </div>
              </th>
              {weekDates.map((d, i) => (
                <th key={i} className="py-2.5 text-center border-r last:border-r-0 border-white/20 overflow-hidden">
                  <div className="text-[10px] font-extrabold uppercase tracking-wide text-white leading-tight">{DAYS_TR[i]}</div>
                  <div className="text-[11px] font-semibold text-white leading-tight mt-0.5">{fmtDate(d)}</div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2 text-[#6b7280]">
                    <div className="w-4 h-4 border-2 border-[#1b6e2a] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs">Yükleniyor…</span>
                  </div>
                </td>
              </tr>
            ) : ageGroups.map((ageGroup, rowIdx) => (
              <tr key={ageGroup} className={rowIdx % 2 === 0 ? "bg-white" : "bg-[#f9fafb]"}>

                {/* Yaş grubu — sticky */}
                <td className="sticky left-0 z-10 px-1 py-1.5 border-r border-b border-[#e5e7eb] bg-[#c4111d]">
                  <span className="flex items-center justify-center text-xs font-black text-white">{ageGroup}</span>
                </td>

                {weekDates.map((date, dayIdx) => {
                  const dateStr = toISODate(date);
                  const s = schedules[scheduleKey(ageGroup, dateStr)];
                  const sessionNum = s?.schedule_type === "normal"
                    ? sessionCounts[scheduleKey(ageGroup, dateStr)]
                    : null;
                  return (
                    <td key={dayIdx} className="p-1 border-r last:border-r-0 border-b border-[#e5e7eb]">
                      <div className={`w-full min-h-[44px] rounded-lg px-1 py-1 flex flex-col items-center justify-center text-center ${
                        s ? cellStyle(s.schedule_type) : "bg-[#f1f5f9] border border-[#e2e8f0]"
                      }`}>
                        {s ? (() => {
                          const { time, label } = cellText(s);
                          return (
                            <>
                              {time && <span className="text-[11px] font-black leading-tight">{time}</span>}
                              {label && <span className={`leading-snug font-semibold ${time ? "text-[8px] opacity-80" : "text-[10px]"}`}>{label}</span>}
                              {sessionNum && (
                                <span className="text-[9px] font-normal text-[#64748b] leading-none mt-0.5">
                                  {sessionNum}.
                                </span>
                              )}
                            </>
                          );
                        })() : null}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
