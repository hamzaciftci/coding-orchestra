# Stack'e özgü güvenlik tuzakları

Next.js (App Router), serverless platformlar, Supabase, Prisma ve Stripe'ta kolayca gözden kaçan hata modları. Bu genel bir web güvenliği checklist'i değildir; standart sınıfları zaten kontrol ettiğini varsayar ve bu stack'e özgü olanları ekler.

## İçindekiler

- Kimlik ve oturumlar
- Yetkilendirme
- Server Action'lar
- Middleware
- Supabase
- Prisma ve SQL
- Webhook'lar
- Cron ve arka plan route'ları
- Secret'lar ve client bundle'ı
- Kötüye kullanım ve rate limit
- SSRF, redirect'ler ve render
- Upload'lar
- CORS, cookie'ler ve header'lar
- Bağımlılıklar

## Kimlik ve oturumlar

- `jwt.decode` (jsonwebtoken) ve `decodeJwt` (jose), bir token'ı imzasını kontrol etmeden okur. Çıktılarına güvenen her şey client'a güveniyordur. Açık bir algoritma listesiyle `verify` / `jwtVerify` ara.
- `process.env.JWT_SECRET || "dev-secret"` gibi bir fallback secret, değişken eksik olduğunda production'ın herkesin bildiği bir string ile sessizce imzalaması demektir. Bunun yerine secret eksikse uygulama başlangıçta hata vermelidir.
- Expiry'si olmayan token'lar ve token geçerli kalırken yalnızca cookie'yi silen logout.
- `httpOnly`, `secure` ve `sameSite` olmadan set edilen oturum cookie'leri. Seçenek verilmeden çağrılan `cookies().set(name, value)` bunların hiçbirini set etmez.
- bcrypt, scrypt ya da argon2 yerine hızlı bir digest (SHA-256, MD5) ile hash'lenen parolalar; `===` ile hash karşılaştırma.
- Mesaj, status code ya da zamanlama üzerinden bir hesabın var olup olmadığını ele veren login ve şifre sıfırlama yanıtları.

## Yetkilendirme

- Klasik hata: bir handler kimliği doğrular, sonra yalnızca id ile yükler. `findUnique({ where: { id } })` herkesin kaydını döndürür. Sahiplik sorguya aittir (`where: { id, userId }`); aynısı `update`, `delete`, `updateMany` ve `deleteMany` için de geçerlidir.
- `include` ve eksik `select`, ilişkili satırları bütün halinde döndürür. `user`'ını include eden bir sipariş genellikle parola hash'ini ve e-postayı da beraberinde gönderir.
- Mass assignment: `data: body` ya da `data: { ...body }`, çağıranın `role`, `credit`, `ownerId` ya da `emailVerified` alanlarını set etmesine izin verir.
- Rolün veritabanı yerine token'dan ya da request'ten okunması. Admin ve para işlemlerinde güncel rolü sunucu tarafında kontrol et.
- Yalnızca link verilmemiş olmasıyla ya da client tarafındaki bir redirect ile korunan admin route'u.
- Tenant ya da sahip filtresi olmayan liste endpoint'leri ve kullanıcı id'sini query string'den alan export'lar.

## Server Action'lar

- `"use server"` dosyasında export edilen her fonksiyon herkese açık bir POST endpoint'idir. Bir sayfa formunu render etsin ya da etmesin, siteye ulaşabilen herkes tarafından herhangi bir argümanla çağrılabilir. Her action kendi kimlik doğrulamasına, yetkilendirmesine ve girdi validation'ına ihtiyaç duyar.
- `.bind(null, id)` ile geçirilen argümanlar ve hidden form alanları client'ın kontrolündedir. Closure içinde yakalanan değerler şifrelenir, ama bu bir yetkilendirme kontrolü değildir.
- Action'lar değerleri client'a döndürür; tam bir veritabanı satırı döndürmek kolonlarını sızdırır.
- Action'lar framework'ten same-origin kontrolü alır. Route handler'lar almaz.

## Middleware

