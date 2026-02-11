"use client";

import { useState, useEffect } from "react";
import { Player, AgeGroup, Position, Foot } from "@/types/player";
import { X } from "lucide-react";

const AGE_GROUPS: AgeGroup[] = ["U14", "U15", "U16", "U17", "U19"];
const POSITIONS: Position[] = ["Kaleci", "Defans", "Orta Saha", "Forvet"];
const FEET: Foot[] = ["Sağ", "Sol", "Her İkisi"];

interface PlayerFormModalProps {
  player?: Player | null;
  onClose: () => void;
  onSave: (player: Player) => void;
}

const defaultStats = { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, goalsConceded: 0, cleanSheets: 0, minutesPlayed: 0 };
const defaultTactical = { positioning: 5, passing: 5, crossing: 5, shooting: 5, dribbling: 5, heading: 5, tackling: 5, marking: 5, gameReading: 5 };
const defaultAthletic = { speed: 5, strength: 5, stamina: 5, agility: 5, jumping: 5, balance: 5, flexibility: 5 };

export default function PlayerFormModal({ player, onClose, onSave }: PlayerFormModalProps) {
  const isEdit = !!player;

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    ageGroup: "U15" as AgeGroup,
    position: "Orta Saha" as Position,
    foot: "Sağ" as Foot,
    jerseyNumber: 1,
    height: 165,
    weight: 55,
    phone: "",
    parentPhone: "",
    notes: "",
    stats: { ...defaultStats },
    tactical: { ...defaultTactical },
    athletic: { ...defaultAthletic },
  });

  const [activeTab, setActiveTab] = useState<"general" | "stats" | "tactical" | "athletic">("general");

  useEffect(() => {
    if (player) {
      setForm({
        firstName: player.firstName,
        lastName: player.lastName,
        birthDate: player.birthDate,
        ageGroup: player.ageGroup,
        position: player.position,
        foot: player.foot,
        jerseyNumber: player.jerseyNumber,
        height: player.height,
        weight: player.weight,
        phone: player.phone || "",
        parentPhone: player.parentPhone || "",
        notes: player.notes || "",
        stats: { ...player.stats },
        tactical: { ...player.tactical },
        athletic: { ...player.athletic },
      });
    }
  }, [player]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString().split("T")[0];
    const saved: Player = {
      id: player?.id || crypto.randomUUID(),
      ...form,
      photo: player?.photo,
      createdAt: player?.createdAt || now,
      updatedAt: now,
    };
    onSave(saved);
  };

  const updateField = (field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateStat = (field: string, value: number) => {
    setForm((prev) => ({ ...prev, stats: { ...prev.stats, [field]: value } }));
  };

  const updateTactical = (field: string, value: number) => {
    setForm((prev) => ({ ...prev, tactical: { ...prev.tactical, [field]: value } }));
  };

  const updateAthletic = (field: string, value: number) => {
    setForm((prev) => ({ ...prev, athletic: { ...prev.athletic, [field]: value } }));
  };

  const tabs = [
    { key: "general", label: "Genel" },
    { key: "stats", label: "İstatistikler" },
    { key: "tactical", label: "Taktik" },
    { key: "athletic", label: "Atletik" },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md transition-all duration-300" onClick={onClose} />

      <div className="relative bg-gradient-to-br from-white via-[#f6f8fa] to-[#eaf0f6] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-[#e5e7eb]/60 animate-slide-in-up">
        {/* Header */}
        <div className="border-b border-[#e5e7eb]/60 px-8 py-6 flex items-center justify-between rounded-t-3xl shrink-0 bg-white/80 backdrop-blur-xl shadow-sm">
          <h2 className="text-xl font-bold text-[#1a1a1a]">
            {isEdit ? "Oyuncu Düzenle" : "Yeni Oyuncu Ekle"}
          </h2>
          <button onClick={onClose} className="p-3 hover:bg-[#f6f8fa] rounded-xl transition-all duration-300 text-[#57606a]">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-[#e5e7eb]/60 px-8 flex gap-2 shrink-0 bg-white/80 backdrop-blur-xl">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all duration-300 rounded-t-lg ${
                activeTab === t.key
                  ? "border-[#c4111d] text-[#c4111d] bg-gradient-to-r from-[#c4111d]/10 to-[#a50e18]/10 shadow-md"
                  : "border-transparent text-[#57606a] hover:text-[#1a1a1a]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Form content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8">
          {activeTab === "general" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <Field label="Ad" value={form.firstName} onChange={(v) => updateField("firstName", v)} required />
                <Field label="Soyad" value={form.lastName} onChange={(v) => updateField("lastName", v)} required />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <Field label="Doğum Tarihi" value={form.birthDate} onChange={(v) => updateField("birthDate", v)} type="date" required />
                <SelectField label="Yaş Grubu" value={form.ageGroup} onChange={(v) => updateField("ageGroup", v)} options={AGE_GROUPS} />
              </div>
              <div className="grid grid-cols-3 gap-6">
                <SelectField label="Pozisyon" value={form.position} onChange={(v) => updateField("position", v)} options={POSITIONS} />
                <SelectField label="Ayak" value={form.foot} onChange={(v) => updateField("foot", v)} options={FEET} />
                <NumberField label="Forma No" value={form.jerseyNumber} onChange={(v) => updateField("jerseyNumber", v)} min={1} max={99} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <NumberField label="Boy (cm)" value={form.height} onChange={(v) => updateField("height", v)} min={100} max={220} />
                <NumberField label="Kilo (kg)" value={form.weight} onChange={(v) => updateField("weight", v)} min={30} max={120} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <Field label="Telefon" value={form.phone} onChange={(v) => updateField("phone", v)} />
                <Field label="Veli Telefonu" value={form.parentPhone} onChange={(v) => updateField("parentPhone", v)} />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-[#24292f] mb-2">Notlar</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/80 border border-[#d0d7de]/60 rounded-xl text-[#1a1a1a] text-base focus:outline-none focus:border-[#c4111d] focus:ring-2 focus:ring-[#c4111d]/15 transition-all duration-300 resize-none shadow-sm"
                />
              </div>
            </div>
          )}

          {activeTab === "stats" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <NumberField label="Maç Sayısı" value={form.stats.matches} onChange={(v) => updateStat("matches", v)} min={0} />
                <NumberField label="Oynanan Dakika" value={form.stats.minutesPlayed} onChange={(v) => updateStat("minutesPlayed", v)} min={0} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <NumberField label="Gol" value={form.stats.goals} onChange={(v) => updateStat("goals", v)} min={0} />
                <NumberField label="Asist" value={form.stats.assists} onChange={(v) => updateStat("assists", v)} min={0} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <NumberField label="Sarı Kart" value={form.stats.yellowCards} onChange={(v) => updateStat("yellowCards", v)} min={0} />
                <NumberField label="Kırmızı Kart" value={form.stats.redCards} onChange={(v) => updateStat("redCards", v)} min={0} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <NumberField label="Yenilen Gol (Kaleci)" value={form.stats.goalsConceded} onChange={(v) => updateStat("goalsConceded", v)} min={0} />
                <NumberField label="Clean Sheet (Kaleci)" value={form.stats.cleanSheets} onChange={(v) => updateStat("cleanSheets", v)} min={0} />
              </div>
            </div>
          )}

          {activeTab === "tactical" && (
            <div className="space-y-4">
              {([
                ["positioning", "Pozisyon Alma"],
                ["passing", "Pas"],
                ["crossing", "Orta"],
                ["shooting", "Şut"],
                ["dribbling", "Dribling"],
                ["heading", "Kafa Vuruşu"],
                ["tackling", "Top Kesme"],
                ["marking", "Markaj"],
                ["gameReading", "Oyun Okuma"],
              ] as const).map(([key, label]) => (
                <SliderField
                  key={key}
                  label={label}
                  value={form.tactical[key]}
                  min={1}
                  max={10}
                  onChange={(v) => updateTactical(key, v)}
                />
              ))}
            </div>
          )}

          {activeTab === "athletic" && (
            <div className="space-y-4">
              {([
                ["speed", "Hız"],
                ["strength", "Güç"],
                ["stamina", "Dayanıklılık"],
                ["agility", "Çeviklik"],
                ["jumping", "Sıçrama"],
                ["balance", "Denge"],
                ["flexibility", "Esneklik"],
              ] as const).map(([key, label]) => (
                <SliderField
                  key={key}
                  label={label}
                  value={form.athletic[key]}
                  min={1}
                  max={10}
                  onChange={(v) => updateAthletic(key, v)}
                />
              ))}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="border-t border-[#e5e7eb]/60 px-8 py-6 flex justify-end gap-4 shrink-0 rounded-b-3xl bg-white/80 backdrop-blur-xl shadow-sm">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-base font-medium text-[#57606a] bg-[#f6f8fa] hover:bg-[#e5e7eb] rounded-xl transition-all duration-300"
          >
            İptal
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-6 py-2 text-base font-semibold text-white bg-gradient-to-r from-[#c4111d] to-[#a50e18] hover:from-[#a50e18] hover:to-[#c4111d] rounded-xl transition-all duration-300 shadow-md"
          >
            {isEdit ? "Güncelle" : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* Reusable form fields */
function Field({
  label, value, onChange, type = "text", required,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-[#24292f] mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-3 py-2 bg-white border border-[#d0d7de] rounded-lg text-[#1a1a1a] text-sm focus:outline-none focus:border-[#c4111d] focus:ring-2 focus:ring-[#c4111d]/15 transition-all"
      />
    </div>
  );
}

function NumberField({
  label, value, onChange, min, max,
}: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number;
}) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-[#24292f] mb-1.5">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        className="w-full px-3 py-2 bg-white border border-[#d0d7de] rounded-lg text-[#1a1a1a] text-sm focus:outline-none focus:border-[#c4111d] focus:ring-2 focus:ring-[#c4111d]/15 transition-all"
      />
    </div>
  );
}

function SelectField({
  label, value, onChange, options,
}: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-[#24292f] mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-white border border-[#d0d7de] rounded-lg text-[#1a1a1a] text-sm focus:outline-none focus:border-[#c4111d] focus:ring-2 focus:ring-[#c4111d]/15 transition-all"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function SliderField({
  label, value, onChange,
}: {
  label: string; value: number; onChange: (v: number) => void;
}) {
  const color =
    value >= 8 ? "text-green-600" : value >= 6 ? "text-amber-600" : value >= 4 ? "text-orange-600" : "text-red-500";
  return (
    <div className="flex items-center gap-3">
      <span className="text-[12px] text-[#57606a] font-medium w-28 shrink-0">{label}</span>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-2 accent-[#c4111d]"
      />
      <span className={`text-sm font-bold w-8 text-right ${color}`}>{value}</span>
    </div>
  );
}
