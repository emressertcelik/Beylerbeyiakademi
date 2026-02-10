"use client";

import { useState } from "react";
import type { Player } from "@/types/player";

interface Props {
  player?: Player | null;
  onSave: (data: Player) => void;
  onClose: () => void;
}

const POSITIONS = ["Kaleci", "Defans", "Orta Saha", "Forvet"];
const FEET = ["Sağ", "Sol", "Her İki"];
const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "0+", "0-"];
const STATUSES = [
  { value: "active", label: "Aktif" },
  { value: "S", label: "Sakat" },
  { value: "KY", label: "Kadro Dışı" },
  { value: "SA", label: "Sakatlık" },
  { value: "C", label: "Cezalı" },
  { value: "IZ", label: "İzinli" },
];

const GK_TECH = ["reflexes", "positioning", "distribution", "communication", "oneOnOne"];
const DEF_TECH = ["tackle", "marking", "heading", "passing", "positioning"];
const MID_TECH = ["passing", "vision", "dribbling", "shooting", "ballControl"];
const FWD_TECH = ["finishing", "positioning", "heading", "dribbling", "firstTouch"];
const PHYS_KEYS = ["speed", "stamina", "strength", "agility", "jumping"];

const TECH_LABELS: Record<string, string> = {
  reflexes: "Refleks", positioning: "Pozisyon", distribution: "Dağıtım", communication: "İletişim", oneOnOne: "Bire Bir",
  tackle: "Müdahale", marking: "Adam Takip", heading: "Kafa", passing: "Pas", vision: "Vizyon",
  dribbling: "Dribling", shooting: "Şut", ballControl: "Top Kontrolü", finishing: "Bitiricilik", firstTouch: "İlk Dokunuş",
};
const PHYS_LABELS: Record<string, string> = {
  speed: "Hız", stamina: "Dayanıklılık", strength: "Güç", agility: "Çeviklik", jumping: "Sıçrama",
};

function getTechKeys(pos: string) {
  switch (pos) {
    case "Kaleci": return GK_TECH;
    case "Defans": return DEF_TECH;
    case "Orta Saha": return MID_TECH;
    case "Forvet": return FWD_TECH;
    default: return MID_TECH;
  }
}

