# Yerelde çalışıp production'da bozulanlar

Vercel üzerinde PostgreSQL kullanan Next.js için yazılmıştır. Platform limitleri ve varsayılanları planlar ve framework sürümleri arasında değişir; bu yüzden bir sayının önem taşıdığı yerde, hatırlanan bir değere güvenmek yerine projenin config'ini ve platformun güncel dokümantasyonunu oku.

## İçindekiler

- Build
- Environment variable'lar
- Runtime: serverless ve edge
- Veritabanı bağlantıları
- Migration'lar
- Cron, webhook'lar ve arka plan işleri
- Cache
- Gözlemlenebilirlik
- Arama motorları ve staging
- Rollback

## Build

- Next config'indeki `typescript.ignoreBuildErrors` ve `eslint.ignoreDuringBuilds`, bozuk kodu yayınlarken build'in geçmesini sağlar. Bunları kaldır ve ortaya çıkanları düzelt.
- Prisma client build makinesinde generate edilmelidir. Platformlar `node_modules`'ü cache'ler; `postinstall` ya da build script'inde `prisma generate` yoksa production, şemayla uyuşmayan eski bir client çalıştırır.
- Yerel build'ler `.env.local` dosyasını okur; platform okumaz. Build zamanında bir değişkene ihtiyaç duyan build (public prefix'li her şey, static generation sırasında okunan her şey), o ortam için tanımlı değilse başarısız olur ya da içine `undefined` gömer.
- Node sürümünü sabitle (package.json içinde `engines` ya da `.nvmrc`) ve lockfile'ı commit et; aksi halde platform kendi varsayılanını seçer.
- Büyük/küçük harfe duyarlı dosya sistemleri: dosya adından yalnızca harf büyüklüğüyle ayrılan bir import, macOS ve Windows'ta çalışır, Linux builder'larda başarısız olur.

## Environment variable'lar

- Public prefix'li değişkenler (`NEXT_PUBLIC_`) build zamanında koda gömülür. Platformda birini değiştirmenin bir sonraki build'e kadar etkisi olmaz; bu prefix verilmiş bir secret ise her ziyaretçiye yayınlanır.
- Platformlar değişkenleri ortam bazında (production, preview, development) kapsamlandırır. Yalnızca production için tanımlanmış bir değişken preview deploy'larını bozuk bırakır; tersi ise bir preview değerini production'a taşır.
- Başlangıçta validation yoksa eksik bir değişken, ona ihtiyaç duyan ilk request'te, belki de nadir kullanılan bir path'te günler sonra bir runtime hatası olarak ortaya çıkar. `process.env`'i açılışta bir şemaya göre doğrulamak bunu başarısız bir deploy'a çevirir.
- `process.env.SECRET || "dev"` gibi fallback'ler eksik bir değişkeni gizler ve bir çökmeden daha kötüdür.

## Runtime: serverless ve edge

