"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Home,
  Users,
  Shield,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  Eye,
  Edit3,
  Trash2,
  Plus,
  Search,
  Filter,
  Star,
  Calendar,
  Trophy,
  Target,
  Clock,
  MapPin,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Lock,
} from "lucide-react";

type Role = "yonetici" | "antrenor" | "oyuncu";

const roleLabels: Record<Role, string> = {
  yonetici: "Yönetici",
  antrenor: "Antrenör",
  oyuncu: "Oyuncu",
};

const roleColors: Record<Role, { bg: string; text: string; border: string; activeBg: string }> = {
  yonetici: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", activeBg: "bg-purple-600" },
  antrenor: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", activeBg: "bg-blue-600" },
  oyuncu: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", activeBg: "bg-emerald-600" },
};

function Badge({ can, label }: { can: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${can ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
      {can ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
      {label}
    </span>
  );
}

function RoleBadge({ role }: { role: Role }) {
  const c = roleColors[role];
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
      {roleLabels[role]}
    </span>
  );
}

function Section({ title, icon: Icon, children, defaultOpen = true }: { title: string; icon: React.ElementType; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-[#e2e5e9] rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-[#f8f9fb] transition-colors text-left"
      >
        <div className="w-8 h-8 rounded-lg bg-[#c4111d] flex items-center justify-center shrink-0">
          <Icon size={16} className="text-white" />
        </div>
        <h2 className="text-sm md:text-base font-bold text-[#1a1a2e] flex-1">{title}</h2>
        {open ? <ChevronDown size={18} className="text-[#8c919a]" /> : <ChevronRight size={18} className="text-[#8c919a]" />}
      </button>
      {open && <div className="px-5 pb-5 border-t border-[#e2e5e9]">{children}</div>}
    </div>
  );
}

function FeatureRow({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="w-6 h-6 rounded-md bg-[#f1f3f5] flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={12} className="text-[#5a6170]" />
      </div>
      <div>
        <p className="text-sm font-semibold text-[#1a1a2e]">{title}</p>
        <p className="text-xs text-[#5a6170] mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function AccessTable({ rows }: { rows: { feature: string; yonetici: boolean | string; antrenor: boolean | string; oyuncu: boolean | string }[] }) {
  const cellContent = (val: boolean | string) => {
    if (typeof val === "string") return <span className="text-[11px] text-amber-600 font-medium">{val}</span>;
    return val ? <CheckCircle2 size={14} className="text-emerald-500 mx-auto" /> : <XCircle size={14} className="text-red-400 mx-auto" />;
  };
  return (
    <div className="overflow-x-auto mt-3">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-[#e2e5e9]">
            <th className="text-left py-2 pr-4 text-[#8c919a] font-semibold">Özellik</th>
            <th className="text-center py-2 px-3 text-purple-600 font-semibold">Yönetici</th>
            <th className="text-center py-2 px-3 text-blue-600 font-semibold">Antrenör</th>
            <th className="text-center py-2 px-3 text-emerald-600 font-semibold">Oyuncu</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-[#fafbfc]" : ""}>
              <td className="py-2 pr-4 text-[#1a1a2e] font-medium">{r.feature}</td>
              <td className="py-2 px-3 text-center">{cellContent(r.yonetici)}</td>
              <td className="py-2 px-3 text-center">{cellContent(r.antrenor)}</td>
              <td className="py-2 px-3 text-center">{cellContent(r.oyuncu)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function KilavuzPage() {
  const [activeRole, setActiveRole] = useState<Role | "all">("all");

  return (
    <div className="min-h-screen bg-[#f1f3f5]">
      {/* Header */}
      <div className="bg-[#1a1a2e] text-white">
        <div className="max-w-4xl mx-auto px-4 py-6 md:py-10">
          <div className="flex items-center gap-3 mb-4">
            <Image src="/Logo_S.png" alt="Beylerbeyi" width={40} height={40} className="rounded-lg" />
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight">Beylerbeyi Akademi</h1>
              <p className="text-white/60 text-xs md:text-sm">Kullanım Kılavuzu</p>
            </div>
          </div>
          <p className="text-white/70 text-sm max-w-2xl">
            Bu kılavuz, Beylerbeyi Akademi Yönetim Sistemi&apos;nin tüm özelliklerini ve roller bazında erişim haklarını açıklar.
          </p>
          <div className="flex items-center gap-2 mt-4">
            <Link href="/login" className="flex items-center gap-1.5 text-xs font-medium text-white/70 hover:text-white transition-colors bg-white/10 px-3 py-1.5 rounded-lg">
              <ArrowLeft size={12} /> Giriş Sayfası
            </Link>
          </div>
        </div>
      </div>

      {/* Role filter */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[#e2e5e9] shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-[#8c919a] font-medium shrink-0">Rol Filtresi:</span>
          <button
            onClick={() => setActiveRole("all")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all shrink-0 ${
              activeRole === "all" ? "bg-[#1a1a2e] text-white" : "bg-[#f1f3f5] text-[#5a6170] hover:bg-[#e2e5e9]"
            }`}
          >
            Tümü
          </button>
          {(["yonetici", "antrenor", "oyuncu"] as Role[]).map((role) => (
            <button
              key={role}
              onClick={() => setActiveRole(role)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all shrink-0 ${
                activeRole === role ? `${roleColors[role].activeBg} text-white` : `${roleColors[role].bg} ${roleColors[role].text} hover:opacity-80`
              }`}
            >
              {roleLabels[role]}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">

        {/* Giriş */}
        <Section title="Sisteme Giriş" icon={Lock} defaultOpen={activeRole === "all"}>
          <div className="space-y-3 mt-3">
            <p className="text-sm text-[#3a3f4b]">
              Sisteme giriş yapmak için <strong>e-posta adresiniz</strong> ve <strong>şifreniz</strong> gereklidir.
              Hesabınız yönetici tarafından oluşturulur ve size bir davet e-postası gönderilir.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              <div className="flex items-start gap-2">
                <AlertCircle size={14} className="text-amber-600 mt-0.5 shrink-0" />
                <div className="text-xs text-amber-800">
                  <strong>PWA (Telefon Uygulaması):</strong> Sisteme telefon tarayıcısından girdikten sonra &quot;Ana Ekrana Ekle&quot; seçeneğiyle uygulamayı telefonunuza kurabilirsiniz. Böylece normal bir uygulama gibi kullanabilirsiniz.
                </div>
              </div>
            </div>
            <div className="bg-[#f8f9fb] border border-[#e2e5e9] rounded-lg px-4 py-3">
              <p className="text-xs text-[#5a6170]">
                <strong>Roller:</strong> Sisteme giriş yaptıktan sonra rolünüze göre farklı sayfalara erişim hakkınız olur.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <RoleBadge role="yonetici" />
                <span className="text-[10px] text-[#8c919a]">— Tam yetki, tüm yaş grupları</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-1.5">
                <RoleBadge role="antrenor" />
                <span className="text-[10px] text-[#8c919a]">— Kendi yaş grubunda düzenleme, diğer yaş gruplarını görüntüleme</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-1.5">
                <RoleBadge role="oyuncu" />
                <span className="text-[10px] text-[#8c919a]">— Sadece kendi yaş grubunu görüntüleme, düzenleme yok</span>
              </div>
            </div>
          </div>
        </Section>

        {/* Ana Sayfa */}
        <Section title="Ana Sayfa (Dashboard)" icon={Home}>
          <div className="space-y-3 mt-3">
            <p className="text-sm text-[#3a3f4b]">
              Giriş yaptığınızda ilk karşınıza çıkan sayfadır. Akademinin genel durumunu tek bakışta görmenizi sağlar.
            </p>

            <h3 className="text-xs font-bold text-[#1a1a2e] uppercase tracking-wider mt-4 mb-2">Bölümler</h3>
            <FeatureRow icon={Trophy} title="Haftanın Panoraması" description="Son 7 günde atılan/yenilen goller, galibiyet, beraberlik, mağlubiyet sayıları. Haftanın en iyi oyuncusu ve takımı." />
            <FeatureRow icon={BarChart3} title="Puan Durumu" description="Yaş grubuna göre filtrelenebilen canlı lig tablosu. Beylerbeyi satırı kırmızıyla vurgulanır. Kaynak: bakhaberinolsun.com" />
            <FeatureRow icon={Calendar} title="Son Hafta Sonuçları" description="Seçilen yaş grubunun son hafta maç sonuçları, skorlar ve sahalar." />
            <FeatureRow icon={Calendar} title="Haftalık Maç Takvimi" description="Son 3 gün + önümüzdeki 7 gün içindeki maçlar. Geçmiş maçlar soluk gösterilir, bugünkü maçlar kırmızı ile vurgulanır." />
            <FeatureRow icon={Target} title="Gol ve Asist Krallığı" description="Tüm sezon boyunca en çok gol atan ve en çok asist yapan ilk 5 oyuncu." />

            <h3 className="text-xs font-bold text-[#1a1a2e] uppercase tracking-wider mt-4 mb-2">Maç Detayı</h3>
            <p className="text-xs text-[#5a6170]">
              Maç takvimininden bir maça tıkladığınızda <strong>Maç Detayı</strong> modalı açılır. Burada maç bilgilerini ve oyuncu istatistiklerini görebilirsiniz.
            </p>

            <AccessTable rows={[
              { feature: "Maç detayını görüntüleme", yonetici: true, antrenor: true, oyuncu: true },
              { feature: "Maçı düzenleme", yonetici: true, antrenor: "Kendi yaş grubu", oyuncu: false },
              { feature: "Maçı silme", yonetici: true, antrenor: false, oyuncu: false },
            ]} />
          </div>
        </Section>

        {/* Oyuncular */}
        <Section title="Oyuncular" icon={Users}>
          <div className="space-y-3 mt-3">
            <p className="text-sm text-[#3a3f4b]">
              Tüm oyuncuların listelendiği sayfadır. Oyuncu kartlarından detaylara ulaşabilirsiniz.
            </p>

            <h3 className="text-xs font-bold text-[#1a1a2e] uppercase tracking-wider mt-4 mb-2">Filtreler</h3>
            <div className="flex flex-wrap gap-2">
              <FeatureRow icon={Filter} title="Yaş Grubu" description="U14, U15, U16, U19 veya Tümü" />
              <FeatureRow icon={Calendar} title="Sezon" description="Aktif sezonlara göre filtreleme" />
              <FeatureRow icon={Search} title="Arama" description="İsim, pozisyon veya forma numarası ile arama" />
            </div>

            <h3 className="text-xs font-bold text-[#1a1a2e] uppercase tracking-wider mt-4 mb-2">Oyuncu Kartı</h3>
            <p className="text-xs text-[#5a6170]">
              Her kart oyuncunun adını, pozisyonunu, forma numarasını ve yaş grubunu gösterir.
              Karta tıkladığınızda <strong>Oyuncu Detay</strong> modalı açılır.
            </p>

            <h3 className="text-xs font-bold text-[#1a1a2e] uppercase tracking-wider mt-4 mb-2">Oyuncu Detay Modalı</h3>
            <p className="text-xs text-[#5a6170]">
              Oyuncunun genel bilgileri, taktik ve atletik becerileri (1-10 arası çubuk grafikler),
              vücut ölçüleri geçmişi ve maç bazlı istatistikleri bu ekranda görüntülenir.
              <strong> Rapor</strong> bağlantısı ile detaylı oyuncu rapor sayfasına gidilir.
            </p>

            <h3 className="text-xs font-bold text-[#1a1a2e] uppercase tracking-wider mt-4 mb-2">Oyuncu Formu (Ekleme / Düzenleme)</h3>
            <p className="text-xs text-[#5a6170]">
              4 sekmeli form: <strong>Genel</strong> (ad, soyad, doğum tarihi, yaş grubu, pozisyon, ayak, forma no, boy, kilo, telefon, veli telefon, notlar),
              <strong> İstatistikler</strong>, <strong>Taktik</strong> (9 beceri, 1-10 puan), <strong>Atletik</strong> (7 beceri, 1-10 puan).
            </p>

            <AccessTable rows={[
              { feature: "Oyuncuları görüntüleme", yonetici: "Tümü", antrenor: "Kendi yaş grubu", oyuncu: "Kendi yaş grubu" },
              { feature: "Oyuncu detayı", yonetici: true, antrenor: true, oyuncu: true },
              { feature: "Oyuncu ekleme", yonetici: true, antrenor: "Kendi yaş grubu", oyuncu: false },
              { feature: "Oyuncu düzenleme", yonetici: "Tümü", antrenor: "Kendi yaş grubu", oyuncu: false },
              { feature: "Oyuncu silme", yonetici: true, antrenor: false, oyuncu: false },
              { feature: "Oyuncu raporu", yonetici: true, antrenor: true, oyuncu: true },
            ]} />
          </div>
        </Section>

        {/* Takımlar */}
        <Section title="Takımlar (Maçlar)" icon={Shield}>
          <div className="space-y-3 mt-3">
            <p className="text-sm text-[#3a3f4b]">
              Tüm maçların listelendiği, takım istatistiklerinin gösterildiği sayfadır.
            </p>

            <h3 className="text-xs font-bold text-[#1a1a2e] uppercase tracking-wider mt-4 mb-2">Filtreler</h3>
            <FeatureRow icon={Filter} title="Maç Durumu" description="Tüm Maçlar, Oynanmış veya Planlanmış" />
            <FeatureRow icon={Filter} title="Yaş Grubu" description="U14, U15, U16, U19 veya Tümü" />
            <FeatureRow icon={Calendar} title="Sezon" description="Aktif sezonlara göre filtreleme" />
            <FeatureRow icon={Search} title="Arama" description="Rakip takım adına göre arama" />

            <h3 className="text-xs font-bold text-[#1a1a2e] uppercase tracking-wider mt-4 mb-2">Takım İstatistikleri</h3>
            <p className="text-xs text-[#5a6170]">
              Seçilen filtrelere göre toplam maç, galibiyet, beraberlik, mağlubiyet, atılan/yenilen gol ve galibiyet oranı kartları gösterilir.
            </p>

            <h3 className="text-xs font-bold text-[#1a1a2e] uppercase tracking-wider mt-4 mb-2">Maç Kartları</h3>
            <p className="text-xs text-[#5a6170]">
              Her kart: hafta numarası, yaş grubu etiketi, tarih, takımlar ve skor, ev/deplasman etiketi, saha bilgisi ve maç sonucu gösterir.
              Karta tıklayınca <strong>Maç Detayı</strong> modalı açılır.
            </p>

            <h3 className="text-xs font-bold text-[#1a1a2e] uppercase tracking-wider mt-4 mb-2">Maç Formu (Ekleme / Düzenleme)</h3>
            <p className="text-xs text-[#5a6170]">
              Maç bilgileri: tarih, sezon, yaş grubu, rakip (grup rakiplerinden seçim), ev/deplasman, durum, skor, saha, hafta, maç saati.
              <strong> Kadro yönetimi:</strong> Oyuncu listesinden kadro seçimi, katılım durumu (İlk 11, Sonradan Girdi, Sakat, Cezalı, Kadroda Yok),
              gol, asist, süre, kart ve performans puanı (1-10 yıldız) girişi.
            </p>

            <AccessTable rows={[
              { feature: "Maçları görüntüleme", yonetici: "Tümü", antrenor: "Kendi yaş grubu", oyuncu: "Kendi yaş grubu" },
              { feature: "Maç detayı", yonetici: true, antrenor: true, oyuncu: true },
              { feature: "Yeni maç ekleme", yonetici: true, antrenor: "Kendi yaş grubu", oyuncu: false },
              { feature: "Maç düzenleme", yonetici: "Tümü", antrenor: "Kendi yaş grubu", oyuncu: false },
              { feature: "Maç silme", yonetici: true, antrenor: false, oyuncu: false },
            ]} />
          </div>
        </Section>

        {/* Raporlar */}
        <Section title="Raporlar" icon={BarChart3}>
          <div className="space-y-3 mt-3">
            <p className="text-sm text-[#3a3f4b]">
              Oyuncu performanslarının detaylı istatistiksel analizinin yapıldığı sayfadır.
            </p>

            <h3 className="text-xs font-bold text-[#1a1a2e] uppercase tracking-wider mt-4 mb-2">Filtreler</h3>
            <FeatureRow icon={Filter} title="Yaş Grubu" description="Belirli yaş grubuna göre filtreleme" />
            <FeatureRow icon={Calendar} title="Sezon" description="Sezon bazlı filtreleme" />
            <FeatureRow icon={Filter} title="Pozisyon" description="Kaleci, Defans, Orta Saha, Forvet" />
            <FeatureRow icon={Filter} title="Sıralama" description="Gol, asist, maç, dakika, puan, kart ve daha fazlası ile sıralama" />

            <h3 className="text-xs font-bold text-[#1a1a2e] uppercase tracking-wider mt-4 mb-2">En İyi Performanslar</h3>
            <p className="text-xs text-[#5a6170]">
              6 kategoride en iyi oyuncu kartları: <strong>Gol Kralı</strong>, <strong>Asist Kralı</strong>,
              <strong> En Katkılı</strong>, <strong>En Çok Süre Alan</strong>, <strong>En Yüksek Puan</strong>,
              <strong> Gole Kapatan</strong> ve <strong>Taktik Lider</strong>.
            </p>

            <h3 className="text-xs font-bold text-[#1a1a2e] uppercase tracking-wider mt-4 mb-2">İstatistik Tablosu</h3>
            <p className="text-xs text-[#5a6170]">
              Tüm oyuncuların detaylı istatistikleri: maç sayısı (İlk 11 / Yedek), süre, gol, asist, sarı/kırmızı kart,
              gol yememe, performans puanı. Sütun başlıklarına tıklayarak sıralama yapılabilir.
            </p>

            <h3 className="text-xs font-bold text-[#1a1a2e] uppercase tracking-wider mt-4 mb-2">Bireysel Oyuncu Raporu</h3>
            <p className="text-xs text-[#5a6170]">
              Oyuncu detay modalından veya tablodan erişilebilir. Beceri geçmişi grafikleri, vücut ölçümü geçmişi
              ve maç bazlı detaylı istatistikler bu sayfada yer alır.
            </p>

            <AccessTable rows={[
              { feature: "Raporları görüntüleme", yonetici: true, antrenor: true, oyuncu: false },
              { feature: "Bireysel rapor", yonetici: true, antrenor: true, oyuncu: false },
            ]} />

            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mt-2">
              <div className="flex items-start gap-2">
                <Lock size={14} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-xs text-red-700">
                  <strong>Oyuncu rolü</strong> için raporlar sayfası tamamen gizlidir.
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* Ayarlar */}
        <Section title="Ayarlar" icon={Settings}>
          <div className="space-y-3 mt-3">
            <p className="text-sm text-[#3a3f4b]">
              Sistem yapılandırmasının yapıldığı sayfadır. Sadece yönetici erişebilir.
            </p>

            <h3 className="text-xs font-bold text-[#1a1a2e] uppercase tracking-wider mt-4 mb-2">Sekmeler</h3>
            <FeatureRow icon={Shield} title="Pozisyonlar" description="Oyuncu pozisyonlarını yönetin (Kaleci, Defans, Orta Saha, Forvet vb.)" />
            <FeatureRow icon={Settings} title="Ayak" description="Tercih ayak seçeneklerini yönetin (Sağ, Sol, Her İki Ayak)" />
            <FeatureRow icon={Users} title="Yaş Grupları" description="Yaş gruplarını ekleyin, düzenleyin veya pasifleştirin (U14, U15, U16, U19)" />
            <FeatureRow icon={Calendar} title="Sezonlar" description="Sezon tanımlarını yönetin (2025-2026 vb.)" />
            <FeatureRow icon={CheckCircle2} title="Katılım Durumu" description="Maç katılım durumu seçeneklerini yönetin (İlk 11, Sonradan Girdi, Sakat vb.)" />
            <FeatureRow icon={Users} title="Grup Rakipleri" description="Her yaş grubu için lig rakiplerini tanımlayın. Maç formunda rakip seçimi bu listeden yapılır." />
            <FeatureRow icon={Users} title="Kullanıcılar" description="Yeni kullanıcı davet edin, mevcut kullanıcılara rol ve yaş grubu atayın." />

            <h3 className="text-xs font-bold text-[#1a1a2e] uppercase tracking-wider mt-4 mb-2">Kullanıcı Yönetimi</h3>
            <p className="text-xs text-[#5a6170]">
              <strong>Yeni kullanıcı davet etme:</strong> E-posta adresi girerek sisteme yeni kullanıcı davet edebilirsiniz.
              Davet edilen kullanıcıya rol (Yönetici / Antrenör / Oyuncu) ve yaş grubu atanır.
              Kullanıcı davet e-postasındaki bağlantıya tıklayarak şifresini oluşturur.
            </p>

            <AccessTable rows={[
              { feature: "Ayarlar sayfası", yonetici: true, antrenor: false, oyuncu: false },
              { feature: "Lookup yönetimi", yonetici: true, antrenor: false, oyuncu: false },
              { feature: "Kullanıcı daveti", yonetici: true, antrenor: false, oyuncu: false },
              { feature: "Rol atama", yonetici: true, antrenor: false, oyuncu: false },
            ]} />

            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mt-2">
              <div className="flex items-start gap-2">
                <Lock size={14} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-xs text-red-700">
                  <strong>Antrenör ve Oyuncu rolleri</strong> için ayarlar sayfası tamamen gizlidir.
                  Menüde görünmez, doğrudan URL ile gidilmeye çalışılsa bile erişim engellenir.
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* Genel Rol Erişim Matrisi */}
        <Section title="Genel Erişim Matrisi" icon={Shield}>
          <div className="mt-3">
            <p className="text-sm text-[#3a3f4b] mb-4">
              Tüm sayfa ve özelliklerin roller bazında erişim hakları özet tablosu:
            </p>
            <AccessTable rows={[
              { feature: "Ana Sayfa — Görüntüleme", yonetici: true, antrenor: true, oyuncu: true },
              { feature: "Ana Sayfa — Maç düzenleme", yonetici: true, antrenor: "Kendi yaş grubu", oyuncu: false },
              { feature: "Ana Sayfa — Maç silme", yonetici: true, antrenor: false, oyuncu: false },
              { feature: "Oyuncular — Görüntüleme", yonetici: "Tümü", antrenor: "Kendi yaş grubu", oyuncu: "Kendi yaş grubu" },
              { feature: "Oyuncular — Ekleme", yonetici: true, antrenor: "Kendi yaş grubu", oyuncu: false },
              { feature: "Oyuncular — Düzenleme", yonetici: "Tümü", antrenor: "Kendi yaş grubu", oyuncu: false },
              { feature: "Oyuncular — Silme", yonetici: true, antrenor: false, oyuncu: false },
              { feature: "Takımlar — Görüntüleme", yonetici: "Tümü", antrenor: "Kendi yaş grubu", oyuncu: "Kendi yaş grubu" },
              { feature: "Takımlar — Maç ekleme", yonetici: true, antrenor: "Kendi yaş grubu", oyuncu: false },
              { feature: "Takımlar — Maç düzenleme", yonetici: "Tümü", antrenor: "Kendi yaş grubu", oyuncu: false },
              { feature: "Takımlar — Maç silme", yonetici: true, antrenor: false, oyuncu: false },
              { feature: "Raporlar", yonetici: true, antrenor: true, oyuncu: false },
              { feature: "Ayarlar", yonetici: true, antrenor: false, oyuncu: false },
              { feature: "Kullanıcı yönetimi", yonetici: true, antrenor: false, oyuncu: false },
            ]} />
          </div>
        </Section>

        {/* PWA */}
        <Section title="Telefona Uygulama Kurulumu (PWA)" icon={MapPin} defaultOpen={false}>
          <div className="space-y-3 mt-3">
            <h3 className="text-xs font-bold text-[#1a1a2e] uppercase tracking-wider mb-2">Android</h3>
            <ol className="text-xs text-[#5a6170] space-y-1.5 list-decimal list-inside">
              <li>Chrome tarayıcıda siteyi açın ve giriş yapın</li>
              <li>Tarayıcı adres çubuğunda veya menüde <strong>&quot;Ana Ekrana Ekle&quot;</strong> veya <strong>&quot;Uygulamayı Yükle&quot;</strong> seçeneğine tıklayın</li>
              <li>Onaylayın — uygulama ana ekranınıza eklenecektir</li>
              <li>Artık normal bir uygulama gibi açabilirsiniz</li>
            </ol>

            <h3 className="text-xs font-bold text-[#1a1a2e] uppercase tracking-wider mt-4 mb-2">iPhone / iPad</h3>
            <ol className="text-xs text-[#5a6170] space-y-1.5 list-decimal list-inside">
              <li>Safari tarayıcıda siteyi açın ve giriş yapın</li>
              <li>Alt kısımdaki <strong>Paylaş</strong> (kutu + ok) butonuna dokunun</li>
              <li><strong>&quot;Ana Ekrana Ekle&quot;</strong> seçeneğini bulun ve dokunun</li>
              <li><strong>&quot;Ekle&quot;</strong> butonuna dokunarak onaylayın</li>
              <li>Uygulama ana ekranınızda görünecektir</li>
            </ol>
          </div>
        </Section>

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-xs text-[#8c919a]">Beylerbeyi Akademi Yönetim Sistemi © 2026</p>
          <p className="text-[10px] text-[#b0b5bd] mt-1">Son güncelleme: Şubat 2026</p>
        </div>
      </div>
    </div>
  );
}
