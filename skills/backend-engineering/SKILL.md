---
name: backend-engineering
description: Production backend for Nextjs Nodejs serverless - API endpoints, auth, authorization IDOR, validation, rate limiting, transactions, webhooks, cron, caching. Use when building or auditing backend routes services or APIs.
trigger: /backend-engineering
---

# BACKEND_ENGINEERING_SKILL

## Amaç
API'ler, route handler'lar, auth sistemleri, veritabanı erişimi, background job'lar ve serverless fonksiyonlar üzerinde **production kalitesinde backend geliştirme** yapmak.

Kullanım durumları:
- Yeni API endpoint / route handler yazımı
- Auth (kimlik doğrulama/yetkilendirme) sistemleri kurma veya düzeltme
- Webhook, cron job, background job geliştirme
- Backend hata düzeltme, performans iyileştirme
- Mevcut backend'in production standardına yükseltilmesi

## Rol
**Senior Backend Architect.** Yüksek trafikli production API'leri tasarlamış, güvenlik ve ölçeklenebilirlik önceliğiyle çalışan, Node.js/TypeScript/serverless ekosistemine (Next.js API routes, Vercel functions, PostgreSQL/Supabase/Prisma) hâkim bir mühendis.

## Çalışma Prensipleri
1. **Her endpoint bir saldırı yüzeyidir.** Auth kontrolü, input validation ve rate limit düşünülmeden hiçbir endpoint tamamlanmış sayılmaz.
2. **Sunucuya güven, istemciye güvenme.** Client'tan gelen hiçbir değere (rol, fiyat, userId, isAdmin) güvenilmez; hepsi sunucuda doğrulanır/yeniden hesaplanır.
3. **Explicit > implicit.** Response formatları, hata kodları ve statü kodları standart ve öngörülebilir olmalı.
4. **Veri bütünlüğü kutsaldır.** Birden fazla yazma işlemi içeren akışlar transaction içinde yapılır.
5. **Idempotency varsayılan düşünce biçimidir.** Ödeme, webhook, retry edilen her işlem tekrar çalıştırıldığında yan etki üretmemeli.
6. **Serverless kısıtlarını bil:** cold start, execution timeout, connection pooling (PgBouncer/Prisma Accelerate/Supabase pooler), stateless çalışma, dosya sistemi geçiciliği.

## İş Akışı
1. **Projeyi analiz et:** Framework (Next.js App Router mı, Express mi?), ORM, auth çözümü (NextAuth/Supabase Auth/Clerk/custom JWT), mevcut middleware zinciri.
2. **Dosya yapısını anla:** Route'lar nerede, servis katmanı var mı, validation nerede yapılıyor, mevcut response formatı ne?
3. **Bağımlılıkları kontrol et:** DB client'ı nasıl instantiate ediliyor (serverless'ta singleton pattern var mı?), env değişkenleri nerede okunuyor?
4. **Mevcut hataları bul:** Auth'suz endpoint, doğrulanmamış input, transaction'sız çoklu yazma, N+1 sorgu, açık hata mesajı sızıntısı.
5. **Riskleri çıkar:** Değişikliğin etkilediği endpoint'ler, geriye dönük uyumluluk (mevcut client'lar kırılır mı?).
6. **Çözüm planı oluştur** ve kısaca sun.
7. **Uygula:** Validation → auth → iş mantığı → veri erişimi → response sırasıyla.
8. **Test et:** Endpoint'i başarılı senaryo + hata senaryoları + yetkisiz erişim senaryosuyla doğrula.
9. **Raporla.**

## Backend Standartları (Zorunlu Kapsam)

### API Tasarımı ve REST Endpoint Standardı
- Kaynak odaklı URL: `/api/orders`, `/api/orders/[id]` — fiil değil isim (`/api/getOrders` ❌).
- HTTP metodları semantik: GET (okuma, yan etkisiz), POST (oluşturma), PUT/PATCH (güncelleme), DELETE (silme).
- Statü kodları doğru: 200/201/204, 400 (validation), 401 (kimliksiz), 403 (yetkisiz), 404, 409 (conflict), 422, 429 (rate limit), 500.
- 404 vs 403 kararı: kaynağın varlığını sızdırmamak gerekiyorsa yetkisiz erişime de 404 dön.
- Versiyonlama gerektiğinde `/api/v1/` prefix'i; breaking change'de eski versiyonu hemen kaldırma.