- Edge runtime Node değildir. `fs`, `net`, `child_process`, native modüllerin çoğu ve birçok veritabanı driver'ı orada yoktur. Bunlardan herhangi birini import eden, `export const runtime = "edge"` içeren bir route `next dev`'de çalışıp deploy edildiğinde başarısız olabilir. Middleware geçmişte edge runtime'da çalışmıştır; kurulu Next sürümünün ne yaptığını kontrol et.
- Fonksiyonların plana ve yapılandırmaya bağlı bir maksimum süresi vardır. Bunu aşabilecek işler (export'lar, toplu e-posta, uzun LLM çağrıları) bir kuyruğa ya da arka plan job'ına aittir ya da `maxDuration` değerinin bilinçli olarak yükseltilmesini gerektirir.
- Dosya sistemi, invocation'lar arasında paylaşılmayan geçici bir dizin dışında salt okunurdur. Oraya yazılan dosyalar bir sonraki request'te yoktur.
- Modül seviyesindeki state (bir `Map` cache'i, bir rate limit sayacı, bellekte tutulan bir session store) instance başınadır ve cold start'ta kaybolur. Paylaşılması gereken her şey harici bir store'da yaşar.
- Yanıt döndükten sonra başlatılan iş dondurulabilir ya da öldürülebilir. Yanıt sonrası işler için framework'ün `after()` fonksiyonunu ya da platformun `waitUntil`'ını kullan.
- Streaming ve büyük yanıtlar payload limitlerine tabidir; bir fonksiyon üzerinden yapılan dosya upload'ları request body limitine takılır, bu yüzden büyük upload'lar signed URL ile doğrudan storage'a gider.

## Veritabanı bağlantıları

- Her fonksiyon instance'ı kendi bağlantılarını açar. Pooler olmadan bir trafik sıçraması PostgreSQL'in bağlantı limitini tüketir ve her request başarısız olur. Uygulama için sağlayıcının pool'lanmış connection string'ini kullan (Supabase'in pooler'ı, PgBouncer, Prisma Accelerate, Neon'un pooled endpoint'i).
- Transaction modundaki bir pooler'ın arkasında Prisma kullanırken pool'lanmış URL `pgbouncer=true` ister ve migration'lar doğrudan bir bağlantı (`directUrl`) gerektirir, çünkü pooler'ın desteklemediği özellikleri kullanırlar.
- Client'ı instance başına bir kez oluştur. Bir request handler'ının içinde ya da `globalThis` koruması olmadan hot-reload olan bir modülde `new PrismaClient()` bağlantı sızdırır.
- İnteraktif transaction'lar tüm süreleri boyunca bir bağlantıyı elinde tutar; ağ çağrılarını bunların dışında tut.

## Migration'lar

- Production `prisma migrate deploy` kullanır (ya da sağlayıcının, commit edilmiş migration dosyalarını uygulayan eşdeğerini). `prisma migrate dev` ve `prisma db push` geliştirme araçlarıdır: veriyi sıfırlayabilir ya da şemayı migration geçmişi olmadan değiştirebilirler.
- Migration'ların deploy'a göre ne zaman çalışacağına karar ver. Yeni kod yayına girmeden önce çalışıyorlarsa eski kod yeni şemayla çalışmalıdır; sonra çalışıyorlarsa yeni kod eski şemayı tolere etmelidir. Tek adımda yapılan bir kolon yeniden adlandırma ya da silme, hangi taraf ikinci çalışıyorsa onu bozar. Expand/contract sırası için `database-api-design` skill'ine bak.
- Veri silen ya da yeniden yazan bir migration'dan önce yedek al ya da point-in-time recovery'nin açık olduğunu teyit et.

## Cron, webhook'lar ve arka plan işleri

- `vercel.json` cron'larındaki her `path`, var olan bir route ile birebir eşleşmelidir. Bir yazım hatası, job'ın sessizce hiç çalışmaması demektir.
- Cron zamanlamaları UTC'dir, yalnızca production deploy'una karşı çalışır ve sıklıkları plana göre sınırlanabilir.
- Cron route'ları herkese açık URL'lerdir. Handler `Authorization: Bearer <CRON_SECRET>` kontrolünü yapmak, değişken de tanımlı olmak zorundadır; yoksa herkes tetikleyebilir.
- Webhook endpoint'leri, test modundaki secret'tan farklı olan production signing secret'ına ihtiyaç duyar ve endpoint URL'inin sağlayıcıda production domain'i için kayıtlı olması gerekir.
- Job'lar ve webhook handler'ları pratikte birden fazla kez çalışır. İlk gerçek retry idempotent olmadıklarını kanıtlamadan önce idempotent olduklarını kontrol et.

## Cache

- Cache varsayılanları Next.js major sürümleri arasında değişti (`fetch`, GET route handler'ları ve client router cache'i için). Varsaymak yerine kurulu sürümün davranışını oku.
- Kullanıcıya özel veri içeren, statik render edilmiş ya da cache'lenmiş bir sayfa, bir kullanıcının verisini herkese sunar. Kişiselleştirilmiş her şey dinamik render ya da `private` / `no-store` cache header'ları gerektirir.
- Her cache'in adı konmuş bir invalidation yolu olmalıdır (`revalidateTag`, `revalidatePath`, bir TTL). Mutation'ların bunu çağırdığını kontrol et.
- Agresif cache'leme yapan bir service worker, deploy'dan sonra eski build'i sunmaya devam eder.

## Gözlemlenebilirlik

- Hata takibi hem sunucu hem client için bağlanmış olmalı; source map'ler tracker'a yüklenmeli, herkese açık sunulmamalıdır.
- Veritabanını ve kritik bağımlılıkları kontrol eden bir health endpoint'i, smoke test'e ve uptime monitoring'e çağıracak bir şey verir.
- Loglar yapılandırılmış olmalı; token, parola ve kişisel veri içermemelidir.
- Route handler'lardaki yakalanmamış promise rejection'ları yalnızca fonksiyon loglarında görünür. Yayından önce bu logların nerede olduğunu öğren.

## Arama motorları ve staging

- `robots.ts` ve `sitemap.ts` production domain'ini tarif etmelidir. Özel domain'deki bir staging sitesi engellenmedikçe index'lenebilir; platformun preview URL'leri genellikle otomatik olarak noindex işaretlenir, özel domain'ler işaretlenmez.
- Metadata: herkese açık her sayfanın bir title'ı ve description'ı vardır; Open Graph görsellerinin çözümlenmesi için `metadataBase` production URL'idir.

## Rollback

- Platform rollback'i önceki bir build'i saniyeler içinde geri getirir. Veritabanına, environment variable'lara ya da üçüncü taraf yapılandırmasına dokunmaz.
- Bir sürüm, ancak önceki build mevcut şemayla hâlâ çalışıyorsa güvenle geri alınabilir. Sürümde bunu bozan her migration'ı açıkça belirt.
- Deploy etmeden önce komutu ya da dashboard işlemini öğren ve rapora yaz.
