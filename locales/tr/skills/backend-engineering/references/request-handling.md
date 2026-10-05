# Request işleme: handler'lar ve Server Action'lar

Kendi konvansiyonu olmayan projeler için varsayılanlar ve doğru görünen kodun yanlış olduğu yerler.

## İçindekiler

- Kontrollerin sırası
- Kimlik doğrulama
- Yetkilendirme
- Validation
- Hatalar ve yanıt biçimi
- Listeler
- Server Action'lar
- Sözleşme değişiklikleri

## Kontrollerin sırası

Önce ucuz retler gelir: rate limit (gereken yerde), kimlik doğrulama, girdi validation'ı, yüklenen kayda karşı yetkilendirme, iş mantığı, yanıt. Projede bir servis katmanı varsa iş mantığını handler gövdesinin dışında tut ve projenin düzenini izle.

## Kimlik doğrulama

- Korumalı her handler ve action'da oturumu sunucuda doğrula. Bir helper varsa (`auth()`, `getUser()`, `requireUser()`) onu kullan; ikinci bir mekanizma yazma.
- Sunucuda Supabase kullanırken erişimi `auth.getUser()` ya da doğrulanmış claim'lere bağla. `auth.getSession()` cookie içeriğine güvenir.
- Elle yazılmış JWT'lerde: açıkça belirtilmiş bir algoritmayla doğrula, expiry'yi zorunlu tut ve secret eksikse başlangıçta hata ver.
- Login, signup ve şifre sıfırlama yanıtları bir hesabın var olup olmadığını ele vermemelidir.
- Oturum cookie'leri: `httpOnly`, `secure`, `sameSite: "lax"` ya da daha sıkısı.

## Yetkilendirme

- Sahipliği sorguya koy: `where: { id, userId: user.id }`. Id ile yükleyip sonradan karşılaştırmak çalışır ama bir sonraki handler'da kolayca unutulur; kapsamı daraltılmış bir sorgu yarı yolda unutulamaz.
- Çağıranın görmemesi gereken bir kayıt için, kaydın varlığı da gizliyse 403 değil 404 döndür.
- Admin ve para işlemlerinde rolü veritabanından kontrol et. Token'daki rol claim'i, token ne kadar eskiyse o kadar eskidir.
- Supabase: anon ya da user client ile kapsamı RLS belirler, dolayısıyla policy'nin var olması gerekir. Service-role client ile hiçbir şey belirlemez; kapsamı elle daralt ve o client'ı server-only modüllerde tut.

## Validation

- `body`, `searchParams`, route `params`, güvendiğin header'lar ve webhook payload'larını parse et. Zod ile `safeParse` kullan ve alan bazında hataları, proje hangisini kullanıyorsa 400 ya da 422 status'üyle döndür.
- Yazma işlemini parse edilmiş sonucun adı belli alanlarından kur. `data: parsed.data` yalnızca şema bilinmeyen key'ler konusunda katıysa ve ayrıcalıklı bir alan içermiyorsa güvenlidir.
- Her şeye sınır koy: string uzunlukları, dizi boyutları, sayı aralıkları, sayfa boyutları.
- Params içindeki ID'ler de girdidir. Veritabanına ulaşmadan önce formatlarını doğrula.

## Hatalar ve yanıt biçimi

- Projenin bir envelope'u varsa onu kullan. Yoksa işe yarar bir varsayılan, başarıda `{ data }` ve hatada `{ error: { code, message, fields? } }` biçimidir; sonucun sınıfını HTTP status taşır.
- Beklenen hatalar (validation, bulunamadı, çakışma) belirli kodlar döndürür. Beklenmeyenler bir request id ile loglanır ve genel bir 500 olarak döndürülür.
- Asla `String(err)`, `err.stack` ya da veritabanı hatasını döndürme.
- Client'lar için önem taşıyan status code'lar: 400 ya da 422 geçersiz girdi, 401 geçerli oturum yok, 403 izin yok, 404 bulunamadı ya da gizli, 409 çakışma ya da tekrar, 429 `Retry-After` ile rate limit.

## Listeler

- Her liste endpoint'inin, üst sınırı sunucuda zorunlu kılınan bir sayfa boyutu vardır.
- Büyük ya da sık değişen kümeler için cursor pagination; küçük admin tablolarında offset yeterlidir.
- Sıralama ve filtre alanları bir allowlist'ten gelir. Client'ın verdiği bir kolon adı asla `orderBy`'a ya da ham SQL'e girmez.
- Client'ın ihtiyaç duyduğu kolonları seç. Satırın tamamını döndürmek, sonradan eklenen alanları sızdırır.

## Server Action'lar

- Export edilen her action'ı herkese açık bir POST endpoint'i gibi ele al: kimlik doğrulamayı, argüman validation'ını ve kayda karşı yetkilendirmeyi action'ın kendi içinde yap.
- Bind edilenler ve hidden input'lar dahil tüm argümanlar saldırganın kontrolündedir.
- Veritabanı satırları değil, client için tasarlanmış, serialize edilebilir sade sonuçlar döndür (`{ ok: true }` ya da `{ error }`). Fırlatılan hatalar production'da maskelenir; bu yüzden beklenen hatalar fırlatılmamalı, döndürülmelidir.
- Mutation'ın değiştirdiği şey için `revalidatePath` ya da `revalidateTag` çağır.
- Form dışından tetiklenen mutation'lar (webhook'lar, dış client'lar, mobil uygulamalar) için route handler kullan.

## Sözleşme değişiklikleri

- Opsiyonel bir alan eklemek güvenlidir. Bir alanı kaldırmak ya da yeniden adlandırmak, bir tipi değiştirmek, zorunlu bir request alanı eklemek ya da bir status code'u değiştirmek mevcut client'ları bozar.
- Değiştirmeden önce endpoint'i frontend'de ve diğer tüketicilerde ara, ne bulduğunu raporla.
- Kırıcı bir değişiklik şartsa yeni biçimi eskisinin yanında yayınla, çağıranları taşı, sonra eskisini kaldır.