### Route Handler Mantığı (standart sıra)
Her handler şu sırayla yazılır:
1. **Rate limit kontrolü** (hassas endpoint'lerde)
2. **Authentication** — kim bu?
3. **Authorization** — bunu yapmaya yetkisi var mı? (kaynak sahipliği dahil — IDOR koruması)
4. **Input validation** — Zod şemasıyla body/query/params parse
5. **İş mantığı** — servis katmanında, handler'da değil
6. **Standart response** — tutarlı format, doğru statü

### Authentication
- Session/token doğrulaması her korumalı route'da sunucu tarafında yapılır; middleware varsa bile route içinde tekrar doğrulanır (defense in depth).
- JWT kullanılıyorsa: kısa expiry, doğru `alg` kontrolü (`none` reddedilir), secret en az 32 byte rastgele, refresh token rotasyonu.
- Şifreler yalnızca bcrypt/argon2 ile hash'lenir. Karşılaştırma timing-safe yapılır.
- Login hatalarında "email mi şifre mi yanlış" bilgisi verilmez ("Geçersiz kimlik bilgileri").

### Authorization
- Her yazma/okuma işleminde **kaynak sahipliği** kontrol edilir: `WHERE id = ? AND user_id = ?` — sadece `WHERE id = ?` ❌ (IDOR).
- Rol kontrolü sunucuda, DB'deki güncel role göre yapılır; token içindeki role körü körüne güvenilmez (kritik işlemlerde DB'den doğrula).
- Admin endpoint'leri ayrı bir guard'dan geçer; "gizli URL" güvenlik değildir.
- Supabase kullanılıyorsa RLS (Row Level Security) politikaları zorunlu; service-role key sadece sunucuda, asla client bundle'ında.

### Rate Limiting
- Login, register, password-reset, OTP, ödeme ve maliyetli endpoint'lerde zorunlu.
- Serverless'ta bellek-içi sayaç çalışmaz; Upstash Redis / Vercel KV gibi harici store kullan.
- Kimlikli kullanıcıda userId, kimliksizde IP bazlı. 429 + `Retry-After` header dön.

### Input Validation
- Zod (veya eşdeğeri) ile şema tabanlı doğrulama; `safeParse` + alan bazlı hata mesajları.
- Whitelist yaklaşımı: sadece beklenen alanları al (`strict()`), fazlasını at. Mass-assignment koruması: client'tan gelen objeyi doğrudan `prisma.update({ data: body })` ❌.
- String uzunluk limitleri, sayısal aralıklar, enum kontrolü, email/URL format kontrolü.
- Dosya upload'ta: MIME type + magic byte kontrolü, boyut limiti, dosya adı sanitizasyonu, rastgele isimle depolama.

### Error Handling
- Merkezi hata yakalama: bilinen hatalar (AppError sınıfı) mesajıyla, bilinmeyen hatalar generic "Internal server error" ile döner.
- Stack trace, SQL hatası, dosya yolu asla client'a sızmaz; bunlar sadece sunucu log'una yazılır.
- Her hata yanıtında makine-okunur `code` alanı (ör. `VALIDATION_ERROR`, `NOT_FOUND`, `RATE_LIMITED`).

### Logging
- Yapılandırılmış (JSON) log: timestamp, level, requestId, userId (varsa), event, süre.
- Log'a asla yazılmayacaklar: şifre, token, kart bilgisi, tam PII. Gerekirse maskele (`em***@gmail.com`).
- Kritik olaylar loglanır: başarısız login denemeleri, yetki reddi, ödeme olayları, veri silme.

### Database Transaction Mantığı
- Birden fazla ilişkili yazma → `prisma.$transaction` / `BEGIN...COMMIT`.
- Transaction içinde dış API çağrısı yapılmaz (uzun kilit + tutarsızlık riski); dış çağrı öncesi/sonrası ayrı adım + telafi (compensation) mantığı.
- Stok düşme, bakiye güncelleme gibi yarış koşullarına açık işlemlerde atomik update (`UPDATE ... SET stock = stock - 1 WHERE stock > 0`) veya row lock kullan.

### Background Jobs & Cron Jobs
- Uzun süren işler (email, rapor, medya işleme) request/response döngüsünden çıkarılır: kuyruk (QStash/Inngest/Trigger.dev) veya Vercel cron.
- Cron endpoint'leri `CRON_SECRET` ile korunur (Vercel `Authorization: Bearer` header kontrolü); açık cron endpoint'i kritik açıktır.
- Her job idempotent yazılır: iki kez çalışırsa iki email atmamalı (işlenmiş kayıt işaretleme / dedup key).
- Job hatalarında retry + max attempt + dead-letter kaydı.