- `middleware.ts` (Next.js 16'dan itibaren adı `proxy.ts`) yalnızca `matcher`'ının kapsadığı path'lerde çalışır. `/dashboard/:path*` şeklindeki bir matcher hiçbir `/api` route'unu korumaz. Matcher'ı tam route listesiyle karşılaştır.
- Middleware genellikle bir cookie'nin geçerli olduğunu değil, var olduğunu kontrol eder. Onu bir redirect kolaylığı olarak gör ve gizli veri okuyan her handler'ın, action'ın ve server component'in oturumu kendisinin kontrol etmesini bekle.
- CVE-2025-29927 düzeltmesinden önceki Next.js sürümleri, özel hazırlanmış bir header ile middleware'in atlanmasına izin veriyordu. Eski bir sürümde yalnızca middleware'e dayanan yetkilendirme tek başına bir bulgudur.

## Supabase

- Anon key tasarım gereği herkese açıktır. `service_role` key'i Row Level Security'yi tamamen atlar; asla public prefix almamalı, bir client component'e import edilmemeli ya da bir tarayıcı client'ı oluşturmak için kullanılmamalıdır.
- RLS, dışarıya açık bir şemadaki her tabloda etkin olmalıdır. RLS'siz bir tablo, uygulamanın kendi route'ları ne yaparsa yapsın, anon key'i elinde tutan herkes tarafından doğrudan REST API üzerinden okunabilir ve yazılabilir.
- Fiilen açık olan policy'ler: `using (true)`, `select` için olup `update`'i kısıtlayan hiçbir policy'nin olmaması ya da kullanıcının set edebildiği bir kolonla karşılaştıran policy'ler.
- `user_metadata` kullanıcı tarafından düzenlenebilir. Yetkilendirme verisi `app_metadata`'ya ya da bir tabloya aittir.
- Sunucuda `auth.getSession()`, cookie'yi auth sunucusuna karşı yeniden doğrulamadan okur. Erişimi belirleyen her şey için `auth.getUser()` (ya da doğrulanmış claim'ler) kullan.
- View'lar `security_invoker` ile oluşturulmadıkça sahibinin haklarıyla çalışır; dolayısıyla bir view, temel tablolarındaki RLS'i atlayabilir.
- Storage bucket'larının kendi policy'leri vardır; public bir bucket her nesneyi URL'e sahip herkese sunar.
- Yalnızca dashboard'da yapılan yapılandırmayı repo'dan göremezsin. Policy'ler migration'larda değilse RLS'i **Doğrulama gerekli** olarak raporla ve neyin kontrol edileceğini söyle.

## Prisma ve SQL

- İnterpolasyonlu girdiyle `$queryRawUnsafe` ve `$executeRawUnsafe`, SQL injection'dır. Tagged-template biçimleri olan `$queryRaw` ve `$executeRaw`, içlerinde `Prisma.raw` kullanılmadıkça parametrelidir.
- Identifier'lar parametrelenemez. Client'tan gelen sıralama kolonları ve yönleri bir allowlist gerektirir.
- Parse edilmiş bir JSON body'yi doğrudan `where`'e geçirmek, çağıranın operatör nesneleri (`{ "email": { "contains": "" } }`) göndermesine ve filtrenin anlamını değiştirmesine izin verir. Önce primitive'lere doğrula.
- Girdiden kurulan string komutlarla `child_process`; argüman dizisi alan `execFile`'ı tercih et.

## Webhook'lar

- İmza ham body'ye karşı doğrulanmalıdır. Bir route handler'ında bu, `await req.text()` ve ardından `stripe.webhooks.constructEvent(raw, signature, secret)` demektir. `req.json()` çağırıp `event.type`'a güvenen bir handler herkesten sahte event kabul eder; ödeme webhook'larında bu bedava kredi demektir.
- Sağlayıcılar yeniden dener. Event id'si üzerinde tekrar eleme (unique bir kolon ya da işlenmiş event'ler tablosu) yoksa bir retry hakkı iki kez tanımlar.
- Tutarlar ve kullanıcı id'leri, hiç kontrol edilmemiş, client'ın verdiği metadata'dan değil, doğrulanmış event'ten ya da kendi veritabanı kaydından gelmelidir.
- Özel HMAC doğrulaması `crypto.timingSafeEqual` ile karşılaştırmalı ve eski timestamp'leri reddetmelidir.

## Cron ve arka plan route'ları

- Bir cron route'u sıradan, herkese açık bir URL'dir. Vercel `Authorization: Bearer <CRON_SECRET>` header'ını yalnızca `CRON_SECRET` değişkeni tanımlıysa gönderir ve handler'ın bunu karşılaştırması gerekir. Bu kontrol olmadan herkes job'ı tetikleyebilir; bu da genellikle bir silme, toplu e-posta gönderimi ya da faturalama çalışmasıdır.
- Değişkenin tanımlı olduğunu önce kontrol etmeden header'ı `"Bearer " + process.env.CRON_SECRET` ile karşılaştırmak, değişkenin eksik olduğu her yerde beklenen değeri `Bearer undefined` literal string'i yapar ve bunu herkes gönderebilir.
- Aynısı kuyruk consumer'ları ve diğer servislerin çağırdığı "dahili" endpoint'ler için de geçerlidir: sağlayıcının imzasını doğrula (QStash, Inngest ve diğerlerinin her biri bir imza sağlar).
- `vercel.json` içinde hiçbir route ile eşleşmeyen bir cron path'i, job'ın hiç çalışmaması demektir. Bu bir güvenilirlik bulgusudur ve temizlik ya da faturalama işini koruyorsa raporlanmaya değer.

