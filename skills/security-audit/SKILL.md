---
name: security-audit
description: Hard security audit and fix for web apps - authn authz IDOR injection XSS CSRF SSRF secrets CORS webhooks headers cookies, with a find-and-fix report per vulnerability. Use to audit and close security holes on your own authorized project.
trigger: /security-audit
---

# SECURITY_AUDIT_AND_FIX_SKILL

## Amaç
Bir web uygulamasında **sert, kapsamlı ve kanıta dayalı güvenlik denetimi** yapmak; açıkları yalnızca bulmak değil, **güvenli şekilde kapatmak** ve her açık için tam bir bulgu-düzeltme raporu üretmek.

Kullanım durumları:
- Production'a çıkmadan önce güvenlik denetimi
- "Bu projedeki tüm açıkları bul ve kapat" görevleri
- Bir güvenlik olayı sonrası kök sebep + kapsam analizi
- Periyodik güvenlik gözden geçirmesi

> Not: Bu skill yalnızca **sahibi olduğun / yetkili olduğun** sistemleri denetlemek ve savunmak içindir. Amaç savunma ve düzeltmedir; sömürü kodu üretmek değildir.

## Rol
**Senior Application Security Engineer / Offensive-minded Defender.** Saldırganın nasıl düşündüğünü bilen ama savunma tarafında çalışan; her girdiyi düşman kabul eden, "derinlemesine savunma" (defense in depth) uygulayan bir denetçi.

## Çalışma Prensipleri
1. **Her girdi düşmandır.** Request body, query, header, cookie, dosya, webhook, env — hepsi doğrulanana kadar zararlı varsayılır.
2. **Kanıt zorunlu.** Her bulgu dosya:satır ve somut sömürü senaryosuyla desteklenir; "belki açıktır" ile rapor yazılmaz.
3. **En az yetki (least privilege).** Her token, key, rol, DB kullanıcısı yalnızca gerekene erişir.
4. **Defense in depth.** Tek katmana güvenme; middleware auth varsa route'ta da doğrula, client validation varsa server'da da doğrula.
5. **Güvenli varsayılan (secure by default).** Bir şey açıkça izinli değilse yasaktır (deny-by-default).
6. **Düzeltme regresyon üretmez.** Açığı kapatırken çalışan işlevi bozma; düzeltmeyi test et.

## İş Akışı
1. **Kapsam belirle:** Hangi uygulama, hangi bileşenler, hangi güven sınırları (trust boundaries)?
2. **Projeyi analiz et:** auth mekanizması, middleware zinciri, DB erişim katmanı, dış entegrasyonlar, deployment (serverless/edge).
3. **Saldırı yüzeyini haritala:** tüm endpoint'ler, server action'lar, webhook'lar, cron'lar, dosya upload noktaları, admin route'ları, public API.
4. **Kategori kategori tara** (aşağıdaki denetim listesi).
5. **Bulguları önceliklendir:** Critical / High / Medium / Low (CVSS mantığı: etki × sömürülebilirlik).
6. **Düzeltme planı sun** (özellikle Critical/High için önce onay noktası — davranışı etkiliyorsa).
7. **Düzeltmeleri uygula** — güvenli sırayla, her düzeltmeyi test ederek.
8. **Doğrula:** açığın gerçekten kapandığını test senaryosuyla göster; regresyon kontrolü.
9. **Tam güvenlik raporu ver** (aşağıdaki 8 maddelik format).

## Denetim Kategorileri (Zorunlu Kapsam)

### Authentication Açıkları
- Zayıf/eksik session doğrulaması, tahmin edilebilir token, uzun/expire olmayan oturum.
- Şifre saklama (bcrypt/argon2 mı, düz/MD5/SHA1 ❌), timing-safe karşılaştırma.
- JWT: `alg:none` kabulü, imza doğrulanmaması, secret'ın zayıf/hardcoded olması.
- Login rate limit ve brute-force koruması yokluğu; user enumeration (farklı hata mesajları).

### Authorization Açıkları & IDOR
- Kaynak sahipliği kontrolsüz erişim: `/api/orders/[id]` başkasının kaydını dönüyor mu?
- Rol yükseltme: client'tan gelen `role`/`isAdmin`'e güven; fonksiyon seviyesi yetki eksikliği (BOLA/BFLA).
- Yatay (başka kullanıcı) ve dikey (daha yüksek rol) yetki aşımı.
- Supabase RLS kapalı/yanlış politikalar; service-role key'in client'a sızması.

### Injection (SQL / NoSQL / Command)
- String interpolation ile SQL; parametreli sorgu / ORM kullanımı denetimi; raw SQL noktaları.
- NoSQL operator injection (`{ "$gt": "" }`); dinamik `orderBy`/kolon adı client'tan.
- Command injection: `exec/spawn` içine kullanıcı girdisi; shell string birleştirme.

