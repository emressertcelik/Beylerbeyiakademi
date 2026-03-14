"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAppData } from "@/lib/app-data";
import { ScoutedPlayer, TrialPlayer, TrialStatus } from "@/types/playerPool";
import {
  fetchScoutedPlayers,
  createScoutedPlayer,
  updateScoutedPlayer,
  deleteScoutedPlayer,
  fetchTrialPlayers,
  createTrialPlayer,
  updateTrialPlayer,
  deleteTrialPlayer,
} from "@/lib/supabase/playerPool";
import { useToast } from "@/components/Toast";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  X,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  FileDown,
} from "lucide-react";

// ============================================================
// Helpers
// ============================================================

const STATUS_LABELS: Record<TrialStatus, string> = {
  olumlu: "Olumlu",
  olumsuz: "Olumsuz",
  beklemede: "Beklemede",
};

const STATUS_COLORS: Record<TrialStatus, string> = {
  olumlu: "bg-green-100 text-green-700 border-green-200",
  olumsuz: "bg-red-100 text-red-700 border-red-200",
  beklemede: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

const STATUS_ICONS: Record<TrialStatus, React.ReactNode> = {
  olumlu: <CheckCircle2 size={12} />,
  olumsuz: <XCircle size={12} />,
  beklemede: <Clock size={12} />,
};

function formatDate(dateStr?: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function calcAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

// ============================================================
// Boş kayıt fabrikaları
// ============================================================

function emptyScoutedPlayer(): Omit<ScoutedPlayer, "id" | "createdAt" | "updatedAt"> {
  return {
    firstName: "",
    lastName: "",
    birthDate: "",
    currentTeam: "",
    position: "",
    referencePerson: "",
    recordedBy: "",
    notes: "",
  };
}

function emptyTrialPlayer(defaultSeason = ""): Omit<TrialPlayer, "id" | "createdAt" | "updatedAt"> {
  return {
    firstName: "",
    lastName: "",
    birthDate: "",
    currentTeam: "",
    position: "",
    referencePerson: "",
    recordedBy: "",
    notes: "",
    trialAgeGroup: "",
    trialDate: "",
    trialSeason: defaultSeason,
    status: "beklemede",
  };
}

// ============================================================
// Form alanları ortak component
// ============================================================

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-[#5a6170]">
        {label}
        {required && <span className="text-[#c4111d] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-[#e2e5e9] bg-white text-sm text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#c4111d]/30 focus:border-[#c4111d]/50 placeholder:text-[#c0c5ce]";

// ============================================================
// Modal wrapper
// ============================================================

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e5e9]">
          <h2 className="text-base font-bold text-[#1a1a2e]">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8c919a] hover:text-[#1a1a2e] hover:bg-[#f1f3f5] transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

// ============================================================
// Scouted Player Form Modal
// ============================================================

function ScoutedFormModal({
  initial,
  onClose,
  onSave,
  saving,
}: {
  initial: Omit<ScoutedPlayer, "id" | "createdAt" | "updatedAt"> & { id?: string };
  onClose: () => void;
  onSave: (data: typeof initial) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Modal title={form.id ? "İzlenen Oyuncu Düzenle" : "İzlenen Oyuncu Ekle"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Ad" required>
            <input className={inputCls} value={form.firstName} onChange={set("firstName")} placeholder="Ad" required />
          </Field>
          <Field label="Soyad" required>
            <input className={inputCls} value={form.lastName} onChange={set("lastName")} placeholder="Soyad" required />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Doğum Tarihi" required>
            <input type="date" className={inputCls} value={form.birthDate} onChange={set("birthDate")} required />
          </Field>
          <Field label="Bulunduğu Takım">
            <input className={inputCls} value={form.currentTeam || ""} onChange={set("currentTeam")} placeholder="Takım adı" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Mevkisi">
            <input className={inputCls} value={form.position || ""} onChange={set("position")} placeholder="Örn: Orta Saha" />
          </Field>
          <Field label="Referans Kişi">
            <input className={inputCls} value={form.referencePerson || ""} onChange={set("referencePerson")} placeholder="Referans veren kişi" />
          </Field>
        </div>
        <Field label="Kayıt Alan Kişi">
          <input className={inputCls} value={form.recordedBy || ""} onChange={set("recordedBy")} placeholder="Kaydı yapan kişi" />
        </Field>
        <Field label="Özel Not">
          <textarea
            className={inputCls + " resize-none"}
            rows={3}
            value={form.notes || ""}
            onChange={set("notes")}
            placeholder="Gözlemler, notlar..."
          />
        </Field>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold text-[#5a6170] hover:bg-[#f1f3f5] transition-colors">
            İptal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#c4111d] hover:bg-[#9b0d16] text-white transition-colors disabled:opacity-60"
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ============================================================
// Trial Player Form Modal
// ============================================================

function TrialFormModal({
  initial,
  ageGroups,
  seasons,
  onClose,
  onSave,
  saving,
}: {
  initial: Omit<TrialPlayer, "id" | "createdAt" | "updatedAt"> & { id?: string };
  ageGroups: string[];
  seasons: string[];
  onClose: () => void;
  onSave: (data: typeof initial) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Modal title={form.id ? "Deneme Oyuncusu Düzenle" : "Deneme Oyuncusu Ekle"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Ad" required>
            <input className={inputCls} value={form.firstName} onChange={set("firstName")} placeholder="Ad" required />
          </Field>
          <Field label="Soyad" required>
            <input className={inputCls} value={form.lastName} onChange={set("lastName")} placeholder="Soyad" required />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Doğum Tarihi" required>
            <input type="date" className={inputCls} value={form.birthDate} onChange={set("birthDate")} required />
          </Field>
          <Field label="Bulunduğu Takım">
            <input className={inputCls} value={form.currentTeam || ""} onChange={set("currentTeam")} placeholder="Takım adı" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Mevkisi">
            <input className={inputCls} value={form.position || ""} onChange={set("position")} placeholder="Örn: Orta Saha" />
          </Field>
          <Field label="Referans Kişi">
            <input className={inputCls} value={form.referencePerson || ""} onChange={set("referencePerson")} placeholder="Referans veren kişi" />
          </Field>
        </div>
        <Field label="Kayıt Alan Kişi">
          <input className={inputCls} value={form.recordedBy || ""} onChange={set("recordedBy")} placeholder="Kaydı yapan kişi" />
        </Field>

        {/* Denemeye özgü alanlar */}
        <div className="border-t border-[#e2e5e9] pt-4 mt-2">
          <p className="text-xs font-bold text-[#c4111d] uppercase tracking-wide mb-3">Deneme Bilgileri</p>
          <div className="mb-4">
            <Field label="Sezon" required>
              <div className="relative">
                <select
                  className={inputCls + " appearance-none pr-8"}
                  value={form.trialSeason || ""}
                  onChange={set("trialSeason")}
                  required
                >
                  <option value="">Sezon seçiniz</option>
                  {seasons.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8c919a] pointer-events-none" />
              </div>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Yaş Grubu">
              <div className="relative">
                <select
                  className={inputCls + " appearance-none pr-8"}
                  value={form.trialAgeGroup || ""}
                  onChange={set("trialAgeGroup")}
                >
                  <option value="">Seçiniz</option>
                  {ageGroups.map((ag) => (
                    <option key={ag} value={ag}>{ag}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8c919a] pointer-events-none" />
              </div>
            </Field>
            <Field label="Deneme Tarihi">
              <input type="date" className={inputCls} value={form.trialDate || ""} onChange={set("trialDate")} />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Durum">
              <div className="relative">
                <select
                  className={inputCls + " appearance-none pr-8"}
                  value={form.status}
                  onChange={set("status")}
                >
                  <option value="beklemede">Beklemede</option>
                  <option value="olumlu">Olumlu</option>
                  <option value="olumsuz">Olumsuz</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8c919a] pointer-events-none" />
              </div>
            </Field>
          </div>
        </div>

        <Field label="Özel Not">
          <textarea
            className={inputCls + " resize-none"}
            rows={3}
            value={form.notes || ""}
            onChange={set("notes")}
            placeholder="Gözlemler, notlar..."
          />
        </Field>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold text-[#5a6170] hover:bg-[#f1f3f5] transition-colors">
            İptal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#c4111d] hover:bg-[#9b0d16] text-white transition-colors disabled:opacity-60"
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ============================================================
// Detail Modal (ortak)
// ============================================================

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold text-[#8c919a] uppercase tracking-wide">{label}</span>
      <span className="text-sm text-[#1a1a2e] font-medium">{value || "-"}</span>
    </div>
  );
}

function ScoutedDetailModal({
  player,
  onClose,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: {
  player: ScoutedPlayer;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  canEdit: boolean;
  canDelete: boolean;
}) {
  return (
    <Modal title={`${player.firstName} ${player.lastName}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <DetailRow label="Doğum Tarihi" value={`${formatDate(player.birthDate)} (${calcAge(player.birthDate)} yaş)`} />
          <DetailRow label="Bulunduğu Takım" value={player.currentTeam} />
          <DetailRow label="Mevkisi" value={player.position} />
          <DetailRow label="Referans Kişi" value={player.referencePerson} />
          <DetailRow label="Kayıt Alan" value={player.recordedBy} />
          <DetailRow label="Kayıt Tarihi" value={formatDate(player.createdAt)} />
        </div>
        {player.notes && (
          <div className="bg-[#f8f9fb] rounded-xl p-3">
            <p className="text-[10px] font-semibold text-[#8c919a] uppercase tracking-wide mb-1">Özel Not</p>
            <p className="text-sm text-[#1a1a2e] whitespace-pre-wrap">{player.notes}</p>
          </div>
        )}
        <div className="flex justify-between pt-2">
          <div>
            {canDelete && (
              <button onClick={onDelete} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">
                <Trash2 size={15} />
                Sil
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold text-[#5a6170] hover:bg-[#f1f3f5] transition-colors">
              Kapat
            </button>
            {canEdit && (
              <button onClick={onEdit} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-[#c4111d] hover:bg-[#9b0d16] text-white transition-colors">
                <Pencil size={14} />
                Düzenle
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function TrialDetailModal({
  player,
  onClose,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: {
  player: TrialPlayer;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  canEdit: boolean;
  canDelete: boolean;
}) {
  return (
    <Modal title={`${player.firstName} ${player.lastName}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <DetailRow label="Doğum Tarihi" value={`${formatDate(player.birthDate)} (${calcAge(player.birthDate)} yaş)`} />
          <DetailRow label="Bulunduğu Takım" value={player.currentTeam} />
          <DetailRow label="Mevkisi" value={player.position} />
          <DetailRow label="Referans Kişi" value={player.referencePerson} />
          <DetailRow label="Kayıt Alan" value={player.recordedBy} />
          <DetailRow label="Kayıt Tarihi" value={formatDate(player.createdAt)} />
        </div>

        {/* Deneme bilgileri */}
        <div className="bg-[#f8f9fb] rounded-xl p-4 space-y-3">
          <p className="text-[10px] font-bold text-[#c4111d] uppercase tracking-wide">Deneme Bilgileri</p>
          {player.trialSeason && (
            <DetailRow label="Sezon" value={player.trialSeason} />
          )}
          <div className="grid grid-cols-3 gap-4">
            <DetailRow label="Yaş Grubu" value={player.trialAgeGroup} />
            <DetailRow label="Deneme Tarihi" value={formatDate(player.trialDate)} />
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-semibold text-[#8c919a] uppercase tracking-wide">Durum</span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border w-fit ${STATUS_COLORS[player.status]}`}>
                {STATUS_ICONS[player.status]}
                {STATUS_LABELS[player.status]}
              </span>
            </div>
          </div>
        </div>

        {player.notes && (
          <div className="bg-[#f8f9fb] rounded-xl p-3">
            <p className="text-[10px] font-semibold text-[#8c919a] uppercase tracking-wide mb-1">Özel Not</p>
            <p className="text-sm text-[#1a1a2e] whitespace-pre-wrap">{player.notes}</p>
          </div>
        )}
        <div className="flex justify-between pt-2">
          <div>
            {canDelete && (
              <button onClick={onDelete} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">
                <Trash2 size={15} />
                Sil
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold text-[#5a6170] hover:bg-[#f1f3f5] transition-colors">
              Kapat
            </button>
            {canEdit && (
              <button onClick={onEdit} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-[#c4111d] hover:bg-[#9b0d16] text-white transition-colors">
                <Pencil size={14} />
                Düzenle
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ============================================================
// Silme onay modalı
// ============================================================

function DeleteConfirmModal({
  name,
  onConfirm,
  onCancel,
  deleting,
}: {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 size={18} className="text-red-600" />
          </div>
          <div>
            <p className="font-bold text-[#1a1a2e]">Kaydı Sil</p>
            <p className="text-sm text-[#5a6170]">{name} silinecek. Bu işlem geri alınamaz.</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-semibold text-[#5a6170] hover:bg-[#f1f3f5] transition-colors">
            İptal
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-60"
          >
            {deleting ? "Siliniyor..." : "Evet, Sil"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Tablo satırı
// ============================================================

function TableRow({
  cells,
  onView,
}: {
  cells: React.ReactNode[];
  onView: () => void;
}) {
  return (
    <tr
      className="border-b border-[#f1f3f5] hover:bg-[#f8f9fb] cursor-pointer transition-colors"
      onClick={onView}
    >
      {cells.map((cell, i) => (
        <td key={i} className="px-4 py-3 text-sm text-[#1a1a2e]">
          {cell}
        </td>
      ))}
    </tr>
  );
}

// ============================================================
// Ana Sayfa Componenti
// ============================================================

type TabType = "scouted" | "trial";

export default function PlayerPoolPage() {
  const { lookups, userRole } = useAppData();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<TabType>("scouted");
  const [search, setSearch] = useState("");

  // Scouted state
  const [scoutedPlayers, setScoutedPlayers] = useState<ScoutedPlayer[]>([]);
  const [scoutedLoading, setScoutedLoading] = useState(true);
  const [scoutedForm, setScoutedForm] = useState<(Omit<ScoutedPlayer, "id" | "createdAt" | "updatedAt"> & { id?: string }) | null>(null);
  const [selectedScouted, setSelectedScouted] = useState<ScoutedPlayer | null>(null);
  const [deletingScouted, setDeletingScouted] = useState<ScoutedPlayer | null>(null);
  const [scoutedSaving, setScoutedSaving] = useState(false);
  const [scoutedDeleting, setScoutedDeleting] = useState(false);

  // Trial state
  const [trialPlayers, setTrialPlayers] = useState<TrialPlayer[]>([]);
  const [trialLoading, setTrialLoading] = useState(true);
  const [trialForm, setTrialForm] = useState<(Omit<TrialPlayer, "id" | "createdAt" | "updatedAt"> & { id?: string }) | null>(null);
  const [selectedTrial, setSelectedTrial] = useState<TrialPlayer | null>(null);
  const [deletingTrial, setDeletingTrial] = useState<TrialPlayer | null>(null);
  const [trialSaving, setTrialSaving] = useState(false);
  const [trialDeleting, setTrialDeleting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TrialStatus | "ALL">("ALL");
  const [seasonFilter, setSeasonFilter] = useState<string>("ALL");

  const ageGroups = useMemo(
    () => lookups.ageGroups.filter((a) => a.isActive).map((a) => a.value),
    [lookups.ageGroups]
  );

  const seasons = useMemo(
    () => lookups.seasons.filter((s) => s.isActive).map((s) => s.value),
    [lookups.seasons]
  );

  const activeSeason = useMemo(
    () => lookups.seasons.length > 0 ? lookups.seasons[lookups.seasons.length - 1].value : "",
    [lookups.seasons]
  );

  const canEdit = true;
  const canDelete = true;

  // ---- Data fetching ----

  const loadScouted = useCallback(async () => {
    try {
      setScoutedLoading(true);
      const data = await fetchScoutedPlayers();
      setScoutedPlayers(data);
    } catch {
      showToast("error", "İzlenen oyuncular yüklenemedi.");
    } finally {
      setScoutedLoading(false);
    }
  }, [showToast]);

  const loadTrial = useCallback(async () => {
    try {
      setTrialLoading(true);
      const data = await fetchTrialPlayers();
      setTrialPlayers(data);
    } catch {
      showToast("error", "Deneme oyuncuları yüklenemedi.");
    } finally {
      setTrialLoading(false);
    }
  }, [showToast]);

  useEffect(() => { loadScouted(); }, [loadScouted]);
  useEffect(() => { loadTrial(); }, [loadTrial]);

  // ---- Filtered lists ----

  const filteredScouted = useMemo(() => {
    if (!search) return scoutedPlayers;
    const q = search.toLowerCase();
    return scoutedPlayers.filter(
      (p) =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        (p.currentTeam || "").toLowerCase().includes(q) ||
        (p.position || "").toLowerCase().includes(q) ||
        (p.referencePerson || "").toLowerCase().includes(q)
    );
  }, [scoutedPlayers, search]);

  const filteredTrial = useMemo(() => {
    let list = trialPlayers;
    if (seasonFilter !== "ALL") list = list.filter((p) => p.trialSeason === seasonFilter);
    if (statusFilter !== "ALL") list = list.filter((p) => p.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
          (p.currentTeam || "").toLowerCase().includes(q) ||
          (p.position || "").toLowerCase().includes(q) ||
          (p.trialAgeGroup || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [trialPlayers, statusFilter, seasonFilter, search]);

  // ---- Scouted handlers ----

  const handleSaveScouted = async (form: Omit<ScoutedPlayer, "id" | "createdAt" | "updatedAt"> & { id?: string }) => {
    try {
      setScoutedSaving(true);
      if (form.id) {
        await updateScoutedPlayer(form as ScoutedPlayer);
        showToast("success", "Kayıt güncellendi.");
      } else {
        await createScoutedPlayer(form);
        showToast("success", "Oyuncu eklendi.");
      }
      setScoutedForm(null);
      await loadScouted();
    } catch {
      showToast("error", "Kayıt sırasında hata oluştu.");
    } finally {
      setScoutedSaving(false);
    }
  };

  const handleDeleteScouted = async () => {
    if (!deletingScouted) return;
    try {
      setScoutedDeleting(true);
      await deleteScoutedPlayer(deletingScouted.id);
      showToast("success", "Kayıt silindi.");
      setDeletingScouted(null);
      setSelectedScouted(null);
      await loadScouted();
    } catch {
      showToast("error", "Silme sırasında hata oluştu.");
    } finally {
      setScoutedDeleting(false);
    }
  };

  // ---- Trial handlers ----

  const handleSaveTrial = async (form: Omit<TrialPlayer, "id" | "createdAt" | "updatedAt"> & { id?: string }) => {
    try {
      setTrialSaving(true);
      if (form.id) {
        await updateTrialPlayer(form as TrialPlayer);
        showToast("success", "Kayıt güncellendi.");
      } else {
        await createTrialPlayer(form);
        showToast("success", "Deneme oyuncusu eklendi.");
      }
      setTrialForm(null);
      await loadTrial();
    } catch {
      showToast("error", "Kayıt sırasında hata oluştu.");
    } finally {
      setTrialSaving(false);
    }
  };

  const handleDeleteTrial = async () => {
    if (!deletingTrial) return;
    try {
      setTrialDeleting(true);
      await deleteTrialPlayer(deletingTrial.id);
      showToast("success", "Kayıt silindi.");
      setDeletingTrial(null);
      setSelectedTrial(null);
      await loadTrial();
    } catch {
      showToast("error", "Silme sırasında hata oluştu.");
    } finally {
      setTrialDeleting(false);
    }
  };

  // ---- PDF Export ----

  const [pdfLoading, setPdfLoading] = useState(false);

  async function exportPDF() {
    setPdfLoading(true);
    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const { jsPDF } = await import("jspdf");

      const isScouted = activeTab === "scouted";
      const title = isScouted ? "İzlenen Oyuncular Raporu" : "Deneme Oyuncuları Raporu";
      const now = new Date().toLocaleDateString("tr-TR");

      // Tablo satırlarını oluştur
      const rowsHtml = isScouted
        ? filteredScouted.map((p, i) => `
            <tr style="background:${i % 2 === 0 ? "#ffffff" : "#f8f9fb"}">
              <td style="padding:7px 10px;font-weight:600;color:#1a1a2e;">${p.firstName} ${p.lastName}</td>
              <td style="padding:7px 10px;color:#5a6170;">${formatDate(p.birthDate)} <span style="color:#9ca3af;font-size:11px;">(${calcAge(p.birthDate)} yaş)</span></td>
              <td style="padding:7px 10px;color:#5a6170;">${p.currentTeam || "-"}</td>
              <td style="padding:7px 10px;color:#5a6170;">${p.position || "-"}</td>
              <td style="padding:7px 10px;color:#5a6170;">${p.referencePerson || "-"}</td>
              <td style="padding:7px 10px;color:#5a6170;">${p.recordedBy || "-"}</td>
              <td style="padding:7px 10px;color:#8c919a;font-size:11px;">${formatDate(p.createdAt)}</td>
              <td style="padding:7px 10px;color:#5a6170;font-size:11px;max-width:160px;white-space:pre-wrap;">${p.notes || "-"}</td>
            </tr>`).join("")
        : filteredTrial.map((p, i) => {
            const statusBg: Record<TrialStatus, string> = { olumlu: "#dcfce7", olumsuz: "#fee2e2", beklemede: "#fef9c3" };
            const statusColor: Record<TrialStatus, string> = { olumlu: "#15803d", olumsuz: "#b91c1c", beklemede: "#92400e" };
            return `
            <tr style="background:${i % 2 === 0 ? "#ffffff" : "#f8f9fb"}">
              <td style="padding:7px 10px;font-weight:600;color:#1a1a2e;">${p.firstName} ${p.lastName}</td>
              <td style="padding:7px 10px;color:#5a6170;">${formatDate(p.birthDate)} <span style="color:#9ca3af;font-size:11px;">(${calcAge(p.birthDate)} yaş)</span></td>
              <td style="padding:7px 10px;color:#5a6170;">${p.currentTeam || "-"}</td>
              <td style="padding:7px 10px;color:#5a6170;">${p.position || "-"}</td>
              <td style="padding:7px 10px;font-weight:700;color:#c4111d;font-size:11px;">${p.trialSeason || "-"}</td>
              <td style="padding:7px 10px;font-weight:600;color:#1a1a2e;">${p.trialAgeGroup || "-"}</td>
              <td style="padding:7px 10px;color:#5a6170;">${formatDate(p.trialDate)}</td>
              <td style="padding:7px 10px;color:#5a6170;">${p.referencePerson || "-"}</td>
              <td style="padding:7px 10px;">
                <span style="display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700;background:${statusBg[p.status]};color:${statusColor[p.status]};">
                  ${STATUS_LABELS[p.status]}
                </span>
              </td>
              <td style="padding:7px 10px;color:#5a6170;font-size:11px;max-width:140px;white-space:pre-wrap;">${p.notes || "-"}</td>
            </tr>`;
          }).join("");

      const headerCells = isScouted
        ? ["Ad Soyad", "Doğum Tarihi", "Takım", "Mevki", "Referans", "Kayıt Alan", "Kayıt Tarihi", "Not"]
        : ["Ad Soyad", "Doğum Tarihi", "Takım", "Mevki", "Sezon", "Yaş Grubu", "Deneme Tarihi", "Referans", "Durum", "Not"];

      const wrapper = document.createElement("div");
      wrapper.style.cssText = "background:#fff;width:1100px;min-width:1100px;padding:20px 24px;font-family:sans-serif;";
      wrapper.innerHTML = `
        <!-- Header -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
          <div>
            <div style="font-size:9px;font-weight:700;color:#c4111d;letter-spacing:2px;text-transform:uppercase;margin-bottom:2px;">BEYLERBEYİ AKADEMİ</div>
            <div style="font-size:17px;font-weight:800;color:#1a1a2e;">${title}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:11px;color:#8c919a;">Oluşturulma: ${now}</div>
            <div style="font-size:12px;font-weight:700;color:#1a1a2e;margin-top:2px;">${isScouted ? filteredScouted.length : filteredTrial.length} kayıt</div>
          </div>
        </div>
        <div style="height:2px;background:linear-gradient(to right,#c4111d,#1a1a2e);border-radius:2px;margin-bottom:14px;"></div>
        <!-- Tablo -->
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead>
            <tr style="background:#1a1a2e;">
              ${headerCells.map(h => `<th style="padding:8px 10px;text-align:left;font-size:10px;font-weight:700;color:rgba(255,255,255,0.8);letter-spacing:0.5px;white-space:nowrap;">${h}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || `<tr><td colspan="${headerCells.length}" style="padding:20px;text-align:center;color:#8c919a;">Kayıt bulunamadı</td></tr>`}
          </tbody>
        </table>
        <!-- Footer -->
        <div style="margin-top:14px;padding-top:8px;border-top:1px solid #e2e5e9;display:flex;justify-content:space-between;align-items:center;">
          <div style="font-size:10px;color:#9ca3af;">Beylerbeyi Akademi — Oyuncu Havuzu</div>
          <div style="font-size:10px;color:#9ca3af;">${now}</div>
        </div>
      `;

      document.body.appendChild(wrapper);
      const canvas = await html2canvas(wrapper, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });
      document.body.removeChild(wrapper);

      const imgW = canvas.width;
      const imgH = canvas.height;
      const orientation = imgW >= imgH ? "landscape" : "portrait";
      const pdf = new jsPDF({ orientation, unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const scale = Math.min((pageW - margin * 2) / imgW, (pageH - margin * 2) / imgH);
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", margin, margin, imgW * scale, imgH * scale);

      const fileName = isScouted ? "izlenen-oyuncular.pdf" : "deneme-oyunculari.pdf";
      pdf.save(fileName);
    } catch (e) {
      console.error("PDF oluşturulamadı:", e);
    } finally {
      setPdfLoading(false);
    }
  }

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Başlık */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1a1a2e]">Oyuncu Havuzu</h1>
          <p className="text-sm text-[#8c919a] font-medium mt-0.5">
            İzlenen ve denemeye çıkarılan oyuncuların takibi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportPDF}
            disabled={pdfLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#e2e5e9] hover:border-[#c4111d]/30 hover:text-[#c4111d] text-[#5a6170] text-sm font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pdfLoading ? (
              <div className="w-4 h-4 border-2 border-[#c4111d] border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileDown size={16} />
            )}
            <span className="hidden sm:inline">PDF</span>
          </button>
          {canEdit && (
            <button
              onClick={() =>
                activeTab === "scouted"
                  ? setScoutedForm(emptyScoutedPlayer())
                  : setTrialForm(emptyTrialPlayer(activeSeason))
              }
              className="flex items-center gap-2 px-4 py-2.5 bg-[#c4111d] hover:bg-[#9b0d16] text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm shadow-[#c4111d]/25"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">{activeTab === "scouted" ? "İzlenen Oyuncu Ekle" : "Deneme Oyuncusu Ekle"}</span>
              <span className="sm:hidden">Ekle</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs + Filtreler */}
      <div className="bg-white border border-[#e2e5e9] rounded-xl p-3 space-y-3">
        {/* Tab seçici */}
        <div className="flex gap-1 bg-[#f1f3f5] rounded-lg p-1 w-fit">
          <button
            onClick={() => { setActiveTab("scouted"); setSearch(""); }}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-all duration-200 flex items-center gap-2 ${
              activeTab === "scouted" ? "bg-white text-[#c4111d] shadow-sm" : "text-[#5a6170] hover:text-[#1a1a2e]"
            }`}
          >
            <Eye size={14} />
            İzlenen Oyuncular
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeTab === "scouted" ? "bg-[#c4111d]/10 text-[#c4111d]" : "bg-[#e2e5e9] text-[#5a6170]"}`}>
              {scoutedPlayers.length}
            </span>
          </button>
          <button
            onClick={() => { setActiveTab("trial"); setSearch(""); setStatusFilter("ALL"); }}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-all duration-200 flex items-center gap-2 ${
              activeTab === "trial" ? "bg-white text-[#c4111d] shadow-sm" : "text-[#5a6170] hover:text-[#1a1a2e]"
            }`}
          >
            <Users size={14} />
            Deneme Oyuncuları
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeTab === "trial" ? "bg-[#c4111d]/10 text-[#c4111d]" : "bg-[#e2e5e9] text-[#5a6170]"}`}>
              {trialPlayers.length}
            </span>
          </button>
        </div>

        {/* Filtre satırı */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Sezon + Durum filtresi - sadece deneme tab */}
          {activeTab === "trial" && (
            <div className="flex flex-wrap gap-2">
              {/* Sezon filtresi */}
              <div className="relative">
                <select
                  value={seasonFilter}
                  onChange={(e) => setSeasonFilter(e.target.value)}
                  className="appearance-none pl-3 pr-7 py-1.5 rounded-lg border border-[#e2e5e9] bg-white text-xs font-semibold text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#c4111d]/20 cursor-pointer"
                >
                  <option value="ALL">Tüm Sezonlar</option>
                  {seasons.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8c919a] pointer-events-none" />
              </div>
              {/* Durum filtresi */}
              <div className="flex gap-1 bg-[#f1f3f5] rounded-lg p-1">
                {(["ALL", "olumlu", "olumsuz", "beklemede"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 whitespace-nowrap ${
                      statusFilter === s ? "bg-white text-[#c4111d] shadow-sm" : "text-[#5a6170] hover:text-[#1a1a2e]"
                    }`}
                  >
                    {s === "ALL" ? "Tümü" : STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Arama */}
          <div className="flex-1 relative max-w-sm">
            <input
              type="text"
              className="w-full px-3 py-2 rounded-lg border border-[#e2e5e9] bg-white text-sm text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#c4111d]/30 pl-9"
              placeholder="Oyuncu, takım, mevki ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#c4111d] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* İzlenen Oyuncular Tablosu */}
      {activeTab === "scouted" && (
        <div className="bg-white border border-[#e2e5e9] rounded-xl overflow-hidden">
          {scoutedLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-[#e2e5e9] border-t-[#c4111d] rounded-full animate-spin mb-3" />
              <p className="text-sm text-[#5a6170]">Yükleniyor...</p>
            </div>
          ) : filteredScouted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-14 h-14 rounded-2xl bg-[#f1f3f5] flex items-center justify-center mb-3">
                <Eye size={24} className="text-[#8c919a]" />
              </div>
              <p className="text-sm font-medium text-[#5a6170]">Kayıt bulunamadı</p>
              {canEdit && (
                <button
                  onClick={() => setScoutedForm(emptyScoutedPlayer())}
                  className="mt-3 text-xs text-[#c4111d] font-semibold hover:underline"
                >
                  İlk kaydı ekle
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#f8f9fb] border-b border-[#e2e5e9]">
                    {["Ad Soyad", "Doğum Tarihi", "Takım", "Mevki", "Referans", "Kayıt Alan", "Kayıt Tarihi"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#8c919a] uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredScouted.map((p) => (
                    <TableRow
                      key={p.id}
                      onView={() => setSelectedScouted(p)}
                      cells={[
                        <span className="font-semibold text-[#1a1a2e]">{p.firstName} {p.lastName}</span>,
                        <span className="text-[#5a6170]">{formatDate(p.birthDate)}<span className="text-[#8c919a] text-xs ml-1">({calcAge(p.birthDate)} yaş)</span></span>,
                        <span className="text-[#5a6170]">{p.currentTeam || "-"}</span>,
                        <span className="text-[#5a6170]">{p.position || "-"}</span>,
                        <span className="text-[#5a6170]">{p.referencePerson || "-"}</span>,
                        <span className="text-[#5a6170]">{p.recordedBy || "-"}</span>,
                        <span className="text-[#8c919a] text-xs">{formatDate(p.createdAt)}</span>,
                      ]}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Deneme Oyuncuları Tablosu */}
      {activeTab === "trial" && (
        <div className="bg-white border border-[#e2e5e9] rounded-xl overflow-hidden">
          {trialLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-[#e2e5e9] border-t-[#c4111d] rounded-full animate-spin mb-3" />
              <p className="text-sm text-[#5a6170]">Yükleniyor...</p>
            </div>
          ) : filteredTrial.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-14 h-14 rounded-2xl bg-[#f1f3f5] flex items-center justify-center mb-3">
                <Users size={24} className="text-[#8c919a]" />
              </div>
              <p className="text-sm font-medium text-[#5a6170]">Kayıt bulunamadı</p>
              {canEdit && (
                <button
                  onClick={() => setTrialForm(emptyTrialPlayer())}
                  className="mt-3 text-xs text-[#c4111d] font-semibold hover:underline"
                >
                  İlk kaydı ekle
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#f8f9fb] border-b border-[#e2e5e9]">
                    {["Ad Soyad", "Doğum Tarihi", "Takım", "Mevki", "Sezon", "Yaş Grubu", "Deneme Tarihi", "Referans", "Durum"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#8c919a] uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTrial.map((p) => (
                    <TableRow
                      key={p.id}
                      onView={() => setSelectedTrial(p)}
                      cells={[
                        <span className="font-semibold text-[#1a1a2e]">{p.firstName} {p.lastName}</span>,
                        <span className="text-[#5a6170]">{formatDate(p.birthDate)}<span className="text-[#8c919a] text-xs ml-1">({calcAge(p.birthDate)} yaş)</span></span>,
                        <span className="text-[#5a6170]">{p.currentTeam || "-"}</span>,
                        <span className="text-[#5a6170]">{p.position || "-"}</span>,
                        <span className="font-medium text-[#c4111d] text-xs">{p.trialSeason || "-"}</span>,
                        <span className="font-medium text-[#1a1a2e]">{p.trialAgeGroup || "-"}</span>,
                        <span className="text-[#5a6170]">{formatDate(p.trialDate)}</span>,
                        <span className="text-[#5a6170]">{p.referencePerson || "-"}</span>,
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[p.status]}`}>
                          {STATUS_ICONS[p.status]}
                          {STATUS_LABELS[p.status]}
                        </span>,
                      ]}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===== Modaller ===== */}

      {/* Scouted Form */}
      {scoutedForm !== null && (
        <ScoutedFormModal
          initial={scoutedForm}
          onClose={() => setScoutedForm(null)}
          onSave={handleSaveScouted}
          saving={scoutedSaving}
        />
      )}

      {/* Scouted Detail */}
      {selectedScouted && !scoutedForm && (
        <ScoutedDetailModal
          player={selectedScouted}
          onClose={() => setSelectedScouted(null)}
          onEdit={() => {
            setScoutedForm({ ...selectedScouted });
            setSelectedScouted(null);
          }}
          onDelete={() => setDeletingScouted(selectedScouted)}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      )}

      {/* Scouted Delete Confirm */}
      {deletingScouted && (
        <DeleteConfirmModal
          name={`${deletingScouted.firstName} ${deletingScouted.lastName}`}
          onConfirm={handleDeleteScouted}
          onCancel={() => setDeletingScouted(null)}
          deleting={scoutedDeleting}
        />
      )}

      {/* Trial Form */}
      {trialForm !== null && (
        <TrialFormModal
          initial={trialForm}
          ageGroups={ageGroups}
          seasons={seasons}
          onClose={() => setTrialForm(null)}
          onSave={handleSaveTrial}
          saving={trialSaving}
        />
      )}

      {/* Trial Detail */}
      {selectedTrial && !trialForm && (
        <TrialDetailModal
          player={selectedTrial}
          onClose={() => setSelectedTrial(null)}
          onEdit={() => {
            setTrialForm({ ...selectedTrial });
            setSelectedTrial(null);
          }}
          onDelete={() => setDeletingTrial(selectedTrial)}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      )}

      {/* Trial Delete Confirm */}
      {deletingTrial && (
        <DeleteConfirmModal
          name={`${deletingTrial.firstName} ${deletingTrial.lastName}`}
          onConfirm={handleDeleteTrial}
          onCancel={() => setDeletingTrial(null)}
          deleting={trialDeleting}
        />
      )}
    </div>
  );
}