export default function PlayerFormModal({ player, onSave, onClose }: Props) {
  const isEdit = !!player;

  const [form, setForm] = useState({
    first_name: player?.first_name || "",
    last_name: player?.last_name || "",
    jersey_number: player?.jersey_number?.toString() || "",
    position: player?.position || "Orta Saha",
    foot: player?.foot || "Sağ",
    birth_date: player?.birth_date || "",
    tc_no: player?.tc_no || "",
    phone: player?.phone || "",
    parent_phone: player?.parent_phone || "",
    blood_type: player?.blood_type || "",
    height: player?.height?.toString() || "",
    weight: player?.weight?.toString() || "",
    school: player?.school || "",
    status: player?.status || "active",
    photo_url: player?.photo_url || "",
  });

  const [prevTeams, setPrevTeams] = useState<string[]>(player?.previous_teams || []);
  const [newTeam, setNewTeam] = useState("");

  const [technical, setTechnical] = useState<Record<string, number>>(
    player?.technical || Object.fromEntries(getTechKeys(form.position).map((k) => [k, 5]))
  );
  const [physical, setPhysical] = useState<Record<string, number>>(
    player?.physical || Object.fromEntries(PHYS_KEYS.map((k) => [k, 5]))
  );

  const [tab, setTab] = useState<"info" | "skills" | "teams">("info");

  const handlePositionChange = (pos: string) => {
    setForm((f) => ({ ...f, position: pos }));
    const keys = getTechKeys(pos);
    setTechnical((prev) => {
      const next: Record<string, number> = {};
      keys.forEach((k) => { next[k] = prev[k] ?? 5; });
      return next;
    });
  };

  const addTeam = () => {
    if (newTeam.trim() && !prevTeams.includes(newTeam.trim())) {
      setPrevTeams([...prevTeams, newTeam.trim()]);
      setNewTeam("");
    }
  };

  const removeTeam = (idx: number) => {
    setPrevTeams(prevTeams.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: Player = {
      id: player?.id || `new-${Date.now()}`,
      first_name: form.first_name,
      last_name: form.last_name,
      jersey_number: parseInt(form.jersey_number) || 0,
      position: form.position,
      foot: form.foot,
      birth_date: form.birth_date || undefined,
      tc_no: form.tc_no || undefined,
      phone: form.phone || undefined,
      parent_phone: form.parent_phone || undefined,
      blood_type: form.blood_type || undefined,
      height: form.height ? parseFloat(form.height) : undefined,
      weight: form.weight ? parseFloat(form.weight) : undefined,
      school: form.school || undefined,
      status: form.status,
      photo_url: form.photo_url || undefined,
      previous_teams: prevTeams,
      technical,
      physical,
    };
    onSave(data);
  };

  const techKeys = getTechKeys(form.position);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-[#c4111d] to-[#1b6e2a] px-6 py-4 text-white rounded-t-2xl flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold">{isEdit ? "Oyuncu Düzenle" : "Yeni Oyuncu Ekle"}</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#e5e7eb] px-6 flex-shrink-0">
          {([["info", "Kişisel Bilgiler"], ["skills", "Teknik & Fiziksel"], ["teams", "Önceki Takımlar"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                tab === key ? "border-[#1b6e2a] text-[#1b6e2a]" : "border-transparent text-[#8b949e] hover:text-[#1a1a1a]"
              }`}>{label}</button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {/* TAB: Kişisel Bilgiler */}
            {tab === "info" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Ad *" value={form.first_name} onChange={(v) => setForm({ ...form, first_name: v })} required />
                  <Field label="Soyad *" value={form.last_name} onChange={(v) => setForm({ ...form, last_name: v })} required />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Forma No *" value={form.jersey_number} onChange={(v) => setForm({ ...form, jersey_number: v })} type="number" required />
                  <Select label="Pozisyon *" value={form.position} onChange={handlePositionChange} options={POSITIONS} />
                  <Select label="Ayak" value={form.foot} onChange={(v) => setForm({ ...form, foot: v })} options={FEET} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Doğum Tarihi" value={form.birth_date} onChange={(v) => setForm({ ...form, birth_date: v })} type="date" />
                  <Field label="TC Kimlik No" value={form.tc_no} onChange={(v) => setForm({ ...form, tc_no: v })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Telefon" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} type="tel" />
                  <Field label="Veli Telefon" value={form.parent_phone} onChange={(v) => setForm({ ...form, parent_phone: v })} type="tel" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Select label="Kan Grubu" value={form.blood_type} onChange={(v) => setForm({ ...form, blood_type: v })} options={BLOOD_TYPES} allowEmpty />
                  <Field label="Boy (cm)" value={form.height} onChange={(v) => setForm({ ...form, height: v })} type="number" />
                  <Field label="Kilo (kg)" value={form.weight} onChange={(v) => setForm({ ...form, weight: v })} type="number" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Okul" value={form.school} onChange={(v) => setForm({ ...form, school: v })} />
                  <Select label="Durum" value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={STATUSES.map((s) => s.value)} optionLabels={STATUSES.map((s) => s.label)} />
                </div>
                <Field label="Fotoğraf URL" value={form.photo_url} onChange={(v) => setForm({ ...form, photo_url: v })} placeholder="https://..." />
              </>
            )}

            {/* TAB: Teknik & Fiziksel */}
            {tab === "skills" && (
              <>
                <div>
                  <h4 className="text-[11px] font-bold text-[#8b949e] uppercase tracking-wider mb-3">Teknik Özellikler ({form.position})</h4>
                  <div className="space-y-3">
                    {techKeys.map((key) => (
                      <SliderField key={key} label={TECH_LABELS[key] || key} value={technical[key] || 5}
                        onChange={(v) => setTechnical({ ...technical, [key]: v })} color="green" />
                    ))}
                  </div>
                </div>
                <div className="pt-2">
                  <h4 className="text-[11px] font-bold text-[#8b949e] uppercase tracking-wider mb-3">Fiziksel Özellikler</h4>
                  <div className="space-y-3">
                    {PHYS_KEYS.map((key) => (
                      <SliderField key={key} label={PHYS_LABELS[key] || key} value={physical[key] || 5}
                        onChange={(v) => setPhysical({ ...physical, [key]: v })} color="red" />
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* TAB: Önceki Takımlar */}
            {tab === "teams" && (
              <>
                <div className="flex gap-2">
                  <input type="text" value={newTeam} onChange={(e) => setNewTeam(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTeam(); } }}
                    placeholder="Takım adı yazın..."
                    className="flex-1 px-3 py-2 bg-white border border-[#d0d7de] rounded-lg text-sm placeholder-[#8b949e] focus:outline-none focus:border-[#1b6e2a] focus:ring-1 focus:ring-[#1b6e2a]/20" />
                  <button type="button" onClick={addTeam}
                    className="px-4 py-2 text-sm font-semibold text-white bg-[#1b6e2a] hover:bg-[#15591f] rounded-lg transition-colors">Ekle</button>
                </div>

                {prevTeams.length > 0 ? (
                  <div className="space-y-2">
                    {prevTeams.map((team, i) => (
                      <div key={i} className="flex items-center justify-between bg-[#f6f8fa] border border-[#e5e7eb] rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#e5e7eb] flex items-center justify-center">
                            <svg className="w-3 h-3 text-[#8b949e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M3 7v1a3 3 0 006 0V7m0 1a3 3 0 006 0V7m0 1a3 3 0 006 0V7H3l2-4h14l2 4" /></svg>
                          </div>
                          <span className="text-sm font-medium text-[#1a1a1a]">{team}</span>
                        </div>
                        <button type="button" onClick={() => removeTeam(i)} className="text-[#8b949e] hover:text-[#c4111d] transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#8b949e] text-center py-8">Henüz önceki takım eklenmemiş.</p>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#e5e7eb] flex items-center justify-between flex-shrink-0 bg-[#fafafa] rounded-b-2xl">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#57606a] hover:text-[#1a1a1a] bg-white border border-[#d0d7de] rounded-lg transition-colors">İptal</button>
            <button type="submit"
              className="px-6 py-2 text-sm font-semibold text-white bg-[#1b6e2a] hover:bg-[#15591f] rounded-lg transition-colors shadow-sm">
              {isEdit ? "Güncelle" : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ========== Alt Bileşenler ========== */

function Field({ label, value, onChange, type = "text", required, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-[#57606a] mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} placeholder={placeholder}
        className="w-full px-3 py-2 bg-white border border-[#d0d7de] rounded-lg text-sm text-[#1a1a1a] placeholder-[#8b949e] focus:outline-none focus:border-[#1b6e2a] focus:ring-1 focus:ring-[#1b6e2a]/20" />
    </div>
  );
}

function Select({ label, value, onChange, options, optionLabels, allowEmpty }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; optionLabels?: string[]; allowEmpty?: boolean;
}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-[#57606a] mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-white border border-[#d0d7de] rounded-lg text-sm text-[#1a1a1a] focus:outline-none focus:border-[#1b6e2a] focus:ring-1 focus:ring-[#1b6e2a]/20">
        {allowEmpty && <option value="">Seçiniz</option>}
        {options.map((opt, i) => (
          <option key={opt} value={opt}>{optionLabels ? optionLabels[i] : opt}</option>
        ))}
      </select>
    </div>
  );
}

function SliderField({ label, value, onChange, color }: {
  label: string; value: number; onChange: (v: number) => void; color: "green" | "red";
}) {
  const barBg = color === "green" ? "bg-[#1b6e2a]" : "bg-[#c4111d]";
  const accent = color === "green" ? "accent-[#1b6e2a]" : "accent-[#c4111d]";
  const textC = color === "green" ? "text-[#1b6e2a]" : "text-[#c4111d]";

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[#57606a] w-24 flex-shrink-0">{label}</span>
      <div className="flex-1 flex items-center gap-2">
        <input type="range" min="1" max="10" value={value} onChange={(e) => onChange(parseInt(e.target.value))}
          className={`flex-1 h-1.5 rounded-full appearance-none cursor-pointer ${accent}`}
          style={{ background: `linear-gradient(to right, ${color === "green" ? "#1b6e2a" : "#c4111d"} ${value * 10}%, #e5e7eb ${value * 10}%)` }} />
        <div className="flex items-center gap-1">
          <span className={`text-xs font-bold ${textC} w-5 text-right`}>{value}</span>
          <div className="h-2 w-8 bg-[#f0f0f0] rounded-full overflow-hidden">
            <div className={`h-full ${barBg} rounded-full`} style={{ width: `${value * 10}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
