"use client";

import { useState, useEffect } from "react";
import { Player, AgeGroup, Position, Foot } from "@/types/player";
import { useAppData } from "@/lib/app-data";
import { X, Plus, Trash2 } from "lucide-react";

interface PlayerFormModalProps {
  player?: Player | null;
  onClose: () => void;
  onSave: (player: Player) => void;
}

const defaultStats = { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, goalsConceded: 0, cleanSheets: 0, minutesPlayed: 0 };
const defaultTactical = { positioning: 5, passing: 5, crossing: 5, shooting: 5, dribbling: 5, heading: 5, tackling: 5, marking: 5, gameReading: 5 };
const defaultAthletic = { speed: 5, strength: 5, stamina: 5, agility: 5, jumping: 5, balance: 5, flexibility: 5 };

export default function PlayerFormModal({ player, onClose, onSave }: PlayerFormModalProps) {
  const { lookups } = useAppData();
  const AGE_GROUPS = lookups.ageGroups.filter((a) => a.isActive).map((a) => a.value);
  const POSITIONS = lookups.positions.filter((p) => p.isActive).map((p) => p.value);
  const FEET = lookups.feet.filter((f) => f.isActive).map((f) => f.value);
  const SEASONS = lookups.seasons.filter((s) => s.isActive).map((s) => s.value);
  const isEdit = !!player;

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    ageGroup: (AGE_GROUPS[0] ?? "U15") as AgeGroup,
    position: (POSITIONS[0] ?? "Kaleci") as Position,
    foot: (FEET[0] ?? "Sağ") as Foot,
    jerseyNumber: 1,
    height: 165,
    weight: 55,
    phone: "",
    parentPhone: "",
    notes: "",
    seasons: SEASONS.length > 0 ? [SEASONS[0]] : [] as string[],
    previousTeams: [] as { team: string; years: string }[],
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
        seasons: [...player.seasons],
        previousTeams: player.previousTeams ? [...player.previousTeams] : [],
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
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-[#e2e5e9] animate-slide-in-up">
        {/* Header */}
        <div className="border-b border-[#e2e5e9] px-6 py-5 flex items-center justify-between rounded-t-2xl shrink-0">
          <h2 className="text-lg font-bold text-[#1a1a2e]">
            {isEdit ? "Oyuncu Düzenle" : "Yeni Oyuncu Ekle"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-[#f1f3f5] rounded-lg transition-colors text-[#5a6170]">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-[#e2e5e9] px-6 flex gap-1 shrink-0">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 -mb-px ${
                activeTab === t.key
                  ? "border-[#c4111d] text-[#c4111d]"
                  : "border-transparent text-[#5a6170] hover:text-[#1a1a2e] hover:border-[#e2e5e9]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Form content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {activeTab === "general" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Ad" value={form.firstName} onChange={(v) => updateField("firstName", v)} required />
                <Field label="Soyad" value={form.lastName} onChange={(v) => updateField("lastName", v)} required />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Doğum Tarihi" value={form.birthDate} onChange={(v) => updateField("birthDate", v)} type="date" required />
                <SelectField label="Yaş Grubu" value={form.ageGroup} onChange={(v) => updateField("ageGroup", v)} options={AGE_GROUPS} />
                <div>
                  <label className="block text-xs font-medium text-[#5a6170] mb-1.5">Sezon</label>
                  <div className="flex flex-wrap gap-2">
                    {SEASONS.map((s) => {
                      const checked = form.seasons.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            if (checked) {
                              if (form.seasons.length > 1) {
                                updateField("seasons", form.seasons.filter((ss: string) => ss !== s));
                              }
                            } else {
                              updateField("seasons", [...form.seasons, s]);
                            }
                          }}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200 ${
                            checked
                              ? "bg-[#c4111d] text-white border-[#c4111d]"
                              : "bg-white text-[#5a6170] border-[#e2e5e9] hover:border-[#c4111d] hover:text-[#c4111d]"
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <SelectField label="Pozisyon" value={form.position} onChange={(v) => updateField("position", v)} options={POSITIONS} />
                <SelectField label="Ayak" value={form.foot} onChange={(v) => updateField("foot", v)} options={FEET} />
                <NumberField label="Forma No" value={form.jerseyNumber} onChange={(v) => updateField("jerseyNumber", v)} min={1} max={99} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <NumberField label="Boy (cm)" value={form.height} onChange={(v) => updateField("height", v)} min={100} max={220} />
                <NumberField label="Kilo (kg)" value={form.weight} onChange={(v) => updateField("weight", v)} min={30} max={120} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Telefon" value={form.phone} onChange={(v) => updateField("phone", v)} />
                <Field label="Veli Telefonu" value={form.parentPhone} onChange={(v) => updateField("parentPhone", v)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5a6170] mb-1.5">Önceki Takımlar</label>
                <div className="space-y-2">
                  {form.previousTeams.map((pt, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Takım adı"
                        value={pt.team}
                        onChange={(e) => {
                          const updated = [...form.previousTeams];
                          updated[index] = { ...updated[index], team: e.target.value };
                          updateField("previousTeams", updated);
                        }}
                        className="flex-1 px-3 py-2 bg-white border border-[#e2e5e9] rounded-lg text-[#1a1a2e] text-sm focus:outline-none focus:border-[#c4111d] focus:ring-2 focus:ring-[#c4111d]/10 transition-all duration-200"
                      />
                      <input
                        type="text"
                        placeholder="Örn: 2022-2024"
                        value={pt.years}
                        onChange={(e) => {
                          const updated = [...form.previousTeams];
                          updated[index] = { ...updated[index], years: e.target.value };
                          updateField("previousTeams", updated);
                        }}
                        className="w-32 px-3 py-2 bg-white border border-[#e2e5e9] rounded-lg text-[#1a1a2e] text-sm focus:outline-none focus:border-[#c4111d] focus:ring-2 focus:ring-[#c4111d]/10 transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = form.previousTeams.filter((_, i) => i !== index);
                          updateField("previousTeams", updated);
                        }}
                        className="p-2 text-[#8c919a] hover:text-[#c4111d] hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => updateField("previousTeams", [...form.previousTeams, { team: "", years: "" }])}
                    className="flex items-center gap-1.5 text-xs font-medium text-[#c4111d] hover:text-[#9b0d16] transition-colors py-1"
                  >
                    <Plus size={14} />
                    Takım Ekle
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5a6170] mb-1.5">Notlar</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 bg-white border border-[#e2e5e9] rounded-lg text-[#1a1a2e] text-sm focus:outline-none focus:border-[#c4111d] focus:ring-2 focus:ring-[#c4111d]/10 transition-all duration-200 resize-none"
                />
              </div>
            </div>
          )}

          {activeTab === "stats" && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-xs text-amber-700 font-medium">
                İstatistikler yalnızca görüntüleme amaçlıdır. Düzenleme bu bölümden yapılmaz.
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <ReadOnlyStat label="Maç" value={form.stats.matches} />
                <ReadOnlyStat label="Dk. Oynanan" value={form.stats.minutesPlayed} />
                <ReadOnlyStat label="Gol" value={form.stats.goals} color="text-emerald-500" />
                <ReadOnlyStat label="Asist" value={form.stats.assists} color="text-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#f8f9fb] rounded-xl p-4 flex items-center gap-3 border border-[#e2e5e9]">
                  <span className="inline-block w-4 h-5 rounded-[3px] bg-yellow-400" />
                  <div>
                    <p className="text-base font-bold text-[#1a1a2e]">{form.stats.yellowCards}</p>
                    <p className="text-[11px] text-[#8c919a]">Sarı Kart</p>
                  </div>
                </div>
                <div className="bg-[#f8f9fb] rounded-xl p-4 flex items-center gap-3 border border-[#e2e5e9]">
                  <span className="inline-block w-4 h-5 rounded-[3px] bg-red-500" />
                  <div>
                    <p className="text-base font-bold text-[#1a1a2e]">{form.stats.redCards}</p>
                    <p className="text-[11px] text-[#8c919a]">Kırmızı Kart</p>
                  </div>
                </div>
              </div>
              {form.position === "Kaleci" && (
                <div className="grid grid-cols-2 gap-3">
                  <ReadOnlyStat label="Yenilen Gol" value={form.stats.goalsConceded} color="text-orange-500" />
                  <ReadOnlyStat label="Clean Sheet" value={form.stats.cleanSheets} color="text-emerald-500" />
                </div>
              )}
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
                  onChange={(v) => updateAthletic(key, v)}
                />
              ))}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="border-t border-[#e2e5e9] px-6 py-4 flex justify-end gap-3 shrink-0 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#5a6170] bg-[#f1f3f5] hover:bg-[#e2e5e9] rounded-lg transition-colors"
          >
            İptal
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-5 py-2 text-sm font-semibold text-white bg-[#c4111d] hover:bg-[#9b0d16] rounded-lg transition-colors shadow-sm shadow-[#c4111d]/25"
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
      <label className="block text-xs font-medium text-[#5a6170] mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-3 py-2.5 bg-white border border-[#e2e5e9] rounded-lg text-[#1a1a2e] text-sm focus:outline-none focus:border-[#c4111d] focus:ring-2 focus:ring-[#c4111d]/10 transition-all duration-200"
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
      <label className="block text-xs font-medium text-[#5a6170] mb-1.5">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        className="w-full px-3 py-2.5 bg-white border border-[#e2e5e9] rounded-lg text-[#1a1a2e] text-sm focus:outline-none focus:border-[#c4111d] focus:ring-2 focus:ring-[#c4111d]/10 transition-all duration-200"
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
      <label className="block text-xs font-medium text-[#5a6170] mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 bg-white border border-[#e2e5e9] rounded-lg text-[#1a1a2e] text-sm focus:outline-none focus:border-[#c4111d] focus:ring-2 focus:ring-[#c4111d]/10 transition-all duration-200"
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
    value >= 8 ? "text-emerald-600" : value >= 6 ? "text-amber-600" : value >= 4 ? "text-orange-500" : "text-red-500";
  return (
    <div className="flex items-center gap-3 bg-[#f8f9fb] rounded-lg px-4 py-3 border border-[#e2e5e9]">
      <span className="text-xs text-[#5a6170] font-medium w-28 shrink-0">{label}</span>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-1.5 accent-[#c4111d]"
      />
      <span className={`text-sm font-bold w-7 text-right ${color}`}>{value}</span>
    </div>
  );
}

function ReadOnlyStat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-[#f8f9fb] rounded-lg p-3 text-center border border-[#e2e5e9]">
      <p className={`text-lg font-bold ${color || "text-[#1a1a2e]"}`}>{value}</p>
      <p className="text-[10px] text-[#8c919a] font-medium">{label}</p>
    </div>
  );
}
