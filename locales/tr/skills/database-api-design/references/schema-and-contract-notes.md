# Şema ve sözleşme notları

PostgreSQL, Prisma ve Supabase projelerinde gerçek olaylara yol açan tasarım ayrıntıları.

## İçindekiler

- Tipler
- Constraint'ler ve ilişkiler
- Index'ler
- Soft delete
- Audit trail
- Row level security
- Yanıt biçimleri
- Pagination, filtreleme, arama
- Uyumluluk kuralları

## Tipler

- **Para:** `numeric` / Prisma `Decimal` ya da en küçük birim cinsinden tam sayı. Asla `float` değil. Prisma, JSON'da string'e serialize olan `Decimal` nesneleri döndürür; API'nin string mi yoksa tam sayı kuruş mu göndereceğine karar ver ve tutarlı kal.
- **BigInt:** `JSON.stringify`, `bigint` gördüğünde hata fırlatır. `BigInt` bir id ya da sayaç, yanıt katmanında açık bir dönüşüm gerektirir.
- **Zaman:** `timestamptz` (Prisma: `@db.Timestamptz`). Prisma'nın varsayılan `DateTime` tipi zone'suz `timestamp`'e karşılık gelir; bir client ya da oturum başka bir zone kullandığında sessizce kayar. UTC olarak ISO 8601 gönder.
- **ID'ler:** proje başına tek bir şema seç. Sıralı tam sayılar dışarıya açıldığında hacmi sızdırır ve enumeration'a davet çıkarır; UUIDv4 çok büyük ölçekte index'leri parçalar; UUIDv7 ya da cuid2 yaygın orta yollardır.
- **Sıralı durumlar (enum):** bir PostgreSQL enum'u ya da check constraint'li text. Native bir enum'a değer eklemek kolaydır; kaldırmak ya da yeniden adlandırmak değildir. Bu yüzden küme hâlâ değişiyorsa text artı check'i tercih et.
- **JSON kolonları:** içine bakılmayan payload'lar için uygundur. Filtrelediğin ya da join yaptığın her şey gerçek bir kolon olmalıdır.

## Constraint'ler ve ilişkiler

- Her foreign key için `ON DELETE` davranışına karar ver. Bir kullanıcı satırındaki `CASCADE` finansal kayıtları silebilir; hukuki ya da muhasebesel anlamı olan her şey için genellikle `RESTRICT` ya da soft delete doğrudur.
- İlişkinin kendi alanlara (rol, created_at) ihtiyacı olduğu anda many-to-many, açık bir join tablosu üzerinden kurulur.
- Unique constraint, eşzamanlılık altında tekrarlara karşı tek güvenilir korumadır: kullanıcı ve takım başına tek üyelik, webhook event id'si başına tek işlenmiş satır, hesap başına tek aktif abonelik.
- Her tabloda `created_at` ve `updated_at`. Prisma'nın `@updatedAt` özelliğini client uygular; dolayısıyla Prisma'yı atlayan yazmalar, bir trigger yapmadıkça bu alanı güncellemez.

## Index'ler

- Foreign key kolonlarını ve en sık kullandığın filtre ve sıralamaların kolonlarını index'le. PostgreSQL bir foreign key'in referans veren tarafını otomatik index'lemez.
- Composite index sırası: önce eşitlik kolonları, sonra aralık ya da sıralama kolonu. `(user_id, created_at)` üzerindeki bir index "bu kullanıcının satırları, tarihe göre" sorgusuna hizmet eder; `(created_at, user_id)` etmez.
- Sık erişilen alt kümeler için partial index'ler (`WHERE deleted_at IS NULL`, `WHERE status = 'pending'`).
- Her index yazmaları yavaşlatır. Her birini bir sorguyla gerekçelendir ve önemli olduğunda planı `EXPLAIN` ile kontrol et.

## Soft delete

