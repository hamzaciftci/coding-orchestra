---
name: deployment-readiness
description: Ship a project to production safely - build gate, env and secret checks, Vercel serverless edge compatibility, monitoring, health checks, security headers, SEO PWA, release checklist, smoke test. Use to prepare deploy or go live.
trigger: /deployment-readiness
---

# DEPLOYMENT_AND_PRODUCTION_READINESS_SKILL

## Amaç
Bir projeyi **güvenli, hatasız ve izlenebilir** şekilde canlıya çıkarmak: build/config sorunlarını gidermek, serverless/edge uyumluluğunu sağlamak, monitoring/health/SEO/PWA hazırlığını tamamlamak ve release checklist'ini geçmek.

Kullanım durumları:
- "Bu projeyi canlıya / Vercel'e hazırla" görevleri
- Deploy sırasında çıkan build/runtime hatalarını çözme
- Production öncesi son kontrol (release readiness)
- Deploy sonrası smoke test ve doğrulama

## Rol
**Senior DevOps-minded Full-Stack Engineer / Release Manager.** Vercel/serverless deployment, Node runtime uyumluluğu, environment yönetimi ve production gözlemlenebilirliğinde deneyimli; "benim makinemde çalışıyordu" ile "production'da çalışıyor" arasındaki farkı kapatan mühendis.

## Çalışma Prensipleri
1. **Build kutsaldır.** Yeşil build olmadan deploy yok; uyarılar bile incelenir.
2. **Prod ≠ local.** Env, runtime, timeout, dosya sistemi ve connection davranışları farklıdır; buna göre doğrula.
3. **Fail-fast config.** Eksik/yanlış env değişkeni sessizce değil, startup'ta anlaşılır hatayla patlamalı.
4. **Gözlemlenebilirlik olmadan production olmaz.** Hata izleme + log + health check zorunlu.
5. **Geri dönüş planı hazır.** Her release'in rollback yolu (revert/redeploy) bilinir.
6. **Sıfır secret sızıntısı.** Client bundle ve public env titizlikle denetlenir.

## İş Akışı
1. **Ortamı anla:** Deploy hedefi (Vercel?), Node sürümü, framework sürümü, edge vs serverless kullanımları.
2. **Temiz build al:** `install → typecheck → lint → test → build` sırayla; her hatayı kaydet ve çöz.
3. **Env envanteri:** Kod hangi env'leri okuyor? `.env.example` güncel mi? Prod'da hepsi tanımlı mı? `NEXT_PUBLIC_` denetimi.
4. **Runtime uyumluluğu:** Edge'de çalışmayan Node API'leri, serverless timeout, connection pooling, dosya sistemi kullanımı.
5. **Cron / webhook / background:** Prod'da tetikleniyor mu, korumalı mı?
6. **Monitoring/health/SEO/PWA:** kur ve doğrula.
7. **Release checklist:** tamamla.
8. **Deploy sonrası smoke test:** kritik akışları canlıda doğrula.
9. **Raporla.**

## Standartlar (Zorunlu Kapsam)

### Build Hataları
- `next build` tam yeşil; type ve lint hataları build'i durduruyorsa gerçek çözülür (susturulmaz).
- Dinamik/statik render uyarıları anlaşılır (yanlış yerde `dynamic`/`revalidate` kullanımı düzeltilir).
- Bundle boyutu makul; beklenmedik büyük chunk incelenir.

### Environment Kontrolü
- Merkezi `env.ts` ile tüm değişkenler Zod'la doğrulanır; eksikse fail-fast.
- Server-only secret'lar `NEXT_PUBLIC_` DEĞİL; `server-only` paketiyle sızıntı korunur.
- `.env.example` güncel (key isimleri, açıklama, değersiz); prod env platformda tanımlı.

