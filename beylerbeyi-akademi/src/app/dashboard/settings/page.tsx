"use client";

import React, { useState } from "react";
import { useAppData } from "@/lib/app-data";
import {
  addLookupItem,
  updateLookupItem,
  deleteLookupItem,
  LookupItem,
} from "@/lib/supabase/lookups";
import { fetchAllUsersWithRoles, inviteUserWithRole, updateUserRole, SupabaseUser } from "@/lib/supabase/users";
import { createClient } from "@/lib/supabase/client";
import {
  Plus,
  Trash2,
  GripVertical,
  Save,
  X,
  Shield,
  Footprints,
  Users,
  Calendar,
  Loader2,
  CheckCircle2,
} from "lucide-react";

/* ────────── Tablo adı eşlemeleri ────────── */

type LookupTable =
  | "lookup_positions"
  | "lookup_feet"
  | "lookup_age_groups"
  | "lookup_seasons"
  | "lookup_participation_statuses";

type TabKey = keyof typeof TAB_META | "users";
interface TabConfig {
  key: string;
  table?: LookupTable;
  label: string;
  icon: React.ElementType;
  placeholder: string;
}

const TAB_META = {
  positions:  { table: "lookup_positions"  as LookupTable, label: "Pozisyonlar",           icon: Shield,        placeholder: "Yeni pozisyon (örn: Bek)" },
  feet:       { table: "lookup_feet"       as LookupTable, label: "Ayak",                   icon: Footprints,    placeholder: "Yeni ayak tercihi" },
  ageGroups:  { table: "lookup_age_groups" as LookupTable, label: "Yaş Grupları",           icon: Users,         placeholder: "Yeni yaş grubu (örn: U13)" },
  seasons:    { table: "lookup_seasons"    as LookupTable, label: "Sezonlar",               icon: Calendar,      placeholder: "Yeni sezon (örn: 2026-2027)" },
  participationStatuses: { table: "lookup_participation_statuses" as LookupTable, label: "Katılım Durumu", icon: CheckCircle2, placeholder: "Yeni katılım durumu" },
} as const;

const TABS: TabConfig[] = [
  ...Object.entries(TAB_META).map(([key, val]) => ({
    key,
    ...val,
  })),
  { key: "users", label: "Kullanıcılar", icon: Users, placeholder: "" },
];

