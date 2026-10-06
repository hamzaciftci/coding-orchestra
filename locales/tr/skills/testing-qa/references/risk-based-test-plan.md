# Risk bazlı test planı

## İçindekiler

- Plan şablonu
- Yetkilendirme matrisi
- Route handler'lar ve Server Action'lar
- Webhook'lar
- Cron ve job'lar
- Veritabanına dayanan testler
- Playwright ile end-to-end
- Sonsuza kadar tutmaya değer güvenlik regresyonları
- Flaky testler
- Yayın sonrası smoke

## Plan şablonu

| Risk | Koruyan | Mevcut test | Eksik | Eklenecek test | Seviye |
|---|---|---|---|---|---|
| Kullanıcı başka bir kullanıcının siparişini okur | orders route'undaki `where: { id, userId }` | yok | evet | B kullanıcısı olarak GET 404 döndürür | integration |
| Webhook retry'ında iki kez ödeme | event id üzerinde unique index | yok | evet | aynı event iki kez, tek kredi | integration |

Hatanın maliyetine göre sırala. Seviye, gerçek korumayı çalıştıran en ucuz seviyedir: saf mantık için unit, veritabanı ya da auth içeren her şey için integration, yalnızca tüm stack'i kat eden akışlar için end-to-end.

## Yetkilendirme matrisi

Korumalı işlem başına bir satır, çağıran türü başına bir kolon. Beklenen status'ü doldur, sonra düz bir başarı olmayan her hücre için bir test yaz.

| İşlem | Anonim | Sahip | Başka kullanıcı | Admin |
|---|---|---|---|---|
| GET /api/orders/:id | 401 | 200 | 404 | 200 |
| PATCH /api/profile (role alanı) | 401 | 200, role değişmedi | n/a | 200 |
| action deleteProject | hata | ok | hata, satır hâlâ duruyor | ok |

Yazma işlemlerinde yanıtın yanı sıra sonrasında veritabanı üzerinde de assert et: diğer kullanıcının satırı değişmemiş olmalıdır.

## Route handler'lar ve Server Action'lar

- App Router handler'ları bir `Request` alan fonksiyonlardır. Onları import et ve elle oluşturulmuş bir request ve mock'lanmış bir session helper ile çağır ya da yerel bir sunucuya karşı çalıştır; proje ne yapıyorsa onu izle.
- Server Action'lar export edilen fonksiyonlardır. Session helper'ı matristeki her çağıran için mock'layarak onları doğrudan çağır. Bind edilen ya da hidden argümanlara güvenilmediğini test et.
- Async server component'leri unit test etmek zahmetlidir. Onları end-to-end testlerle kapsa ve mantığı tek başına test edilebilen düz fonksiyonlarda tut.
- Her endpoint için: başarı, geçersiz girdi (ve hiçbir şeyin yazılmadığı), oturum yok, yanlış kullanıcı, bulunamadı, ilgili yerde çakışma ve varsa rate limit.
- Yanıtın içermemesi gereken alanları (`passwordHash`, dahili flag'ler) içermediğini assert et.

## Webhook'lar

- Testlerde imza doğrulamasını açık tut. Bir test secret'ı ile geçerli bir imza üret: Stripe'ın kütüphanesi `stripe.webhooks.generateTestHeaderString({ payload, secret })` sağlar; düz HMAC şemalarında imzayı testin içinde hesapla.
- Case'ler: geçerli imza işlenir; eksik ya da yanlış imza 400 döndürür ve hiçbir şey yazmaz; imzalandıktan sonra değiştirilen bir body reddedilir; aynı event id iki kez gelirse tek etki olur; bilinmeyen bir event tipi onaylanır ve yok sayılır.

## Cron ve job'lar

- Header yokken ve secret yanlışken 401 döner ve hiçbir şey yapılmaz; doğru secret job'ı çalıştırır.
- Job'ı iki kez çalıştır ve etkinin bir kez gerçekleştiğini assert et.
- Secret değişkeni tanımlı değilken de route istekleri reddetmelidir.

## Veritabanına dayanan testler

- Integration testleri için gerçek bir PostgreSQL kullan (yerel bir container, bir test şeması ya da bir branch veritabanı). ORM mock'ları constraint, transaction ya da sorgu bug'larını yakalamaz; asıl önemli olanlar da bunlardır.
- Testleri izole et: test başına rollback edilen bir transaction, testler arasında truncate ya da worker başına bir şema. Paralel çalıştırmalar worker bazında izolasyon gerektirir.
- Test veritabanını kendi değişkeni üzerinden göster ve URL bir test veritabanına benzemiyorsa kurulumun çalışmayı reddetmesini sağla.
- Veriyi küçük factory'lerle kur ki her test yalnızca kendisi için önemli olanı belirtsin.

## Playwright ile end-to-end

- İşin bağlı olduğu birkaç akışı kapsa: kayıt, giriş, ana oluştur-oku-güncelle-sil yolu, sağlayıcının test modunda checkout, çıkış.
- Önce role ve erişilebilir ada göre (`getByRole`, `getByLabel`), sonra test id'ye göre locate et. Class adları ve DOM yapısı çok sık değişir.
- Bir setup project'inde bir kez kimlik doğrula ve `storageState`'i yeniden kullan; gerçek login formundan geçen bir test bırak.
- Web-first assertion'lar (`await expect(locator).toBeVisible()`) kendiliğinden bekler. Sabit sleep'leri kaldır.
- Kritik akışı bir mobil viewport'ta da çalıştır ve kilit sayfalara bir `@axe-core/playwright` taraması ekle.
- Her test kendi verisini oluşturur ve başka bir testin artıklarına bağımlı olmaz.

## Sonsuza kadar tutmaya değer güvenlik regresyonları

- İkinci bir kullanıcı her kayıt endpoint'inde ve action'ında 404 ya da 403 alır.
- Request body'deki ayrıcalıklı alanlar yok sayılır ya da reddedilir.
- Hatalı imzalı bir token, süresi dolmuş bir token ve yanlış algoritmayla imzalanmış bir token reddedilir.
- İmzasız ya da tekrar oynatılan (replay) webhook'lar reddedilir ya da yok sayılır.
- Cron route'ları secret içermeyen istekleri reddeder.
- Allowlist dışındaki bir sıralama ya da filtre parametresi reddedilir.
- Başka bir host'u gösteren bir redirect parametresi izlenmez.

## Flaky testler

Olağan nedenler: gerçek zaman (fake timer'lar ya da enjekte edilen bir saat kullan), seed'siz rastgele veri, satır paylaşan testler, sıraya güvenmek, await edilmemiş promise'ler, animasyonlar ve gerçek servislere yapılan ağ çağrıları. CI'da retry'lar geçici bir sinyal olarak kabul edilebilir, asla çözüm olarak değil.

## Yayın sonrası smoke

Bir deploy'dan sonra: ana sayfalar yanıt verir, giriş çalışır, health endpoint'i yeşildir, kritik akış bir kez tamamlanır ve hata tracker'ı yeni bir sıçrama göstermez. `deployment-readiness` skill'inde HTTP kısmı için bir script vardır.