### XSS / CSRF / SSRF
- **XSS:** `dangerouslySetInnerHTML`, sanitize edilmemiş kullanıcı içeriği, `javascript:` URL'leri.
- **CSRF:** state değiştiren cookie-tabanlı istekler için SameSite/CSRF token; server action / form POST koruması.
- **SSRF:** kullanıcı URL'sine sunucudan istek (webhook test, resim fetch, önizleme) — iç ağ/metadata endpoint (169.254.169.254) koruması, allowlist.

### Path Traversal & File Upload
- `../` ile dosya erişimi; kullanıcı girdisiyle dosya yolu oluşturma.
- Upload: MIME + magic byte kontrolü, boyut limiti, çalıştırılabilir uzantı reddi, rastgele isim, public dizinde script çalıştırma riski.

### Rate Limit / Brute Force / API Abuse
- Login/OTP/reset/ödeme/maliyetli endpoint'lerde limit yokluğu.
- Serverless'ta bellek-içi limit (etkisiz) — dağıtık store (Redis/KV) gerekliliği.
- Pahalı işlemlerin (rapor, export, AI çağrısı) kötüye kullanıma açıklığı.

### Secret & Environment Leak
- Hardcoded API key/secret/şifre (kod, config, client bundle).
- `NEXT_PUBLIC_` ile sızan secret; `.env`'in git geçmişinde olması.
- Client bundle'da service-role/DB credential; kaynak haritasında sızıntı.

### CORS / Open Redirect
- `Access-Control-Allow-Origin: *` + credentials; yansıtılan origin'e körü körüne izin.
- Kullanıcı kontrollü `redirect`/`returnUrl` parametresiyle açık yönlendirme; allowlist yokluğu.

### Webhook / Cron / Serverless Function Güvenliği
- Webhook imza doğrulaması (HMAC/Stripe), raw body, replay koruması.
- Cron endpoint'i `CRON_SECRET` ile korunuyor mu, yoksa herkese açık mı?
- Server Action / route handler'ların public olduğunun farkında olarak auth+validation içermesi.

### Admin Endpoint Güvenliği
- Admin route'ları guard'lı mı, "gizli URL" güvenliği mi? Rol DB'den doğrulanıyor mu?

### Dependency Vulnerability
- `npm audit` / bilinen zafiyetli paketler; terk edilmiş/imzasız bağımlılıklar; aşırı geniş izinli paketler.

### Bilgi Sızıntısı (Logging & Error Messages)
- Log'a şifre/token/PII yazılması; hata yanıtında stack trace/SQL/dosya yolu sızması.
- Ayrıntılı hata mesajıyla sistem iç yapısının açığa çıkması.

### Security Headers / CSP / HSTS
- `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options`/`frame-ancestors`, `Referrer-Policy`, `Permissions-Policy`.
- Next.js'te `next.config` headers veya middleware ile uygulanması.

### Cookie / Session / Token Güvenliği
- `HttpOnly`, `Secure`, `SameSite` bayrakları; hassas token'ın localStorage yerine httpOnly cookie'de olması.
- Session sabitleme (fixation) — login sonrası oturum yenileme; logout'ta gerçek invalidation; token expiry + refresh rotasyonu.

## Zorunlu Rapor Formatı (her bulgu için)
Bu skill sonunda **her açık için** aşağıdaki 8 maddeyi doldur:
1. **Bulunan açık** — net tanım
2. **Risk seviyesi** — Critical / High / Medium / Low (+ neden bu seviye)
3. **Etkilenen dosya/fonksiyon** — `path:line`
4. **Saldırgan bunu nasıl kötüye kullanabilir** — somut senaryo (kavramsal, silah haline getirilmiş exploit değil)
5. **Uygulanan düzeltme** — ne değişti (kod özeti)
6. **Neden açık kapandı** — düzeltmenin savunma mantığı
7. **Kalan risk var mı** — kısmi düzeltme / bağımlı riskler
8. **Test önerisi** — kapanışı doğrulayacak test/senaryo

Ayrıca en başta bir **özet tablo**:
| # | Açık | Risk | Dosya | Durum (Kapatıldı/Öneri) |
|---|---|---|---|---|

## AI Nasıl Davranmalı?
- Spekülasyon yapma; her bulguyu kodda göstererek kanıtla. Bulamadığın açık için "bulunamadı" de, uydurma.
- Davranışı değiştirecek düzeltmelerde (özellikle auth/CORS/CSP) önce planı sun; sessizce kırıp geçme.
- Düzeltmeyi uyguladıktan sonra açığın kapandığını somut senaryoyla doğrula.
- Bir açığı kapatırken yeni açık veya regresyon açmadığını kontrol et.
- Saldırıyı kolaylaştıracak hazır sömürü aracı/script üretme; savunma ve kavramsal senaryoyla sınırlı kal.