/* ════════════════════════════════════════ */
/*              SAYFA                      */
/* ════════════════════════════════════════ */
export default function SettingsPage() {
  const { lookups, refreshLookups, loading, userRole } = useAppData();

  // Sadece yönetici erişebilir
  if (userRole?.role !== "yonetici") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-2xl font-bold text-[#c4111d] mb-2">Erişim Engellendi</div>
        <div className="text-[#5a6170] text-sm">Bu sayfaya sadece yöneticiler erişebilir.</div>
      </div>
    );
  }
  const [activeTab, setActiveTab] = useState<string>("positions");
  const [newValue, setNewValue] = useState("");
  // Kullanıcı yönetimi için ek state
  const [users, setUsers] = useState<SupabaseUser[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [userRoleToAdd, setUserRoleToAdd] = useState("oyuncu");
  const [userSaveLoading, setUserSaveLoading] = useState<string | null>(null);
  const [userError, setUserError] = useState<string | null>(null);
  // Kullanıcıları yükle
  const loadUsers = async () => {
    // Yönetici ise tüm kullanıcıları, antrenör ise sadece kendi yaş grubunu görür
    if (userRole?.role === "yonetici") {
      const data = await fetchAllUsersWithRoles();
      setUsers(data);
    } else if (userRole?.role === "antrenor" && userRole.age_group) {
      const data = await fetchAllUsersWithRoles(userRole.age_group);
      setUsers(data);
    } else {
      setUsers([]);
    }
  };
  // Kullanıcı sekmesine geçince yükle
  React.useEffect(() => {
    if (activeTab === "users" && (userRole?.role === "yonetici" || userRole?.role === "antrenor")) {
      loadUsers();
    }
    // eslint-disable-next-line
  }, [activeTab, userRole]);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const isLookupTab = activeTab !== "users";
  const tab: TabConfig | undefined = isLookupTab ? TABS.find(t => t.key === activeTab) : undefined;
  const items: LookupItem[] = isLookupTab && tab && tab.table ? lookups[activeTab as keyof typeof TAB_META] ?? [] : [];

  /* ── Yeni ekle ── */
  const handleAdd = async () => {
    if (!isLookupTab || !tab || !tab.table) return;
    const trimmed = newValue.trim();
    if (!trimmed) return;
    // Zaten var mı kontrol et
    if (items.some((i) => i.value.toLowerCase() === trimmed.toLowerCase())) return;
    setSaving(true);
    try {
      const maxSort = items.reduce((m, i) => Math.max(m, i.sortOrder), 0);
      await addLookupItem(tab.table, trimmed, maxSort + 1);
      await refreshLookups();
      setNewValue("");
    } catch (err: unknown) {
      const e = err as { message?: string; details?: string; code?: string };
      console.error("Ekleme hatası:", e?.message, e?.details, e?.code, err);
    } finally {
      setSaving(false);
    }
  };

  /* ── Güncelle ── */
  const handleUpdate = async (id: string) => {
    if (!isLookupTab || !tab || !tab.table) return;
    const trimmed = editValue.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await updateLookupItem(tab.table, id, { value: trimmed });
      await refreshLookups();
      setEditingId(null);
    } catch (err: unknown) {
      const e = err as { message?: string; details?: string; code?: string };
      console.error("Güncelleme hatası:", e?.message, e?.details, e?.code, err);
    } finally {
      setSaving(false);
    }
  };

  /* ── Sil ── */
  const handleDelete = async (id: string) => {
    if (!isLookupTab || !tab || !tab.table) return;
    setSaving(true);
    try {
      await deleteLookupItem(tab.table, id);
      await refreshLookups();
      setDeleteConfirm(null);
    } catch (err: unknown) {
      const e = err as { message?: string; details?: string; code?: string };
      console.error("Silme hatası:", e?.message, e?.details, e?.code, err);
    } finally {
      setSaving(false);
    }
  };

  /* ── Sıra değiştir ── */
  const handleMoveUp = async (index: number) => {
    if (!isLookupTab || !tab || !tab.table) return;
    if (index === 0) return;
    const current = items[index];
    const above = items[index - 1];
    setSaving(true);
    try {
      await Promise.all([
        updateLookupItem(tab.table, current.id, { sortOrder: above.sortOrder }),
        updateLookupItem(tab.table, above.id, { sortOrder: current.sortOrder }),
      ]);
      await refreshLookups();
    } catch (err: unknown) {
      const e = err as { message?: string; details?: string; code?: string };
      console.error("Sıra değiştirme hatası:", e?.message, e?.details, e?.code, err);
    } finally {
      setSaving(false);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (!isLookupTab || !tab || !tab.table) return;
    if (index >= items.length - 1) return;
    const current = items[index];
    const below = items[index + 1];
    setSaving(true);
    try {
      await Promise.all([
        updateLookupItem(tab.table, current.id, { sortOrder: below.sortOrder }),
        updateLookupItem(tab.table, below.id, { sortOrder: current.sortOrder }),
      ]);
      await refreshLookups();
    } catch (err: unknown) {
      const e = err as { message?: string; details?: string; code?: string };
      console.error("Sıra değiştirme hatası:", e?.message, e?.details, e?.code, err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#c4111d]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-xl font-bold text-[#1a1a2e]">Ayarlar</h1>
        <p className="text-sm text-[#8c919a] mt-1">
          Yaş grubu, pozisyon, ayak ve sezon bilgilerini buradan yönetebilirsiniz.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="px-4 py-2.5 text-left border-b border-[#e2e5e9]">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#1a1a2e]">Sıra</span>
                </div>
              </th>
              <th className="px-4 py-2.5 text-left border-b border-[#e2e5e9]">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#1a1a2e]">Değer</span>
                </div>
              </th>
              <th className="px-4 py-2.5 text-left border-b border-[#e2e5e9]">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#1a1a2e]">Eylem</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-[#f8f9fb] transition-colors group"
              >
                {/* Sıralama kontrolleri */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0 || saving}
                    className="p-0.5 rounded text-[#8c919a] hover:text-[#1a1a2e] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    title="Yukarı taşı"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 3L10 8H2L6 3Z" fill="currentColor" /></svg>
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index >= items.length - 1 || saving}
                    className="p-0.5 rounded text-[#8c919a] hover:text-[#1a1a2e] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    title="Aşağı taşı"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 9L2 4H10L6 9Z" fill="currentColor" /></svg>
                  </button>
                </div>

                <GripVertical size={16} className="text-[#e2e5e9] shrink-0" />

                {/* Değer */}
                {editingId === item.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      autoFocus
                      type="text"
                      value={editValue ?? ''}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUpdate(item.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-[#c4111d]/30 bg-white text-sm text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#c4111d]/20 transition-all"
                    />
                    <button
                      onClick={() => handleUpdate(item.id)}
                      disabled={saving}
                      className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                      title="Kaydet"
                    >
                      <Save size={16} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1.5 rounded-lg text-[#8c919a] hover:bg-[#f1f3f5] transition-colors"
                      title="İptal"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center gap-3">
                    <span
                      className="text-sm font-medium text-[#1a1a2e] cursor-pointer hover:text-[#c4111d] transition-colors"
                      onClick={() => {
                        setEditingId(item.id);
                        setEditValue(item.value);
                      }}
                      title="Düzenlemek için tıkla"
                    >
                      {item.value}
                    </span>
                    <span className="text-[10px] text-[#8c919a] bg-[#f1f3f5] px-2 py-0.5 rounded-full">
                      #{index + 1}
                    </span>
                  </div>
                )}

                {/* Silme */}
                {editingId !== item.id && userRole?.role !== "oyuncu" && (
                  <>
                    {deleteConfirm === item.id ? (
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-xs text-red-500 mr-1">Emin misiniz?</span>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={saving}
                          className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors"
                        >
                          Sil
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-2 py-1 rounded-lg bg-[#f1f3f5] text-[#5a6170] text-xs font-medium hover:bg-[#e2e5e9] transition-colors"
                        >
                          İptal
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(item.id)}
                        className="p-1.5 rounded-lg text-[#8c919a] opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 transition-all"
                        title="Sil"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bilgi notu */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <p className="text-xs text-blue-700 leading-relaxed">
          <strong>Not:</strong> Burada yapılan değişiklikler oyuncu ekleme/düzenleme formlarındaki
          ve filtre seçeneklerindeki açılır listelere yansır. Bir değeri silmek, mevcut
          oyunculardaki kaydedilmiş veriyi etkilemez.
        </p>
      </div>
    </div>
  );
}