## Secret'lar ve client bundle'ı

- `NEXT_PUBLIC_` (ya da `VITE_`, `PUBLIC_`) prefix'li her şey, build zamanında her ziyaretçiye sunulan JavaScript'in içine gömülür. Böyle bir prefix'in arkasındaki secret zaten sızmıştır.
- Bir client component tarafından import edilen bir sunucu modülü, kodunu ve sabitlerini bundle'a sürükleyebilir. Sunucu modüllerinin en üstündeki `import "server-only"` bunu bir build hatasına çevirir.
- Git tarafından takip edilen env dosyalarını, loglardaki ve hata yanıtlarındaki secret'ları ve production'a yayınlanmış source map'leri kontrol et.
- Bir tane bulduğunda: raporda adı ve konumu, kullanıcının işlemi olarak rotation; değeri asla.

## Kötüye kullanım ve rate limit

- Bir `Map` ya da modül değişkenine dayanan rate limiter serverless'ta hiçbir işe yaramaz. Her instance'ın kendi belleği vardır ve instance'lar sürekli oluşturulup yok edilir. Limitler paylaşılan bir store gerektirir (Upstash, Redis, veritabanı).
- Çağıranın seçtiği bir değere (body'deki bir e-posta) göre anahtarlanan limitler atlatılabilir ve bir mağdurun hesabını kilitleyebilir. Kimliği ve IP'yi birlikte kullan.
- Çağrı başına paraya mal olan endpoint'ler (LLM çağrıları, e-posta ve SMS gönderimi, export'lar, görsel işleme), arkalarında gizli bir şey olmasa bile kimlik doğrulama ve bir limit gerektirir.

## SSRF, redirect'ler ve render

- Sunucudaki `fetch(userSuppliedUrl)`, dahili servislere ve cloud metadata adreslerine ulaşır. Mümkün olan yerde host'ları allowlist'e al; değilse adresi çözümle, private, loopback ve link-local aralıkları reddet ve redirect'lerden sonra yeniden kontrol et.
- Hedefini çağıranın verdiği `redirect(next)` ya da `NextResponse.redirect(next)` bir open redirect'tir. Yalnızca same-origin relative path'leri kabul et. Yalın bir `startsWith("/")` kontrolü yeterli değildir: `//evil.example` ve `/\evil.example` bu kontrolden geçer ve başka bir host'a çözümlenir.
- Saklanan içerikle `dangerouslySetInnerHTML`, `href={userValue}` (`javascript:`'e izin verir) ve ham HTML etkinken render edilen Markdown.
- `err.stack`, `String(err)` ya da ham veritabanı hatalarını içeren hata yanıtları.

## Upload'lar

- Client'ın MIME tipine ya da uzantısına güvenmek; boyut limiti olmaması; storage path'lerinde kullanıcının seçtiği dosya adlarının kullanılması.
- Uygulamanın kendi origin'inden sunulan SVG ve HTML upload'ları o origin'de script çalıştırır.
- Kimin istediği ya da hangi path'e yazabileceği kontrol edilmeden verilen signed upload URL'leri.

## CORS, cookie'ler ve header'lar

- İstismar edilebilir CORS hatası, request'in `Origin` değerini `Access-Control-Allow-Credentials: true` ile birlikte geri yansıtmaktır. Credentials ile birlikte literal bir `*` tarayıcılar tarafından reddedilir, ama niyetin her şeye izin vermek olduğunu gösterir ve işaretlenmeye değer.
- `GET` ile state değiştiren ya da `sameSite: "none"` ile cross-site form post'larını kabul eden, cookie ile kimlik doğrulayan route handler'lar.
- Eksik temel header'lar: `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, `frame-ancestors` ya da `X-Frame-Options`, `Referrer-Policy`. Script'ler için `unsafe-inline` gerektiren bir CSP çoğunlukla göstermeliktir; Next.js'te olağan çözüm nonce'lardır.

## Bağımlılıklar

- Paket yöneticisinin audit'ini çalıştır ve özellikle `next` ile `react`'in kurulu sürümlerine ait advisory'leri oku. Framework seviyesindeki sorunlar ağır olmuştur; yukarıdaki middleware bypass'ı ve Aralık 2025'te açıklanan React Server Components remote code execution açığı (CVE-2025-55182) bunlara dahildir. Eski bir framework sürümü, uygulama seviyesindeki tüm bulgulardan daha ağır basabilir.
- Lockfile eksik ya da commit edilmemiş; dolayısıyla production, test edilenlerden farklı sürümler kurabilir.