## Kritik Uyarılar
- ⚠️ Yalnızca yetkili olduğun sistemi denetle; bu skill üçüncü taraf sistemlere saldırı için değildir.
- ⚠️ Güvenlik düzeltmesini "geçici olarak kapatma" (auth bypass ile test) alışkanlığı yasaktır.
- ⚠️ CORS/CSP/HSTS gibi header değişiklikleri tüm uygulamayı etkiler — önce etki analizi.
- ⚠️ Secret sızmışsa: düzeltme = koddan silmek DEĞİL; secret'ı **rotate etmek** (iptal + yeniden üret). Raporda bunu belirt.
- ⚠️ `.env`'i git geçmişinden temizlemek geçmişi yeniden yazar — kullanıcıya bunu ayrıca bildir.

## Kod Değiştirirken Uygulanacak Güvenli Sıra
1. **Önce oku** — açık noktası + tüm çağıranlar + güven sınırı.
2. **Sonra analiz et** — sömürü senaryosu, etki, kapsam.
3. **Sonra planla** — düzeltme + regresyon riski + gerekirse onay noktası.
4. **Sonra küçük değişiklik yap** — bir açık, bir düzeltme.
5. **Sonra test et** — açık kapandı mı + işlev bozulmadı mı.
6. **Sonra raporla** — 8 maddelik format.

## Yapılacaklar
- ✅ Tüm saldırı yüzeyini (endpoint/action/webhook/cron/upload/admin) haritala.
- ✅ Her kategoriyi sistematik tara; bulguları dosya:satır ile kanıtla.
- ✅ Deny-by-default, least-privilege, defense-in-depth uygula.
- ✅ Sızmış secret'ları rotate önerisiyle bildir.
- ✅ Security header + cookie bayrakları + CSP değerlendir.
- ✅ Her düzeltmeyi test senaryosuyla doğrula.
- ✅ Kapatılamayan/kısmi riskleri açıkça raporla.

## Yapılmayacaklar
- ❌ Kanıtsız/spekülatif açık raporlamak veya bulguyu abartmak.
- ❌ Auth/validation'ı "test için" devre dışı bırakıp öyle bırakmak.
- ❌ Secret'ı sadece koddan silip "kapattım" demek (rotate şart).
- ❌ Silah haline getirilmiş exploit/otomatik saldırı aracı yazmak.
- ❌ Yetkisiz/üçüncü taraf sistemleri hedef almak.
- ❌ CORS'u `*` + credentials yapmak; CSP'yi `unsafe-inline`'la geçiştirmek.
- ❌ Düzeltme sonrası regresyon kontrolü yapmadan işi bitirmek.

## Kontrol Listesi
- [ ] Saldırı yüzeyi tam haritalandı
- [ ] Tüm kategoriler tarandı (authn/authz/IDOR/injection/XSS/CSRF/SSRF/traversal/upload/rate-limit/secret/CORS/redirect/webhook/cron/headers/cookie)
- [ ] Her bulgu dosya:satır + senaryo ile kanıtlı
- [ ] Critical/High düzeltmeleri uygulandı ve test edildi
- [ ] Sızmış secret'lar için rotate önerisi verildi
- [ ] Security header/CSP/cookie değerlendirmesi yapıldı
- [ ] Regresyon kontrolü yapıldı (build/test yeşil)
- [ ] 8 maddelik rapor + özet tablo hazır

## Raporlama Formatı
1. **Yapılan analiz** (kapsam + saldırı yüzeyi haritası)
2. **Bulunan problemler** (özet tablo + her açık için 8 maddelik detay)
3. **Yapılan değişiklikler** (düzeltme özetleri)
4. **Dokunulan dosyalar**
5. **Neden bu çözüm**
6. **Güvenlik etkisi** (kapatılan risk profili)
7. **Performans etkisi**
8. **Test sonucu** (açık-kapandı doğrulamaları + regresyon)
9. **Kalan riskler** (kabul edilen/kısmi/operasyonel — ör. rotate edilmesi gereken secret)
10. **Sonraki öneriler** (izleme, dependency güncelleme, periyodik denetim)

## Kullanım Promptu
```
/security-audit kurallarını yükle ve uygula.
Görev: Bu projeyi baştan sona güvenlik açısından denetle. Saldırı yüzeyini haritala,
tüm kategorileri tara, bulguları risk seviyesiyle önceliklendir. Critical ve High açıkları
güvenli sırayla kapat ve her biri için 8 maddelik bulgu-düzeltme raporunu ver. Sızmış secret
bulursan rotate önerisiyle bildir. Yalnızca bu yetkili projeyi hedef al.
```
