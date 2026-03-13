# Beylerbeyi Akademi — Yönetim Platformu

Next.js 16, Supabase ve Tailwind CSS ile geliştirilmiş futbol akademisi yönetim sistemi.

## Teknoloji Yığını

- **Frontend:** Next.js 16 (App Router), Tailwind CSS v4, TypeScript
- **Backend & Veritabanı:** Supabase (PostgreSQL + Auth + RLS)
- **Deploy:** Vercel

## Geliştirme Ortamı

```bash
npm install
npm run dev
```

---

## SaaS Dönüşüm Planı

Bu proje şu an tek kulüp (Beylerbeyi) için çalışmaktadır. Aşağıda birden fazla kulübün kullanabilmesi için planlanan mimari ve uygulama adımları yer almaktadır.

### Mimari Seçim: Multi-Tenant (Tek Deployment)

Tek bir Next.js + Supabase deployment üzerinde birden fazla kulüp çalışır. Her kulüp kendi subdomain'inden erişir:

```
fenerbahce.akademiplatform.com
besiktas.akademiplatform.com
galatasaray.akademiplatform.com
```

### Subdomain Yönetimi (Vercel)

Vercel Pro'da wildcard subdomain tek seferlik yapılandırılır, sonrası tamamen otomatiktir:

1. Vercel Dashboard → Project → Settings → Domains → `*.akademiplatform.com` ekle
2. DNS sağlayıcısında (Cloudflare vb.) wildcard CNAME ekle:
   ```
   *.akademiplatform.com  →  CNAME  →  cname.vercel-dns.com
   ```
3. Yeni kulüp kayıt olduğunda sadece DB'ye `slug: "fenerbahce"` yazılır.
   Vercel'e veya DNS'e dokunulmaz, subdomain otomatik çalışır.

> **Not:** Wildcard subdomain Vercel Pro planında dahildir, ek ücret yoktur.

#### Kulübün Kendi Domain'ini Kullanması (Opsiyonel)

Kulüp `app.fenerbahce.com.tr` gibi kendi domain'ini kullanmak isterse Vercel API ile otomatik eklenebilir:

```typescript
await fetch("https://api.vercel.com/v10/projects/{projectId}/domains", {
  method: "POST",
  headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
  body: JSON.stringify({ name: "app.fenerbahce.com.tr" }),
});
```

SSL Vercel tarafından otomatik sağlanır. Kulüp kendi DNS'inde CNAME ekler.

---

### Kullanıcı Giriş Akışları

#### 1. Kulüp Yöneticisi — İlk Kurulum
```
akademiplatform.com/kayit
→ E-posta + şifre
→ Kulüp adı, logo yükle, renk seç
→ Subdomain seç (fenerbahce.akademiplatform.com)
→ Ödeme (opsiyonel)
→ Dashboard'a yönlendir
```

#### 2. Davet Edilen Kullanıcı (Antrenör / Oyuncu)
```
Yönetici panelinden "Kullanıcı Davet Et" → e-posta gönder
→ fenerbahce.akademiplatform.com/davet?token=xxx
→ Şifre belirle → sisteme gir
→ Rol + yaş grubu zaten atanmış
```

#### 3. Mevcut Kullanıcı
```
fenerbahce.akademiplatform.com/giris
→ E-posta + şifre
→ Başka kulübün verisine RLS ile erişemez
```

---

### Veritabanı Değişiklikleri

#### 1. `clubs` Tablosu (Yeni)
```sql
CREATE TABLE clubs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,   -- subdomain
  logo_url         TEXT,
  primary_color    TEXT DEFAULT '#c4111d',
  secondary_color  TEXT DEFAULT '#1b6e2a',
  created_at       TIMESTAMPTZ DEFAULT now()
);
```

#### 2. Tüm Tablolara `club_id` Eklenir
```
players, matches, training_schedules, training_attendance,
training_week_configs, training_detail_items,
user_roles, lookup_* tabloları
```

#### 3. RLS Politikaları `club_id` Bazlı Güncellenir
```sql
-- Örnek: kullanıcı yalnızca kendi kulübünün verisini görür
CREATE POLICY "club_isolation" ON players
  FOR SELECT TO authenticated
  USING (club_id = (
    SELECT club_id FROM user_roles WHERE user_id = auth.uid()
  ));
```

#### 4. Davet Sistemi Tablosu (Yeni)
```sql
CREATE TABLE club_invitations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id    UUID REFERENCES clubs(id),
  email      TEXT NOT NULL,
  role       TEXT NOT NULL,
  age_group  TEXT,
  token      TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at    TIMESTAMPTZ
);
```

---

### Uygulama Değişiklikleri

#### Next.js Middleware — Subdomain → club_id Çözümleme
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const slug = host.split(".")[0]; // "fenerbahce"
  // slug'dan club_id bul, request header'a ekle
  // tüm server component'ler bu header'ı okur
}
```

#### Login Sayfası — Dinamik Kulüp Markası
```
fenerbahce.akademiplatform.com/giris
→ Kulübün logosu + renkleri DB'den çekilir
→ Sayfada Fenerbahçe logosu ve renkleri gösterilir
```

#### Yeni Sayfalar
```
/kayit            → Kulüp oluşturma wizard'ı
/davet            → Davet linki ile kullanıcı kaydı
/dashboard/ayarlar → Kulüp logosu, renk, kullanıcı yönetimi
```

---

### Uygulama Öncelik Sırası

| Adım | İş | Not |
|------|-----|-----|
| 1 | `clubs` tablosu oluştur | Beylerbeyi'ni ilk kayıt olarak ekle |
| 2 | Tüm tablolara `club_id` ekle | Migration ile, mevcut veri bozulmaz |
| 3 | RLS politikalarını güncelle | En kritik güvenlik adımı |
| 4 | Middleware yaz | Subdomain → club_id çözümleme |
| 5 | Kayıt + davet akışı | Yeni kulüp onboarding |
| 6 | Login sayfasını dinamikleştir | Kulüp markası |
| 7 | Ayarlar sayfası | Logo, renk, kullanıcı yönetimi |
| 8 | Ödeme sistemi | Stripe / iyzico entegrasyonu |

---

## Mevcut Özellikler

- Oyuncu yönetimi (kayıt, profil, beceri logları)
- Maç yönetimi ve istatistikleri
- Haftalık antrenman programı (yaş grubu bazlı)
- Antrenman yoklama sistemi
- Antrenman raporu (tablo formatında, yazdırılabilir)
- Skor tablosu ve panorama
- Rol tabanlı erişim: yönetici / antrenör / oyuncu
- Sezon bazlı veri yönetimi