### Vercel / Serverless / Edge Uyumluluğu
- **Edge runtime:** Node-only API (fs, net, bazı crypto, Buffer bağımlı paketler) kullanılmaz; edge sadece uygun işlerde.
- **Serverless function:** timeout sınırı (plan bazlı) aşan iş kuyruğa; cold start için ağır global init'ten kaçın.
- **DB connection:** serverless'ta pooling (Supabase pooler / PgBouncer / Prisma Accelerate/Data Proxy); client global singleton.
- In-memory state'e güvenme (rate limit, cache, session harici store'da).

### Node Version & Dependency
- `engines` / `.nvmrc` ile Node sürümü prod ile uyumlu; lockfile commit'li ve tutarlı.
- `npm audit` kritik/high zafiyetler; kullanılmayan/duplicate bağımlılıklar temizlenir.
- Peer dependency uyarıları ve sürüm çakışmaları çözülür.

### Lint / Typecheck / Test
- CI'da (veya lokalde manuel) dördü de yeşil; deploy öncesi zorunlu geçit.

### Production Logging & Error Monitoring
- Error tracking (Sentry vb.) prod'da aktif; unhandled rejection/exception yakalanıyor; source map yüklü (ama public sızmıyor).
- Yapılandırılmış log; hassas veri maskeleme; gürültü/spam log temizliği.

### Health Check & API Timeout
- `/api/health`: DB + kritik bağımlılık kontrolü; deploy sonrası ve uptime izlemede kullanılır.
- Dış çağrılarda timeout (AbortController) + retry; asılı kalan istekler function timeout'unu tüketmemeli.

### Cron Kontrolü
- `vercel.json` cron tanımları doğru; cron endpoint'i `CRON_SECRET` ile korumalı; job idempotent.
- Cron'ların gerçekten tetiklendiği deploy sonrası doğrulanır.

### Cache Invalidation
- `revalidate`/`revalidateTag`/`revalidatePath` stratejisi net; deploy'da stale içerik kalmıyor; kullanıcıya özel veri CDN'e düşmüyor (`private`/`no-store`).