- Bir `deleted_at` kolonu, mevcut her sorgunun artık ona göre filtrelemesi gerektiği anlamına gelir. Eklemeden önce tablonun tüm okumalarını ara; birini kaçırmak silinmiş satırları geri getirir.
- Unique constraint'ler partial hale gelmelidir (`WHERE deleted_at IS NULL`); yoksa silinmiş bir satır aynı key ile yeniden oluşturmayı engeller. Prisma şeması partial index ifade edemez; o kısmı migration içinde SQL ile yaz.
- Alt satırlara ve gerçekten silinmesi gereken veriye (gizlilik talepleri) ne olacağına karar ver.

## Audit trail

Para, yetkiler ve veriyi yok eden admin işlemleri için aktörü, işlemi, hedefi ve zamanı kaydeden, yalnızca ekleme yapılan (append-only) bir tablo. İçinde secret ya da tam kişisel veri saklama.

## Row level security

- RLS'i, tabloyu oluşturan migration'ın içinde etkinleştir ve policy'leri de orada yaz.
- Policy'ler hem `USING` (hangi satırlar görünür ya da hedeflenebilir) hem de insert ve update'ler için `WITH CHECK` (satır sonrasında nasıl görünebilir) ister. `WITH CHECK` içermeyen bir update policy'si, kullanıcının bir satırı başkasına atamasına izin verir.
- Policy'leri `auth.uid()` üzerine ve tablolara ya da `app_metadata`'ya dayandır. `user_metadata` kullanıcı tarafından yazılabilir.
- Policy'lerin filtrelediği kolonları index'le; bir policy, her sorguya eklenen bir koşuldur.

## Yanıt biçimleri

- Veritabanı satırlarını açıkça tanımlanmış yanıt nesnelerine map et. Prisma'da `select` kullan; SQL'de kolonları tek tek yaz. Satırları doğrudan döndürmek parola hash'lerini, dahili flag'leri ve sonradan eklenen her şeyi sızdırır.
- API genelinde tek bir isimlendirme konvansiyonu (camelCase ya da snake_case), tek tarih formatı, tek envelope, tek hata biçimi. Var olanı izle.
- Projenin izin verdiği yerlerde request ve response şemalarını sunucu ile client arasında paylaş; böylece sapma bir tip hatasına dönüşür.

## Pagination, filtreleme, arama

- Her listede sunucunun zorunlu kıldığı bir maksimum sayfa boyutu.
- Büyük ya da canlı veri için cursor pagination (`(created_at, id)` gibi unique ve sıralı bir key üzerinde); küçük ve durağan tablolar için offset.
- Sıralanabilir ve filtrelenebilir alanlar için allowlist.
- Arama: küçük tablolar için `ILIKE`, ötesinde GIN index'li `tsvector` ya da `pg_trgm`. Her zaman parametreli.

## Uyumluluk kuralları

| Değişiklik | Mevcut client'lar |
|---|---|
| Opsiyonel bir response alanı eklemek | Güvenli |
| Default'u olan opsiyonel bir request alanı eklemek | Güvenli |
| Zorunlu bir request alanı eklemek | Bozar |
| Bir alanı kaldırmak ya da yeniden adlandırmak | Bozar |
| Bir alanın tipini, formatını ya da anlamını değiştirmek | Bozar |
| Bir response'a yeni bir enum değeri eklemek | Tüm değerleri tek tek ele alan client'ları bozar; önceden duyur |
| Bir status code'u ya da hata kodunu değiştirmek | Hata yönetimini bozar |
| Validation'ı sıkılaştırmak | Daha önce kabul edilen girdiyi gönderen çağıranları bozar |

Kırıcı bir değişiklik için: yeni biçimi eskisinin yanına ekle, tüketicileri taşı, sonra eskisini kaldır; ya da endpoint'i versiyonla. Mobil uygulamalar ve üçüncü taraflar yavaş güncellenir; bu yüzden "frontend aynı repo'da" gerekçesi ancak tek tüketici o olduğunda yeterlidir.