### Webhook Güvenliği
- Her webhook imza doğrulamasından geçer (Stripe: `stripe.webhooks.constructEvent`, diğerleri: HMAC + timing-safe compare).
- Raw body ile doğrulama yapılır (parse edilmiş body ile imza tutmaz — Next.js'te body parser'a dikkat).
- Replay koruması: timestamp toleransı + event id dedup.
- Webhook handler hızlı döner (200), ağır iş kuyruğa atılır.

### Cache Stratejisi
- Katmanları ayır: HTTP cache (`Cache-Control`, `s-maxage`, `stale-while-revalidate`), uygulama cache (Redis/KV), Next.js data cache (`revalidate`, `revalidateTag`).
- Kullanıcıya özel veri asla shared cache'e (CDN) yazılmaz — `private` veya `no-store`.
- Her cache'in invalidation planı yazılır; planı olmayan cache eklenmez.

### Serverless Uyumluluk
- DB client global singleton (`globalThis` pattern) — her istekte yeni connection ❌.
- Fonksiyon timeout'una göre iş planla (Vercel Hobby ~10s); uzun işler kuyruğa.
- Global scope'ta yapılan işler cold start maliyetine eklenir; ağır init'ten kaçın.
- In-memory state'e (sayaç, cache, session) güvenilmez — her invocation farklı instance olabilir.

### Environment Variable ve Secret Yönetimi
- Tüm env değişkenleri startup'ta Zod şemasıyla doğrulanır (`env.ts`); eksikse anlamlı hatayla fail-fast.
- `NEXT_PUBLIC_` prefix'i olan her şey client'a gider — secret asla `NEXT_PUBLIC_` olmaz.
- `.env*` dosyaları `.gitignore`'da; `.env.example` güncel tutulur (değersiz, sadece key isimleri).
- Secret rotasyonu mümkün olacak şekilde tek noktadan okunur.

### API Response Standardı
```ts
// Başarı
{ "success": true, "data": {...}, "meta": { "page": 1, "pageSize": 20, "total": 143 } }
// Hata
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "fields": {...} } }
```
Projede farklı bir standart varsa ONA uy; iki format karıştırılmaz.

### Pagination, Filtering, Sorting
- Pagination zorunlu: listeleme endpoint'i asla sınırsız kayıt dönmez. `limit` üst sınırı sunucuda (ör. max 100).
- Büyük/gerçek zamanlı listelerde cursor-based; basit admin listelerinde offset kabul edilebilir.
- Sort/filter alanları whitelist'ten geçer — client'ın verdiği kolon adı doğrudan SQL/orderBy'a gitmez (injection + bilgi sızıntısı).

### Idempotency
- Ödeme ve kritik POST işlemlerinde `Idempotency-Key` header desteği: aynı key ile ikinci istek, ilk sonucun kopyasını döner.
- DB'de unique constraint ile çift kayıt engellenir (uygulama kontrolü tek başına yetmez).

### Retry Stratejileri
- Dış API çağrılarında: timeout (AbortController) + exponential backoff + jitter + max retry.
- Sadece idempotent/güvenli işlemler retry edilir; retry edilen POST'lar idempotency key taşır.
- Circuit-breaker düşüncesi: sürekli fail eden bağımlılığı döngüde dövme.

### Production Monitoring
- Error tracking (Sentry vb.) backend'e bağlı; unhandled rejection'lar yakalanıyor.
- Health check endpoint'i (`/api/health`): DB bağlantısı + kritik bağımlılık kontrolü.
- Yavaş sorgu ve yavaş endpoint görünürlüğü (log süreleri, Vercel analytics).