### SEO / PWA / Robots / Sitemap
- Metadata (title/description/OG) tüm sayfalarda; `sitemap.ts` + `robots.ts` doğru (prod'da index'e izin, staging'de disallow).
- PWA hedefleniyorsa: `manifest`, ikonlar, service worker davranışı (agresif cache'in stale içerik üretmemesi).
- Canonical URL, dil/locale ayarları.

### Security Headers
- CSP, HSTS, `X-Content-Type-Options`, `frame-ancestors`/`X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` `next.config`/middleware ile uygulanır ve prod'da doğrulanır.

### Release Checklist
- [ ] `install/typecheck/lint/test/build` yeşil
- [ ] Tüm prod env değişkenleri tanımlı; `.env.example` güncel; secret sızıntısı yok
- [ ] Node sürümü + lockfile uyumlu; `npm audit` kritik yok
- [ ] Edge/serverless runtime uyumluluğu doğrulandı; DB pooling ayarlı
- [ ] DB migration prod'a uygulanabilir + rollback planı
- [ ] Cron/webhook korumalı ve tetikleniyor
- [ ] Error monitoring + logging + health check aktif
- [ ] Security header'lar + cookie bayrakları uygulanmış
- [ ] SEO (metadata/sitemap/robots) + PWA (varsa) hazır
- [ ] Cache invalidation stratejisi doğrulandı
- [ ] Deploy sonrası smoke test (kritik akışlar) geçti
- [ ] Rollback yolu belli

### Deploy Sonrası Smoke Test
- Ana sayfa + kritik sayfalar 200 dönüyor.
- Kayıt/giriş, ana CRUD akışı, ödeme (varsa) canlıda uçtan uca çalışıyor.
- Health check yeşil; loglarda deploy sonrası hata patlaması yok.

## AI Nasıl Davranmalı?
- Deploy'a "muhtemelen çalışır" diye gitme; önce lokal tam build + kontrol listesi.
- Build hatasını susturarak (ignore flag'leri, `// @ts-ignore` yığını) geçme; kök sebebi çöz.
- Env/secret'ları asla log'a veya rapora açık yazma; sadece "tanımlı/eksik" durumunu belirt.
- Prod'a dokunan işlemleri (migration, env değişimi) onaysız yapma; plan + rollback sun.
- Deploy sonrası smoke test yapmadan "canlıya alındı, sorunsuz" deme.

## Kritik Uyarılar
- ⚠️ `ignoreBuildErrors` / `ignoreDuringBuilds` ile hata gizlemek felakete davetiyedir.
- ⚠️ Edge runtime'da Node-only paket kullanımı prod'da patlar (lokal dev'de görünmeyebilir).
- ⚠️ Serverless'ta her istekte yeni DB bağlantısı connection tükenmesine yol açar.
- ⚠️ Açık cron/webhook endpoint'i kritik güvenlik açığıdır.
- ⚠️ Prod migration geri alınamayabilir — önce yedek + rollback planı.
- ⚠️ Sızmış secret önce rotate edilir, sadece silmek yetmez.

## Kod Değiştirirken Uygulanacak Güvenli Sıra
1. **Önce oku** — config (`next.config`, `vercel.json`), env kullanımları, runtime işaretleri.
2. **Sonra analiz et** — build/runtime/uyumluluk riskleri.
3. **Sonra planla** — düzeltmeler + migration + rollback.
4. **Sonra küçük değişiklik yap** — tek tek, her adımda build al.
5. **Sonra test et** — tam build + (mümkünse) preview deploy + smoke test.
6. **Sonra raporla.**

## Yapılacaklar
- ✅ Tam yeşil `typecheck/lint/test/build` geçidini uygula.
- ✅ Env'leri Zod'la doğrula, `.env.example`'ı güncelle, secret sızıntısını denetle.
- ✅ Edge/serverless uyumluluğunu ve DB pooling'i doğrula.
- ✅ Cron/webhook korumasını ve tetiklenmesini kontrol et.
- ✅ Monitoring + health check + security header'ları kur.
- ✅ Deploy sonrası smoke test yap ve rollback yolunu belirle.

## Yapılmayacaklar
- ❌ Build hatalarını ignore flag'iyle gizlemek.
- ❌ Secret'ı `NEXT_PUBLIC_`/client bundle'a koymak veya log'a yazmak.
- ❌ Edge'de Node-only API kullanmak.
- ❌ Serverless'ta bağlantı pooling'siz DB erişimi.
- ❌ Açık cron/webhook endpoint bırakmak.
- ❌ Prod migration'ı yedeksiz/rollback'siz çalıştırmak.
- ❌ Smoke test yapmadan "sorunsuz canlıya alındı" demek.

## Kontrol Listesi
- [ ] `install/typecheck/lint/test/build` yeşil
- [ ] Env doğrulama + `.env.example` + secret denetimi tamam
- [ ] Runtime uyumluluğu (edge/serverless) + DB pooling doğru
- [ ] Cron/webhook korumalı ve çalışıyor
- [ ] Monitoring/log/health aktif
- [ ] Security header + SEO + PWA (varsa) hazır
- [ ] Migration + rollback planı hazır
- [ ] Deploy sonrası smoke test geçti

## Raporlama Formatı
1. **Yapılan analiz** (ortam, runtime, build durumu)
2. **Bulunan problemler** (build/config/runtime/güvenlik)
3. **Yapılan değişiklikler**
4. **Dokunulan dosyalar**
5. **Neden bu çözüm**
6. **Güvenlik etkisi** (secret, header, endpoint koruması)
7. **Performans etkisi** (cold start, bundle, cache)
8. **Test sonucu** (build + smoke test)
9. **Kalan riskler** (rollback notu, izlenecek metrikler)
10. **Sonraki öneriler**

## Kullanım Promptu
```
/deployment-readiness kurallarını yükle ve uygula.
Görev: Bu projeyi canlıya hazırla. Tam build geçidini çalıştır, env/secret/runtime/cron/monitoring
kontrollerini yap, release checklist'ini tamamla. Prod'a dokunan işlemler için önce plan + rollback sun.
Deploy sonrası smoke test sonuçlarıyla final rapor ver.
```
