# Webhook'lar, job'lar, para ve serverless runtime

## İçindekiler

- Webhook'lar
- Cron ve arka plan job'ları
- Idempotency ve para
- Transaction'lar ve race condition'lar
- Rate limit
- Dış çağrılar
- Cache
- Runtime
- Yapılandırma

## Webhook'lar

- Başka hiçbir şey yapmadan önce imzayı ham request body üzerinden doğrula. Bir App Router route handler'ında: `const raw = await req.text()`, ardından sağlayıcının doğrulayıcısı (`stripe.webhooks.constructEvent(raw, req.headers.get("stripe-signature"), secret)`). Önce `req.json()` ile parse etmek byte'ları değiştirir; bu ya doğrulamayı bozar ya da birini doğrulamayı atlamaya iter.
- Yerel testi kolaylaştırmak için doğrulamayı asla kapatma. Sağlayıcının CLI'ını ya da bir test secret'ı kullan.
- Sağlayıcının event id'si üzerinde unique constraint ile tekrarları ele; sağlayıcılar yeniden gönderir.
- Tutarı, planı ve müşteriyi doğrulanmış event'ten ya da kendi kayıtlarından al.
- Hızlı yanıt ver. İşleme yavaşsa event'i kaydet ve bir job içinde işle, çünkü sağlayıcılar timeout'a düşer ve yeniden dener.
- Event'ler sırasız gelir. State'e geliş sırasına göre değil, event'in verisine bakarak ya da güncel nesneyi çekerek karar ver.

## Cron ve arka plan job'ları

- Bir cron route'u herkese açık bir GET'tir. `Authorization: Bearer <CRON_SECRET>` kontrolünü yap ve değişkenin tanımlı olduğunu doğrula; tanımsız bir değişkenle karşılaştırma `Bearer undefined` string'iyle eşleşir.
- `vercel.json` içindeki path, route ile birebir eşleşmelidir.
- Job'lar iki kez çalışmaya ve kendileriyle çakışmaya karşı güvenli olmalıdır: satırları işlendi olarak işaretle ya da işi atomik bir update ile sahiplen.
- Fonksiyonun süre limitini aşabilecek işler batch'lere bölünür ya da bir kuyruğa taşınır (QStash, Inngest, Trigger.dev ya da projenin zaten kullandığı çözüm). Tüketen endpoint'te kuyruk sağlayıcısının imzasını doğrula.
- Bir request içinde e-posta göndermek ya da yavaş iş yapmak request'i yavaşlatır ve fonksiyon dondurulursa iş kaybolur. Kısa takip işleri için `after()` / `waitUntil`, geri kalanı için kuyruk kullan.

## Idempotency ve para

- Ödeme ve diğer maliyetli POST'larda bir idempotency key kabul et, bunu sonucun yanında unique constraint ile sakla ve tekrar gelen istekte saklanan sonucu döndür.
- "Yalnızca bir kez" kuralını kodda olduğu kadar veritabanında da (doğal anahtar üzerinde unique index) zorunlu kıl. Yalnızca uygulama seviyesindeki bir kontrol, eşzamanlı iki isteğe yenilir.
- Fiyatları ve toplamları sunucuda, kendi verinden hesapla. Client'tan gelen fiyat, indirim ya da kullanıcı id'si yalnızca bir öneridir.
- Parayı en küçük birim cinsinden tam sayı olarak ya da `numeric`/`Decimal` ile sakla. Float'lar kuruş kaybeder.

## Transaction'lar ve race condition'lar

- Birlikte başarılı ya da birlikte başarısız olması gereken ilişkili yazmalar tek bir transaction'a girer.
- Ağ çağrılarını transaction'ların dışında tut. Dış servisi önce ya da sonra çağır ve bir tarafın başarılı, diğerinin başarısız olduğu durum için bir telafi adımı bulundur.
- Oku-sonra-yaz bir race condition'dır. Atomik bir ifade (`UPDATE ... SET stock = stock - 1 WHERE id = $1 AND stock > 0` ve etkilenen satır sayısının kontrolü) ya da satır kilidi kullan.
- Prisma'da `$transaction`'ın dizi biçimi tek bir round trip'tir; interaktif biçimi tüm süresi boyunca bir bağlantıyı elinde tutar.

## Rate limit

- Modül değişkenindeki state, serverless'ta hiçbir şeyi sınırlamaz. Paylaşılan bir store kullan (Upstash Ratelimit, Redis ya da düşük hacimler için bir veritabanı tablosu).
- Kimliği doğrulanmış isteklerde kullanıcı id'sine, diğerlerinde IP'ye göre anahtarla; login için hem hesaba hem IP'ye göre sınırla ki ne enumeration ne de bir mağdurun hesabını kilitlemek kolay olsun.
- Paraya mal olan ya da bilgi sızdıran şeyleri sınırla: login, signup, şifre sıfırlama, OTP, LLM çağıran ya da mesaj gönderen her şey, export'lar.

## Dış çağrılar

- Dışarıya giden her çağrının bir timeout'u olur (`AbortSignal.timeout(ms)`). Aksi halde takılan bir upstream, fonksiyonun tüm süresini tüketir.
- Yalnızca idempotent işlemleri, backoff ve küçük bir üst sınırla yeniden dene. Idempotent olmayan bir POST yeniden denenecekse upstream API'de bir idempotency key gerekir.

## Cache

- Kurulu Next.js sürümünün `fetch`, GET route handler'ları ve `unstable_cache` / `use cache` için cache varsayılanlarını kontrol et; major sürümler arasında değiştiler.
- Kullanıcıya özel veri asla paylaşılan bir cache'e düşmemelidir. Oturuma bağlı yanıtlar dinamik render ya da `Cache-Control: private, no-store` gerektirir.
- Bir cache'i yalnızca invalidation'ıyla birlikte ekle: hangi mutation onu temizliyor ve nasıl.

## Runtime

- Veritabanı client'ını instance başına bir kez oluştur ve yeniden kullan (development'ta `globalThis` koruması). Pool'lanmış connection string'i kullan; pooler ayrıntıları için `deployment-readiness` skill'ine bak.
- Edge runtime'ı yalnızca Node'dan hiçbir şeye ihtiyaç duymayan kod için kullan. Veritabanı driver'ları, `fs`, Web Crypto'nun ötesindeki `crypto` ve birçok SDK orada çalışmaz.
- Dosya sistemi kalıcı değildir; dosyaları object storage'a yaz.
- Modülün en üst seviyesini hafif tut. En üstte import edilen her şeyin bedeli her cold start'ta ödenir.

## Yapılandırma

- Environment variable'ları, onları başlangıçta doğrulayan ve tipli değerler export eden tek bir modülde oku. Eksik bir değişken uygulamanın açılmasını engellemelidir.
- Yalnızca sunucuya ait değerler asla public prefix almaz ve bunları tutan modüller `import "server-only"` ile başlar.
- Bir değişken eklediğinde, aynı değişiklikte adını örnek dosyaya da ekle.