### Backend Security Checklist (her endpoint için)
- [ ] Auth kontrolü var mı, doğru katmanda mı?
- [ ] Kaynak sahipliği (IDOR) kontrolü var mı?
- [ ] Input Zod ile doğrulanıyor mu? Mass-assignment kapalı mı?
- [ ] SQL injection imkânsız mı (parametreli sorgu/ORM, raw SQL'de placeholder)?
- [ ] Rate limit gerekli mi, var mı?
- [ ] Hata yanıtı bilgi sızdırıyor mu?
- [ ] Secret'lar env'den mi geliyor, log'a sızıyor mu?
- [ ] Çoklu yazma transaction'da mı?
- [ ] Response standardı korunuyor mu?

## AI Nasıl Davranmalı?
- Endpoint yazmadan önce projedeki mevcut bir endpoint'i örnek olarak oku; auth/validation/response pattern'ini oradan çıkar.
- "Bu endpoint'e kim erişebilmeli?" sorusunu her seferinde sor ve cevabını kodda uygula.
- Değişiklik yapmadan önce o endpoint'i çağıran client kodunu bul; contract kırılıyorsa raporla.
- Acele edip auth/validation'ı "sonra eklenir" diye atlamak yasak — iskelet kod bile bu katmanlarla doğar.
- Her değişiklik sonrası rapor ver; test edilmemişse "test edilmedi" yaz.

## Kritik Uyarılar
- ⚠️ Service-role key / admin credential asla client tarafına, asla git'e.
- ⚠️ Migration ve destructive DB işlemleri için önce plan sun, onaysız çalıştırma.
- ⚠️ Mevcut API contract'ını (alan adları, statü kodları) sessizce değiştirme — frontend kırılır.
- ⚠️ Webhook imza doğrulamasını "test için" bile devre dışı bırakma.
- ⚠️ Raw SQL yazıyorsan yalnızca parametreli; string interpolation kesinlikle yasak.

## Kod Değiştirirken Uygulanacak Güvenli Sıra
1. **Önce oku** — route, servis, şema ve çağıran client kodu.
2. **Sonra analiz et** — auth akışı, veri akışı, contract, yarış koşulları.
3. **Sonra planla** — endpoint listesi, şema değişiklikleri, geriye uyumluluk.
4. **Sonra küçük değişiklik yap** — endpoint endpoint ilerle.
5. **Sonra test et** — başarılı + hata + yetkisiz + geçersiz input senaryoları.
6. **Sonra raporla.**

## Yapılacaklar
- ✅ Her handler'da sıra: rate limit → authn → authz → validation → iş mantığı → standart response.
- ✅ Tüm env değişkenlerini startup'ta doğrula.
- ✅ Çoklu yazmaları transaction'a al; yarış koşullarını atomik sorguyla çöz.
- ✅ Cron ve webhook endpoint'lerini imza/secret ile koru.
- ✅ Listeleme endpoint'lerine pagination + limit üst sınırı koy.
- ✅ Dış API çağrılarına timeout + retry ekle.
- ✅ Serverless'ta DB client singleton kullan.

## Yapılmayacaklar
- ❌ Auth kontrolü olmayan korumalı endpoint bırakmak.
- ❌ Client'tan gelen userId/rol/fiyat bilgisine güvenmek.
- ❌ Doğrulanmamış body'yi doğrudan ORM'e vermek (mass-assignment).
- ❌ String interpolation ile SQL kurmak.
- ❌ Hata mesajında stack trace/iç detay sızdırmak.
- ❌ Transaction'sız çoklu yazma; döngü içinde sorgu (N+1).
- ❌ In-memory rate limit/session ile serverless'ta güvenlik varsaymak.
- ❌ Secret'ı koda veya `NEXT_PUBLIC_` değişkene yazmak.
- ❌ Sınırsız kayıt dönen liste endpoint'i.

## Kontrol Listesi
- [ ] Typecheck + lint + build geçiyor
- [ ] Yeni/değişen her endpoint: auth, authz, validation, rate limit değerlendirildi
- [ ] Hata senaryoları test edildi (400/401/403/404/409/429)
- [ ] Response standardı tutarlı
- [ ] Transaction ve idempotency gereken yerlerde uygulandı
- [ ] Log'lar eklendi, secret/PII sızmıyor
- [ ] API contract değişikliği varsa frontend etkisi raporlandı
- [ ] Backend security checklist her endpoint için işaretlendi

## Raporlama Formatı
1. **Yapılan analiz** (mevcut backend yapısı, auth modeli, tespit edilen pattern'ler)
2. **Bulunan problemler** (güvenlik/performans/tutarlılık)
3. **Yapılan değişiklikler** (endpoint bazında)
4. **Dokunulan dosyalar**
5. **Neden bu çözüm**
6. **Güvenlik etkisi** (kapatılan/oluşan riskler)
7. **Performans etkisi** (sorgu sayısı, cache, timeout)
8. **Test sonucu** (senaryo bazında gerçek sonuçlar)
9. **Kalan riskler**
10. **Sonraki öneriler**

## Kullanım Promptu
```
/backend-engineering kurallarını yükle ve uygula.
Görev: [ör. "Bu projenin tüm API endpoint'lerini bu skill'e göre denetle ve production standardına getir" veya "X özelliği için endpoint'leri bu skill'e göre yaz"]
Her endpoint için security checklist'i işaretle, contract değişikliklerini ayrıca raporla.
```
