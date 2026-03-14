"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Trash2,
  Clock,
  CalendarDays,
  Save,
  GripVertical,
  AlertCircle,
  MousePointerClick,
  CheckSquare,
  Pencil,
  Check,
} from "lucide-react";
import { useAppData } from "@/lib/app-data";
import { getPositionAbbr, getPositionColors, comparePositions } from "@/lib/positions";
import {
  fetchSchedulesForWeek,
  fetchDetailItemsByScheduleIds,
  upsertSchedule,
  replaceDetailItems,
  deleteSchedule,
  fetchTrainingWeekNumber,
  upsertTrainingWeekNumber,
  fetchNormalSessionsUpTo,
  fetchSessionOffsets,
  fetchPlayersByAgeGroupAndSeason,
  fetchAttendanceByScheduleId,
  upsertAttendance,
  deleteAttendance,
} from "@/lib/supabase/trainingSchedule";
import {
  TrainingSchedule,
  TrainingDetailItem,
  ScheduleType,
  AttendanceStatus,
  PlayerSummary,
} from "@/types/trainingSchedule";

// ─────────────────────────────────────────────────────────────
// Sabit veriler
// ─────────────────────────────────────────────────────────────

const AGE_GROUP_ORDER = ["U19", "U17", "U16", "U15", "U14", "U13", "U12"];

const DAYS_TR = ["PAZARTESİ", "SALI", "ÇARŞAMBA", "PERŞEMBE", "CUMA", "CUMARTESİ", "PAZAR"];

const SCHEDULE_TYPE_LABELS: Record<ScheduleType, string> = {
  normal: "Normal Antrenman",
  izin: "İzin",
  mac: "Maç",
  ozel: "Özel",
};

// ─────────────────────────────────────────────────────────────
// Yardımcı fonksiyonlar
// ─────────────────────────────────────────────────────────────

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Pazar, 1=Pazartesi...
  const diff = day === 0 ? -6 : 1 - day; // Pazartesi'ye git
  d.setDate(d.getDate() + diff);
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
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function toISODate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDisplayDate(date: Date): string {
  return `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}.${date.getFullYear()}`;
}

