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
import { UserRole } from "@/types/userRole";
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
  const [activeTab, setActiveTab] = useState<string>("positions");
  const [newValue, setNewValue] = useState("");
  // Kullanıcı yönetimi için ek state
  const [users, setUsers] = useState<SupabaseUser[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [userRoleToAdd, setUserRoleToAdd] = useState("oyuncu");
  const [userSaveLoading, setUserSaveLoading] = useState<string | null>(null);
  const [userError, setUserError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

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

  const isLookupTab = activeTab !== "users";
  const tab: TabConfig | undefined = isLookupTab ? TABS.find(t => t.key === activeTab) : undefined;
  const items: LookupItem[] = isLookupTab && tab && tab.table ? lookups[activeTab as keyof typeof TAB_META] ?? [] : [];

  // Sadece yönetici erişebilir
  if (userRole?.role !== "yonetici") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-2xl font-bold text-[#c4111d] mb-2">Erişim Engellendi</div>
        <div className="text-[#5a6170] text-sm">Bu sayfaya sadece yöneticiler erişebilir.</div>
      </div>
    );
  }

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
          Yaş grubu, pozisyon, ayak, sezon ve kullanıcı yönetimini buradan yapabilirsiniz.
        </p>
      </div>

      {/* Sekmeler */}
      <div className="flex gap-2 border-b border-[#e2e5e9] mb-4">
        {TABS.map((tabItem) => (
          <button
            key={tabItem.key}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${activeTab === tabItem.key ? "border-[#c4111d] text-[#c4111d] bg-white" : "border-transparent text-[#8c919a] bg-[#f8f9fb] hover:text-[#1a1a2e]"}`}
            onClick={() => setActiveTab(tabItem.key)}
          >
            <tabItem.icon size={16} className="inline mr-1 align-text-bottom" />
            {tabItem.label}
          </button>
        ))}
      </div>

      {/* Lookup Tabları */}
      {isLookupTab && (
        <>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder={tab?.placeholder}
              className="px-3 py-2 rounded-lg border border-[#e2e5e9] text-sm focus:outline-none focus:ring-2 focus:ring-[#c4111d]/20"
              disabled={saving}
            />
            <button
              onClick={handleAdd}
              disabled={saving || !newValue.trim()}
              className="px-4 py-2 rounded-lg bg-[#c4111d] text-white text-sm font-semibold hover:bg-[#a30e17] transition-colors disabled:opacity-50"
            >
              <Plus size={16} className="inline mr-1 align-text-bottom" /> Ekle
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-2.5 text-left border-b border-[#e2e5e9]">Sıra</th>
                  <th className="px-4 py-2.5 text-left border-b border-[#e2e5e9]">Değer</th>
                  <th className="px-4 py-2.5 text-left border-b border-[#e2e5e9]">Eylem</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-[#f8f9fb] transition-colors group">
                    <td className="align-middle">
                      <div className="flex flex-col gap-0.5">
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
                    </td>
                    <td className="align-middle">
                      <div className="flex items-center gap-2">
                        <GripVertical size={16} className="text-[#e2e5e9] shrink-0" />
                        {editingId === item.id ? (
                          <>
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
                          </>
                        ) : (
                          <>
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
                          </>
                        )}
                      </div>
                    </td>
                    <td className="align-middle">
                      {editingId !== item.id && userRole?.role !== "oyuncu" && (
                        <>
                          {deleteConfirm === item.id ? (
                            <div className="flex items-center gap-1">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Bilgi notu */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 mt-4">
            <p className="text-xs text-blue-700 leading-relaxed">
              <strong>Not:</strong> Burada yapılan değişiklikler oyuncu ekleme/düzenleme formlarındaki
              ve filtre seçeneklerindeki açılır listelere yansır. Bir değeri silmek, mevcut
              oyunculardaki kaydedilmiş veriyi etkilemez.
            </p>
          </div>
        </>
      )}

      {/* Kullanıcı Yönetimi Sekmesi */}
      {!isLookupTab && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="text-lg font-bold text-[#1a1a2e]">Kullanıcı Yönetimi</h2>
            <form
              className="flex flex-col sm:flex-row gap-2 items-center"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!userEmail.trim()) return;
                setUserSaveLoading("add");
                setUserError(null);
                try {
                  await inviteUserWithRole(userEmail.trim(), userRoleToAdd as UserRole);
                  setUserEmail("");
                  setUserRoleToAdd("oyuncu");
                  await loadUsers();
                } catch (err: any) {
                  setUserError(err?.message || "Kullanıcı eklenemedi");
                } finally {
                  setUserSaveLoading(null);
                }
              }}
            >
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="E-posta ile kullanıcı davet et"
                className="px-3 py-2 rounded-lg border border-[#e2e5e9] text-sm focus:outline-none focus:ring-2 focus:ring-[#c4111d]/20"
                required
                disabled={userSaveLoading === "add"}
              />
              <select
                value={userRoleToAdd}
                onChange={(e) => setUserRoleToAdd(e.target.value)}
                className="px-3 py-2 rounded-lg border border-[#e2e5e9] text-sm"
                disabled={userSaveLoading === "add"}
              >
                <option value="oyuncu">Oyuncu</option>
                <option value="antrenor">Antrenör</option>
                <option value="yonetici">Yönetici</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#c4111d] text-white text-sm font-semibold hover:bg-[#a30e17] transition-colors disabled:opacity-50"
                disabled={userSaveLoading === "add"}
              >
                <Plus size={16} className="inline mr-1 align-text-bottom" /> Davet Et
              </button>
            </form>
          </div>
          {userError && <div className="text-xs text-red-500">{userError}</div>}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-2.5 text-left border-b border-[#e2e5e9]">E-posta</th>
                  <th className="px-4 py-2.5 text-left border-b border-[#e2e5e9]">Rol</th>
                  <th className="px-4 py-2.5 text-left border-b border-[#e2e5e9]">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-[#f8f9fb] transition-colors group">
                    <td className="align-middle">{user.email}</td>
                    <td className="align-middle">
                      <select
                        value={user.role}
                        onChange={async (e) => {
                          setUserSaveLoading(user.id);
                          setUserError(null);
                          try {
                            await updateUserRole(user.id, e.target.value as UserRole);
                            await loadUsers();
                          } catch (err: any) {
                            setUserError(err?.message || "Rol güncellenemedi");
                          } finally {
                            setUserSaveLoading(null);
                          }
                        }}
                        className="px-2 py-1 rounded border border-[#e2e5e9] text-sm"
                        disabled={userSaveLoading === user.id}
                      >
                        <option value="oyuncu">Oyuncu</option>
                        <option value="antrenor">Antrenör</option>
                        <option value="yonetici">Yönetici</option>
                      </select>
                    </td>
                    <td className="align-middle">
                      {/* Kullanıcı silme veya diğer işlemler eklenebilir */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