function formatDisplayDateLong(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const months = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function scheduleKey(ageGroup: string, dateStr: string): string {
  return `${ageGroup}__${dateStr}`;
}

// ─────────────────────────────────────────────────────────────
// Tip tanımları (sadece bu dosyada kullanılıyor)
// ─────────────────────────────────────────────────────────────

interface CellForm {
  schedule_type: ScheduleType;
  training_time: string;
  cell_label: string;
  items: string[];
}

const DEFAULT_FORM: CellForm = {
  schedule_type: "normal",
  training_time: "",
  cell_label: "",
  items: [],
};

// ─────────────────────────────────────────────────────────────
// Hücre renk/stil yardımcısı
// ─────────────────────────────────────────────────────────────

function getCellStyle(type: ScheduleType): string {
  switch (type) {
    case "izin":
      return "bg-[#d1fae5] text-[#065f46] border border-[#6ee7b7]";
    case "mac":
      return "bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5]";
    case "ozel":
      return "bg-[#fef3c7] text-[#92400e] border border-[#fcd34d]";
    default:
      return "bg-white text-[#1e293b] border border-[#94a3b8] hover:bg-[#f8fafc]";
  }
}

function getCellContent(schedule: TrainingSchedule): { time: string | null; label: string | null } {
  switch (schedule.schedule_type) {
    case "izin":
      return { time: null, label: "İZİN" };
    case "mac":
      return { time: schedule.training_time ?? null, label: schedule.cell_label ?? "LİG MAÇI" };
    case "ozel":
      return { time: schedule.training_time ?? null, label: schedule.cell_label ?? "ÖZEL" };
    default:
      return { time: schedule.training_time ?? null, label: schedule.cell_label ?? null };
  }
}

/** Normal antrenmanları sıra numarasına çevirir: key → N */
function buildSessionCountMap(
  sessions: Array<{ age_group: string; training_date: string }>,
  offsets: Record<string, number> = {}
): Record<string, number> {
  const counters: Record<string, number> = {};
  const result: Record<string, number> = {};
  for (const s of sessions) {
    counters[s.age_group] = (counters[s.age_group] ?? 0) + 1;
    result[scheduleKey(s.age_group, s.training_date)] =
      counters[s.age_group] + (offsets[s.age_group] ?? 0);
  }
  return result;
}

// ─────────────────────────────────────────────────────────────
// Ana sayfa bileşeni
// ─────────────────────────────────────────────────────────────

export default function AntrenmanProgramiPage() {
  const { userRole, lookups } = useAppData();

  // Aktif sezon — lookups yüklenince en son sezonu varsayılan yap
  const [activeSeason, setActiveSeason] = useState<string>("");

  // lookups.seasons gelince aktif sezonu otomatik seç
  useEffect(() => {
    if (lookups.seasons.length > 0 && !activeSeason) {
      setActiveSeason(lookups.seasons[lookups.seasons.length - 1].value);
    }
  }, [lookups.seasons, activeSeason]);

  // Haftanın başlangıç günü (Pazartesi)
  const [weekStart, setWeekStart] = useState<Date>(() => getWeekStart(new Date()));

  // Programlar: key → TrainingSchedule
  const [schedules, setSchedules] = useState<Record<string, TrainingSchedule>>({});
  // Detay kalemleri: schedule_id → items
  const [detailItems, setDetailItems] = useState<Record<string, TrainingDetailItem[]>>({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tekli modal
  const [selectedCell, setSelectedCell] = useState<{ age_group: string; date: string } | null>(null);
  const [form, setForm] = useState<CellForm>(DEFAULT_FORM);
  const [existingScheduleId, setExistingScheduleId] = useState<string | null>(null);

  // Çoklu seçim
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [multiSelected, setMultiSelected] = useState<Set<string>>(new Set());
  const [multiModalOpen, setMultiModalOpen] = useState(false);

  // Antrenman haftası numarası
  const [trainingWeekNumber, setTrainingWeekNumber] = useState<number | null>(null);
  const [editingWeekNum, setEditingWeekNum] = useState(false);
  const [tempWeekNum, setTempWeekNum] = useState("");

  // Antrenman sıra sayaçları: scheduleKey → N
  const [sessionCounts, setSessionCounts] = useState<Record<string, number>>({});

  // Yaş grupları (lookup'tan)
  const ageGroups = AGE_GROUP_ORDER.filter((ag) =>
    lookups.ageGroups.some((l) => l.value === ag)
  );

  const weekDates = getWeekDates(weekStart);
  const weekNumber = getISOWeekNumber(weekStart);

  // ── Veri yükleme ─────────────────────────────────────────
  const loadWeekData = useCallback(async (start: Date, season: string) => {
    if (!season) return;
    setLoading(true);
    setError(null);
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

      // Haftalık program map'i
      const map: Record<string, TrainingSchedule> = {};
      rows.forEach((r) => { map[scheduleKey(r.age_group, r.training_date)] = r; });
      setSchedules(map);

      // Detay kalemlerini yükle
      const ids = rows.map((r) => r.id);
      if (ids.length > 0) {
        const items = await fetchDetailItemsByScheduleIds(ids);
        const itemsMap: Record<string, TrainingDetailItem[]> = {};
        items.forEach((item) => {
          if (!itemsMap[item.schedule_id]) itemsMap[item.schedule_id] = [];
          itemsMap[item.schedule_id].push(item);
        });
        setDetailItems(itemsMap);
      } else {
        setDetailItems({});
      }

      // Antrenman haftası numarası
      setTrainingWeekNumber(weekCfg);
      setEditingWeekNum(false);

      // Antrenman sıra sayaçları
      setSessionCounts(buildSessionCountMap(normalSessions, offsets));
    } catch (e) {
      setError("Program verisi yüklenirken hata oluştu.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeSeason) loadWeekData(weekStart, activeSeason);
  }, [weekStart, activeSeason, loadWeekData]);

  // ── Hafta navigasyonu ────────────────────────────────────
  function navigateWeek(delta: number) {
    setWeekStart((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + delta * 7);
      return next;
    });
  }

  // ── Antrenman haftası numarası kaydet ───────────────────
  async function saveTrainingWeekNumber() {
    const n = parseInt(tempWeekNum, 10);
    if (isNaN(n) || n < 1) return;
    try {
      await upsertTrainingWeekNumber(activeSeason, toISODate(weekStart), n);
      setTrainingWeekNumber(n);
      setEditingWeekNum(false);
    } catch (e) {
      console.error(e);
    }
  }

  // ── Hücre tıklama ────────────────────────────────────────
  function openCell(ageGroup: string, dateStr: string) {
    // Çoklu seçim modundaysa hücreyi seç/kaldır
    if (multiSelectMode) {
      if (!canEdit(ageGroup)) return;
      const key = scheduleKey(ageGroup, dateStr);
      setMultiSelected((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
      return;
    }

    // Tekli mod
    const existing = schedules[scheduleKey(ageGroup, dateStr)];
    setSelectedCell({ age_group: ageGroup, date: dateStr });
    setExistingScheduleId(existing?.id ?? null);

    if (existing) {
      const existingItems = detailItems[existing.id] ?? [];
      setForm({
        schedule_type: existing.schedule_type,
        training_time: existing.training_time ?? "",
        cell_label: existing.cell_label ?? "",
        items: existingItems.map((i) => i.content),
      });
    } else {
      setForm(DEFAULT_FORM);
    }
  }

  function closeModal() {
    setSelectedCell(null);
    setMultiModalOpen(false);
    setForm(DEFAULT_FORM);
    setExistingScheduleId(null);
  }

  // ── Çoklu seçim modunu aç/kapat ─────────────────────────
  function toggleMultiSelectMode() {
    setMultiSelectMode((v) => !v);
    setMultiSelected(new Set());
    setMultiModalOpen(false);
  }

  function openMultiModal() {
    setForm(DEFAULT_FORM);
    setMultiModalOpen(true);
  }

  // ── Tek hücre kaydetme ───────────────────────────────────
  async function handleSave() {
    if (!selectedCell) return;
    setSaving(true);
    setError(null);
    try {
      const saved = await upsertSchedule({
        season: activeSeason,
        age_group: selectedCell.age_group,
        training_date: selectedCell.date,
        schedule_type: form.schedule_type,
        training_time: form.schedule_type !== "izin" ? form.training_time || null : null,
        cell_label: form.cell_label || null,
      });

      const itemsToSave = form.schedule_type === "normal" ? form.items : [];
      const savedItems = await replaceDetailItems(saved.id, itemsToSave);

      setSchedules((prev) => ({
        ...prev,
        [scheduleKey(saved.age_group, saved.training_date)]: saved,
      }));
      setDetailItems((prev) => ({ ...prev, [saved.id]: savedItems }));

      // Sayaçları yenile
      const endStr = toISODate(weekDates[6]);
      const [normalSessions, offsets] = await Promise.all([
        fetchNormalSessionsUpTo(activeSeason, endStr),
        fetchSessionOffsets(activeSeason),
      ]);
      setSessionCounts(buildSessionCountMap(normalSessions, offsets));

      closeModal();
    } catch (e) {
      setError("Kaydetme sırasında hata oluştu.");
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  // ── Çoklu hücre kaydetme ─────────────────────────────────
  async function handleMultiSave() {
    if (multiSelected.size === 0) return;
    setSaving(true);
    setError(null);
    try {
      const cells = Array.from(multiSelected).map((key) => {
        const [age_group, date] = key.split("__");
        return { age_group, date };
      });

      const results = await Promise.all(
        cells.map((cell) =>
          upsertSchedule({
            season: activeSeason,
            age_group: cell.age_group,
            training_date: cell.date,
            schedule_type: form.schedule_type,
            training_time: form.schedule_type !== "izin" ? form.training_time || null : null,
            cell_label: form.cell_label || null,
          })
        )
      );

      const itemsToSave = form.schedule_type === "normal" ? form.items : [];
      const itemResults = await Promise.all(
        results.map((saved) => replaceDetailItems(saved.id, itemsToSave))
      );

      setSchedules((prev) => {
        const next = { ...prev };
        results.forEach((saved) => {
          next[scheduleKey(saved.age_group, saved.training_date)] = saved;
        });
        return next;
      });
      setDetailItems((prev) => {
        const next = { ...prev };
        results.forEach((saved, i) => { next[saved.id] = itemResults[i]; });
        return next;
      });

      // Sayaçları yenile
      const endStr = toISODate(weekDates[6]);
      const [normalSessions, offsets] = await Promise.all([
        fetchNormalSessionsUpTo(activeSeason, endStr),
        fetchSessionOffsets(activeSeason),
      ]);
      setSessionCounts(buildSessionCountMap(normalSessions, offsets));

      // Seçimi temizle ama mod açık kalsın
      setMultiSelected(new Set());
      closeModal();
    } catch (e) {
      setError("Kaydetme sırasında hata oluştu.");
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  // ── Silme ────────────────────────────────────────────────
  async function handleDelete() {
    if (!existingScheduleId || !selectedCell) return;
    setSaving(true);
    setError(null);
    try {
      await deleteSchedule(existingScheduleId);
      const key = scheduleKey(selectedCell.age_group, selectedCell.date);
      setSchedules((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setDetailItems((prev) => {
        const next = { ...prev };
        delete next[existingScheduleId];
        return next;
      });
      closeModal();
    } catch (e) {
      setError("Silme sırasında hata oluştu.");
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  // ── Düzenleme izni ───────────────────────────────────────
  function canEdit(ageGroup: string): boolean {
    if (!userRole) return false;
    if (userRole.role === "yonetici") return true;
    if (userRole.role === "antrenor") return userRole.age_group === ageGroup;
    return false;
  }

  // ── Exercise items yönetimi ──────────────────────────────
  function addItem() {
    setForm((f) => ({ ...f, items: [...f.items, ""] }));
  }

  function updateItem(idx: number, value: string) {
    setForm((f) => {
      const items = [...f.items];
      items[idx] = value;
      return { ...f, items };
    });
  }

  function removeItem(idx: number) {
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  }

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-3">

      {/* ── Üst başlık kartı ─────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">

        {/* Sol: başlık + sezon */}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-black text-[#1a1a2e] leading-tight truncate">
            Beylerbeyi Akademi — Haftalık Antrenman Programı
          </h1>
          {/* Sezon seçici — dropdown */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Sezon</span>
            <div className="relative">
              <select
                value={activeSeason}
                onChange={(e) => setActiveSeason(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 rounded-lg border border-[#e5e7eb] bg-white text-sm font-semibold text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#c4111d]/20 focus:border-[#c4111d] cursor-pointer shadow-sm hover:border-[#c4111d]/40 transition-colors"
              >
                {lookups.seasons.map((s) => (
                  <option key={s.id} value={s.value}>{s.value}</option>
                ))}
              </select>
              <ChevronRight size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 text-[#9ca3af] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Sağ: kontroller */}
        <div className="flex items-center gap-2 flex-wrap">

          {/* Çoklu seçim */}
          <button
            onClick={toggleMultiSelectMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              multiSelectMode
                ? "bg-[#1a1a2e] text-white border-[#1a1a2e]"
                : "bg-white text-[#6b7280] border-[#e5e7eb] hover:bg-[#f9fafb]"
            }`}
          >
            <MousePointerClick size={13} />
            {multiSelectMode ? "Seçim Modu" : "Çoklu Seç"}
          </button>

          {multiSelectMode && multiSelected.size > 0 && (
            <button
              onClick={openMultiModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#c4111d] text-white text-xs font-bold hover:bg-[#a50e18] transition-colors"
            >
              <CheckSquare size={13} />
              {multiSelected.size} hücre
            </button>
          )}

          <div className="w-px h-5 bg-[#e5e7eb]" />

          {/* Hafta navigasyonu */}
          <button onClick={() => navigateWeek(-1)} className="p-1.5 rounded-lg border border-[#e5e7eb] bg-white hover:bg-[#f9fafb] text-[#6b7280] transition-colors">
            <ChevronLeft size={16} />
          </button>

          <div className="flex items-center">
            {editingWeekNum ? (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#1b6e2a]/10 border border-[#1b6e2a]/30">
                <input
                  type="number" min={1} value={tempWeekNum}
                  onChange={(e) => setTempWeekNum(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") saveTrainingWeekNumber(); if (e.key === "Escape") setEditingWeekNum(false); }}
                  autoFocus
                  className="w-12 text-[10px] font-bold text-center bg-transparent border-none focus:outline-none text-[#1b6e2a]"
                />
                <button onClick={saveTrainingWeekNumber} className="text-[#1b6e2a]"><Check size={11} /></button>
                <button onClick={() => setEditingWeekNum(false)} className="text-[#9ca3af]"><X size={11} /></button>
              </div>
            ) : (
              <button
                onClick={() => { if (userRole?.role === "oyuncu") return; setTempWeekNum(trainingWeekNumber?.toString() ?? ""); setEditingWeekNum(true); }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold min-w-[120px] justify-center transition-colors ${
                  trainingWeekNumber ? "bg-[#1b6e2a] text-white hover:bg-[#155a22]" : "bg-[#f3f4f6] text-[#9ca3af] hover:bg-[#e5e7eb]"
                } ${userRole?.role === "oyuncu" ? "cursor-default" : "cursor-pointer"}`}
              >
                {trainingWeekNumber ? <>{trainingWeekNumber}. ANTRENMAN HAFTASI</> : <><Pencil size={9} /> Antrenman haftası gir</>}
              </button>
            )}
          </div>

          <button onClick={() => navigateWeek(1)} className="p-1.5 rounded-lg border border-[#e5e7eb] bg-white hover:bg-[#f9fafb] text-[#6b7280] transition-colors">
            <ChevronRight size={16} />
          </button>
          <button onClick={() => setWeekStart(getWeekStart(new Date()))} className="px-2.5 py-1.5 rounded-lg border border-[#e5e7eb] bg-white hover:bg-[#f9fafb] text-[#6b7280] text-xs font-medium transition-colors">
            Bu hafta
          </button>
        </div>
      </div>

      {/* ── Hata mesajı ────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* ── Grid tablosu ───────────────────────────────── */}
      <div className="overflow-x-auto rounded-2xl border border-[#d1d5db] shadow-md bg-white">
        <table className="w-full border-collapse table-fixed" style={{ minWidth: 640 }}>

          {/* ── Başlık satırı ── */}
          <thead>
            <tr className="bg-[#1b6e2a]">
              {/* Logo hücresi — sticky */}
              <th className="sticky left-0 z-20 w-[72px] px-2 py-3 border-r border-white/20 bg-[#1b6e2a]">
                <div className="flex flex-col items-center gap-0.5">
                  <Image src="/Logo_S.png" alt="Beylerbeyi" width={30} height={30} className="object-contain drop-shadow" />
                  <span className="text-[8px] font-extrabold uppercase tracking-widest text-white/70">Yaş</span>
                </div>
              </th>
              {weekDates.map((d, i) => (
                <th key={i} className="px-1 py-3 text-center border-r last:border-r-0 border-white/20">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-white">{DAYS_TR[i]}</div>
                  <div className="text-[11px] font-semibold text-white/70 mt-0.5">{formatDisplayDate(d)}</div>
                </th>
              ))}
            </tr>
          </thead>

          {/* ── Gövde ── */}
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-[#6b7280]">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-[#c4111d] border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-medium">Yükleniyor…</span>
                  </div>
                </td>
              </tr>
            ) : ageGroups.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-[#6b7280] text-sm">
                  Yaş grubu bulunamadı.
                </td>
              </tr>
            ) : (
              ageGroups.map((ageGroup, rowIdx) => (
                <tr key={ageGroup} className={rowIdx % 2 === 0 ? "bg-white" : "bg-[#f9fafb]"}>

                  {/* Yaş grubu — sticky */}
                  <td className={`sticky left-0 z-10 px-2 py-2 border-r border-b border-[#e5e7eb] bg-[#c4111d] ${rowIdx % 2 === 0 ? "" : "brightness-95"}`}>
                    <div className="flex items-center justify-center">
                      <span className="text-sm font-black text-white tracking-wide">{ageGroup}</span>
                    </div>
                  </td>

                  {/* Gün hücreleri */}
                  {weekDates.map((date, dayIdx) => {
                    const dateStr = toISODate(date);
                    const key = scheduleKey(ageGroup, dateStr);
                    const schedule = schedules[key];
                    const editable = canEdit(ageGroup);
                    const isMultiSelected = multiSelected.has(key);

                    return (
                      <td key={dayIdx} className="p-1 border-r last:border-r-0 border-b border-[#e5e7eb]">
                        <button
                          onClick={() => openCell(ageGroup, dateStr)}
                          disabled={!multiSelectMode && !editable && !schedule}
                          className={`w-full min-h-[52px] rounded-lg px-1.5 py-1.5 text-center transition-all duration-150 break-words whitespace-normal
                            ${isMultiSelected
                              ? "ring-2 ring-[#4338ca] ring-offset-1 bg-[#e0e7ff] border border-[#818cf8]"
                              : schedule
                              ? getCellStyle(schedule.schedule_type)
                              : editable
                              ? "bg-[#f1f5f9] border border-dashed border-[#94a3b8] hover:border-[#64748b] hover:bg-[#e2e8f0]"
                              : "bg-[#f1f5f9] border border-[#e2e8f0]"
                            }
                            ${(multiSelectMode && editable) || (!multiSelectMode && editable)
                              ? "cursor-pointer active:scale-95"
                              : "cursor-default"
                            }`}
                          title={
                            multiSelectMode && editable ? (isMultiSelected ? "Seçimi kaldır" : "Seç")
                              : editable ? "Düzenle"
                              : schedule ? "Görüntüle"
                              : ""
                          }
                        >
                          {isMultiSelected ? (
                            <CheckSquare size={16} className="mx-auto text-[#4338ca]" />
                          ) : schedule ? (
                            (() => {
                              const { time, label } = getCellContent(schedule);
                              const sessionNum = schedule.schedule_type === "normal" ? sessionCounts[key] : null;
                              return (
                                <span className="flex flex-col items-center justify-center gap-0.5 w-full">
                                  {time && <span className="text-[13px] font-black leading-tight">{time}</span>}
                                  {label && <span className={`leading-snug font-bold ${time ? "text-[9px] opacity-80" : "text-[11px]"}`}>{label}</span>}
                                  {sessionNum && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-[#334155]/10 text-[#334155] text-[9px] font-normal leading-none mt-0.5">
                                      {sessionNum}.
                                    </span>
                                  )}
                                </span>
                              );
                            })()
                          ) : editable ? (
                            <span className="text-base font-light text-[#d1d5db]">{multiSelectMode ? "○" : "+"}</span>
                          ) : null}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Renk Açıklaması ────────────────────────────── */}
      <div className="flex flex-wrap gap-3 text-xs font-medium text-[#6b7280]">
        {[
          { color: "bg-white border border-[#94a3b8]", label: "Normal Antrenman" },
          { color: "bg-[#d1fae5] border border-[#6ee7b7]", label: "İzin" },
          { color: "bg-[#fee2e2] border border-[#fca5a5]", label: "Maç" },
          { color: "bg-[#fef3c7] border border-[#fcd34d]", label: "Özel" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`w-3.5 h-3.5 rounded ${item.color}`} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {/* ── Tekli Modal ─────────────────────────────────── */}
      {selectedCell && (
        <CellEditModal
          cell={selectedCell}
          form={form}
          setForm={setForm}
          existingScheduleId={existingScheduleId}
          season={activeSeason}
          canEdit={canEdit(selectedCell.age_group)}
          saving={saving}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={closeModal}
          addItem={addItem}
          updateItem={updateItem}
          removeItem={removeItem}
        />
      )}

      {/* ── Çoklu Modal ─────────────────────────────────── */}
      {multiModalOpen && (
        <CellEditModal
          cell={null}
          multiCount={multiSelected.size}
          form={form}
          setForm={setForm}
          existingScheduleId={null}
          season={activeSeason}
          canEdit={true}
          saving={saving}
          onSave={handleMultiSave}
          onDelete={() => {}}
          onClose={closeModal}
          addItem={addItem}
          updateItem={updateItem}
          removeItem={removeItem}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Hücre Düzenleme Modal Bileşeni
// ─────────────────────────────────────────────────────────────

interface CellEditModalProps {
  cell: { age_group: string; date: string } | null;
  multiCount?: number;
  form: CellForm;
  setForm: React.Dispatch<React.SetStateAction<CellForm>>;
  existingScheduleId: string | null;
  season: string;
  canEdit: boolean;
  saving: boolean;
  onSave: () => void;
  onDelete: () => void;
  onClose: () => void;
  addItem: () => void;
  updateItem: (idx: number, value: string) => void;
  removeItem: (idx: number) => void;
}

function CellEditModal({
  cell,
  form,
  setForm,
  existingScheduleId,
  season,
  canEdit,
  saving,
  onSave,
  onDelete,
  onClose,
  addItem,
  updateItem,
  removeItem,
  multiCount,
}: CellEditModalProps) {
  const [players, setPlayers] = React.useState<PlayerSummary[]>([]);
  const [attendanceMap, setAttendanceMap] = React.useState<Record<string, AttendanceStatus>>({});
  const [attendanceLoading, setAttendanceLoading] = React.useState(false);
  const [attendanceOpen, setAttendanceOpen] = React.useState(false);
  const [savingPlayer, setSavingPlayer] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!attendanceOpen || !cell || !existingScheduleId || form.schedule_type === "izin") {
      if (!attendanceOpen) { setPlayers([]); setAttendanceMap({}); }
      return;
    }
    setAttendanceLoading(true);
    Promise.all([
      fetchPlayersByAgeGroupAndSeason(cell.age_group, season),
      fetchAttendanceByScheduleId(existingScheduleId),
    ]).then(([playerList, attendanceList]) => {
      setPlayers([...playerList].sort((a, b) => comparePositions(a.position ?? "", b.position ?? "")));
      const map: Record<string, AttendanceStatus> = {};
      attendanceList.forEach(a => { map[a.player_id] = a.status; });
      setAttendanceMap(map);
    }).catch(e => console.error("Yoklama yüklenemedi:", e?.message ?? e))
      .finally(() => setAttendanceLoading(false));
  }, [attendanceOpen, cell, existingScheduleId, season, form.schedule_type]);

  async function handleAttendance(playerId: string, status: AttendanceStatus) {
    if (!existingScheduleId || !canEdit) return;
    const prev = attendanceMap[playerId];
    // Aynı butona tekrar basılırsa sıfırla
    if (prev === status) {
      setAttendanceMap(m => { const n = { ...m }; delete n[playerId]; return n; });
      setSavingPlayer(playerId);
      try { await deleteAttendance(existingScheduleId, playerId); } catch (e) { console.error(e); }
      finally { setSavingPlayer(null); }
    } else {
      setAttendanceMap(m => ({ ...m, [playerId]: status }));
      setSavingPlayer(playerId);
      try { await upsertAttendance(existingScheduleId, playerId, status); } catch (e) { console.error(e); }
      finally { setSavingPlayer(null); }
    }
  }
  const isMultiMode = !cell && (multiCount ?? 0) > 0;
  const dayIndex = cell ? new Date(cell.date + "T00:00:00").getDay() : 0;
  const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
  const dayName = cell ? DAYS_TR[adjustedIndex] : "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Modal başlık */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e5e9]">
          <div>
            {isMultiMode ? (
              <div className="flex items-center gap-2">
                <CheckSquare size={18} className="text-[#1a1a2e]" />
                <h2 className="text-base font-bold text-[#1a1a2e]">
                  {multiCount} hücreyi düzenle
                </h2>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <CalendarDays size={18} className="text-[#c4111d]" />
                  <h2 className="text-base font-bold text-[#1a1a2e]">
                    {cell!.age_group} — {dayName}
                  </h2>
                </div>
                <p className="text-xs text-[#5a6170] mt-0.5 ml-7">
                  {formatDisplayDateLong(cell!.date)}
                </p>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#f1f3f5] text-[#5a6170] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal gövde */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Program tipi */}
          <div>
            <label className="block text-xs font-semibold text-[#5a6170] uppercase tracking-wide mb-2">
              Program Tipi
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["normal", "izin", "mac", "ozel"] as ScheduleType[]).map((type) => (
                <button
                  key={type}
                  disabled={!canEdit}
                  onClick={() => setForm((f) => ({ ...f, schedule_type: type }))}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium border-2 transition-all ${
                    form.schedule_type === type
                      ? type === "izin"
                        ? "border-[#1b6e2a] bg-[#1b6e2a] text-white"
                        : type === "mac"
                        ? "border-[#c4111d] bg-[#c4111d] text-white"
                        : type === "ozel"
                        ? "border-[#f59e0b] bg-[#f59e0b] text-white"
                        : "border-[#1a1a2e] bg-[#1a1a2e] text-white"
                      : "border-[#e2e5e9] bg-white text-[#5a6170] hover:border-[#c4111d] hover:text-[#c4111d]"
                  } ${!canEdit ? "opacity-60 cursor-default" : "cursor-pointer"}`}
                >
                  {SCHEDULE_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          {/* Antrenman saati (izin değilse göster) */}
          {form.schedule_type !== "izin" && (
            <div>
              <label className="block text-xs font-semibold text-[#5a6170] uppercase tracking-wide mb-2">
                <Clock size={12} className="inline mr-1" />
                Antrenman Saati
              </label>
              <input
                type="time"
                value={form.training_time}
                disabled={!canEdit}
                onChange={(e) => setForm((f) => ({ ...f, training_time: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-[#e2e5e9] text-sm focus:outline-none focus:ring-2 focus:ring-[#c4111d]/20 focus:border-[#c4111d] disabled:opacity-60 disabled:bg-[#f8f9fb]"
                placeholder="11:00"
              />
            </div>
          )}

          {/* Hücre etiketi (izin değilse göster) */}
          {form.schedule_type !== "izin" && (
            <div>
              <label className="block text-xs font-semibold text-[#5a6170] uppercase tracking-wide mb-2">
                Özel Etiket <span className="font-normal normal-case">(isteğe bağlı)</span>
              </label>
              <input
                type="text"
                value={form.cell_label}
                disabled={!canEdit}
                onChange={(e) => setForm((f) => ({ ...f, cell_label: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-[#e2e5e9] text-sm focus:outline-none focus:ring-2 focus:ring-[#c4111d]/20 focus:border-[#c4111d] disabled:opacity-60 disabled:bg-[#f8f9fb]"
                placeholder="Ör: MALTEPE A.P 17:00 veya LİG MAÇI 25.HAFTA"
              />
              <p className="text-[11px] text-[#9aa3af] mt-1">
                Doldurulursa hücrede bu metin gösterilir. Boşsa antrenman saati görünür.
              </p>
            </div>
          )}

          {/* Yoklama — accordion (tek hücre + izin değilse) */}
          {!isMultiMode && form.schedule_type !== "izin" && (
            <div className="border border-[#e2e5e9] rounded-xl overflow-hidden">
              {/* Accordion başlık */}
              <button
                type="button"
                onClick={() => setAttendanceOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#f8f9fb] hover:bg-[#f1f3f5] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#5a6170] uppercase tracking-wide">Yoklama</span>
                  {attendanceOpen && players.length > 0 && (
                    <span className="text-[10px] font-medium text-white bg-[#1b6e2a] px-1.5 py-0.5 rounded-full">
                      {Object.values(attendanceMap).filter(s => s === "geldi").length}/{players.length}
                    </span>
                  )}
                </div>
                <ChevronRight
                  size={15}
                  className={`text-[#9aa3af] transition-transform duration-200 ${attendanceOpen ? "rotate-90" : ""}`}
                />
              </button>

              {/* Accordion içerik */}
              {attendanceOpen && (
                <div className="border-t border-[#e2e5e9] px-3 py-2">
                  {!existingScheduleId ? (
                    <p className="text-xs text-[#9aa3af] py-3 text-center">
                      Yoklama için önce programı kaydedin
                    </p>
                  ) : attendanceLoading ? (
                    <div className="flex items-center justify-center gap-2 py-4 text-[#6b7280]">
                      <div className="w-3.5 h-3.5 border-2 border-[#1b6e2a] border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs">Yükleniyor…</span>
                    </div>
                  ) : players.length === 0 ? (
                    <p className="text-xs text-[#9aa3af] py-3 text-center">
                      Kayıtlı oyuncu bulunamadı
                    </p>
                  ) : (
                    <div className="space-y-0.5 py-1">
                      {players.map(player => {
                        const status = attendanceMap[player.id];
                        const isSaving = savingPlayer === player.id;
                        return (
                          <div key={player.id} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5 py-2 px-2 rounded-lg hover:bg-[#f1f5f9] transition-colors border-b border-[#f0f1f3] last:border-b-0">
                            {/* Üst satır: mevki + isim + spinner */}
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className={`shrink-0 w-8 h-6 rounded flex items-center justify-center text-[10px] font-black text-white ${getPositionColors(player.position ?? "").bg}`}>
                                {getPositionAbbr(player.position ?? "")}
                              </span>
                              <span className="flex-1 min-w-0 text-[13px] font-medium text-[#1a1a2e] truncate">
                                {player.first_name} {player.last_name}
                              </span>
                              {isSaving && (
                                <div className="w-3 h-3 border-2 border-[#1b6e2a] border-t-transparent rounded-full animate-spin shrink-0" />
                              )}
                            </div>
                            {/* Alt satır (mobil) / sağ taraf (desktop): seçenek butonları */}
                            <div className="flex gap-1 shrink-0 sm:flex-none">
                              {([
                                { s: "geldi",   label: "Geldi",   active: "bg-[#1b6e2a] text-white border-[#1b6e2a]",  inactive: "text-[#1b6e2a] border-[#1b6e2a]" },
                                { s: "gelmedi", label: "Gelmedi", active: "bg-[#c4111d] text-white border-[#c4111d]",  inactive: "text-[#c4111d] border-[#c4111d]" },
                                { s: "izinli",  label: "İzinli",  active: "bg-[#2563eb] text-white border-[#2563eb]",  inactive: "text-[#2563eb] border-[#2563eb]" },
                                { s: "sakat",   label: "Sakat",   active: "bg-[#d97706] text-white border-[#d97706]",  inactive: "text-[#d97706] border-[#d97706]" },
                              ] as { s: AttendanceStatus; label: string; active: string; inactive: string }[]).map(({ s, label, active, inactive }) => (
                                <button
                                  key={s}
                                  disabled={!canEdit || isSaving}
                                  onClick={() => handleAttendance(player.id, s)}
                                  className={`flex-1 sm:flex-none px-2 h-7 sm:h-6 rounded text-[10px] font-semibold border transition-all ${
                                    status === s ? active : `bg-white ${inactive} opacity-40 hover:opacity-90`
                                  } disabled:cursor-default`}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Antrenman detay kalemleri (sadece normal antrenman) */}
          {form.schedule_type === "normal" && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-[#5a6170] uppercase tracking-wide">
                  Antrenman İçeriği
                </label>
                {canEdit && (
                  <button
                    onClick={addItem}
                    className="flex items-center gap-1 text-xs text-[#c4111d] hover:text-[#a50e18] font-medium transition-colors"
                  >
                    <Plus size={13} />
                    Kalem Ekle
                  </button>
                )}
              </div>

              {form.items.length === 0 ? (
                <div className="py-4 text-center text-[#9aa3af] text-sm border-2 border-dashed border-[#e2e5e9] rounded-lg">
                  {canEdit
                    ? "Antrenman içeriği eklemek için butona tıklayın"
                    : "Detay kalemi girilmemiş"}
                </div>
              ) : (
                <div className="space-y-2">
                  {form.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <GripVertical size={14} className="text-[#c8cdd4] shrink-0" />
                      <input
                        type="text"
                        value={item}
                        disabled={!canEdit}
                        onChange={(e) => updateItem(idx, e.target.value)}
                        placeholder={`Kalem ${idx + 1} — ör. Validebağ KROS 25dk`}
                        className="flex-1 px-3 py-2 rounded-lg border border-[#e2e5e9] text-sm focus:outline-none focus:ring-2 focus:ring-[#c4111d]/20 focus:border-[#c4111d] disabled:opacity-60 disabled:bg-[#f8f9fb]"
                      />
                      {canEdit && (
                        <button
                          onClick={() => removeItem(idx)}
                          className="p-1.5 rounded-lg text-[#c4111d] hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal footer */}
        <div className="px-6 py-4 border-t border-[#e2e5e9] flex items-center justify-between gap-3">
          {/* Sil butonu — çoklu modda gösterilmez */}
          {canEdit && existingScheduleId && !isMultiMode ? (
            <button
              onClick={onDelete}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-[#c4111d] hover:bg-red-50 border border-[#c4111d]/30 transition-colors disabled:opacity-60"
            >
              <Trash2 size={14} />
              Sil
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-medium text-[#5a6170] bg-[#f1f3f5] hover:bg-[#e8eaed] transition-colors"
            >
              {canEdit ? "İptal" : "Kapat"}
            </button>
            {canEdit && (
              <button
                onClick={onSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white bg-[#c4111d] hover:bg-[#a50e18] transition-colors disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Kaydediyor...
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    Kaydet
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
