# Migration el kitabı (PostgreSQL)

Tek adımda yapıldığında güvenli olmayan değişiklikler için tarifler. "Sürüm", uygulama kodunun bir deploy'u demektir; farklı sürümlerdeki adımlar tek bir sürümde birleştirilmemelidir.

## İçindekiler

- Neden aşamalar
- Kolon ya da tabloyu yeniden adlandırma
- Zorunlu kolon ekleme
- Kolon tipini değiştirme
- Kolon ya da tablo silme
- Büyük tablolarda index ve constraint'ler
- Backfill'ler
- Prisma'ya özgü noktalar
- Supabase'e özgü noktalar

## Neden aşamalar

Bir deploy sırasında eski ve yeni kod aynı anda tek bir şemaya karşı çalışır; bir rollback ise eski kodu yeni şemanın karşısına geri koyar. Bir migration, geride bıraktığı şema kodun hem önceki hem de sonraki sürümüyle çalışıyorsa güvenlidir.

## Kolon ya da tabloyu yeniden adlandırma

1. Sürüm A: yeni kolonu ekle (nullable). İki kolona da yaz. Eskisinden okumaya devam et.
2. Yeni kolonu eskisinden batch'ler halinde backfill et.
3. Sürüm B: yeni kolondan oku. İkisine de yazmaya devam et.
4. Sürüm C: eski kolona yazmayı bırak.
5. Daha sonra: eski kolonu sil.

Tablo için, geçiş süresince eski adı taşıyan bir view onun yerini tutabilir.

## Zorunlu kolon ekleme

1. Kolonu nullable olarak ya da bir default ile ekle. Güncel PostgreSQL sürümlerinde sabit bir default ile kolon eklemek tabloyu yeniden yazmaz; volatile bir default yazar.
2. Kolonu her zaman yazan kodu deploy et.
3. Mevcut satırları batch'ler halinde backfill et.
4. `NOT NULL` constraint'ini ekle. Büyük bir tabloda önce `CHECK (col IS NOT NULL) NOT VALID` ekle, validate et, sonra `NOT NULL` yap; bu, PostgreSQL'in exclusive lock altında tam tablo taramasını atlamasını sağlar.

## Kolon tipini değiştirme

Yeniden adlandırma gibi ele al: yeni tipte yeni kolon, çift yazma, dönüştürerek backfill, okumaları çevirme, eski kolonu silme. Yerinde yapılan bir `ALTER COLUMN ... TYPE`, çoğu dönüşümde tabloyu exclusive lock altında yeniden yazar ve dönüştürülemeyen değerlerde yarı yolda başarısız olur.

## Kolon ya da tablo silme

1. Koddaki tüm okuma ve yazmaları kaldır ve bunu deploy et.
2. Başka hiçbir şeyin onu kullanmadığını doğrula (raporlar, diğer servisler, veritabanı view'ları, policy'ler).
3. Daha sonraki bir sürümde sil. Varsayılan olarak tüm kolonları seçen bir ORM'de önceki build, kolon gittiği anda hata verir; bu yüzden silme işlemi kod değişikliğiyle aynı sürümde olamaz.

## Büyük tablolarda index ve constraint'ler

- `CREATE INDEX CONCURRENTLY` yazmaları bloklamaz. Bir transaction içinde çalışamaz, bu yüzden o dosya için transaction'ların kapatıldığı ayrı bir migration gerekir. Başarısız olursa geride, yeniden denemeden önce silinmesi gereken geçersiz bir index bırakır.
- Unique constraint: unique index'i concurrently oluştur, sonra `ALTER TABLE ... ADD CONSTRAINT ... UNIQUE USING INDEX`. Önce mevcut tekrarları kontrol et.
- Foreign key: `ADD CONSTRAINT ... NOT VALID`, ardından ayrı olarak `VALIDATE CONSTRAINT`. Referans veren kolonu index'le; PostgreSQL bunu senin yerine yapmaz.
- Yoğun tablolardaki DDL için bir `lock_timeout` ayarla; böylece bloklanan bir migration, tüm sorguları arkasında kuyruğa sokmak yerine hızlıca başarısız olur.

## Backfill'ler

- Primary key aralığına göre batch'le, her batch'te commit et ve script'i yeniden çalıştırılmaya karşı güvenli yap.
- Büyük bir tabloda backfill'i şema migration'ının transaction'ı içinde yapma.
- Mevcut değerlerin üzerine yazan bir backfill veri yeniden yazımıdır; onay ve yedek gerektirir.

## Prisma'ya özgü noktalar

- `schema.prisma` içinde bir alanı yeniden adlandırmak `DROP COLUMN` artı `ADD COLUMN` üretir ve veriyi kaybettirir. Yalnızca client tarafındaki alanı yeniden adlandırmak için `@map` kullan; gerçek kolonu yeniden adlandırmak için aşamalı tarifi uygula ya da SQL'i elle düzenle.
- `prisma migrate dev --create-only` migration'ı uygulamadan yazar; böylece SQL incelenip düzenlenebilir (örneğin `CONCURRENTLY` eklemek için).
- Geçmiş kaydığında `prisma migrate dev` veritabanını sıfırlamayı önerebilir. Bu tüm veriyi siler. Tek kullanımlık bir veritabanı dışında hiçbir şeyde asla kabul etme.
- `prisma db push` şemayı migration dosyası olmadan değiştirir. Yalnızca prototiplerde kullan; migration'lar bir kez var olduktan sonra onlarla devam et.
- Production, migration'ları `prisma migrate deploy` ile uygular. Herhangi bir yerde uygulanmış bir migration'ı düzenleme; yenisini ekle.
- Mevcut satırları olan bir modele default'u olmayan zorunlu bir alan eklemek deploy sırasında başarısız olur. Zorunlu kolon tarifini izle.

## Supabase'e özgü noktalar

- Şema değişikliklerini yalnızca dashboard'da değil, migration dosyalarında tut (`supabase migration new`, `supabase db diff`); böylece ortamlar yeniden üretilebilir.
- Dışarıya açık bir şemadaki her yeni tablo, aynı migration içinde `ENABLE ROW LEVEL SECURITY` ve policy'lerine ihtiyaç duyar. RLS'siz bir tablo, anon key'e sahip herkese açıktır.
- Bir policy'yi değiştirmek, kimin okuyup yazabileceğini tüm client'lar için anında değiştirir. Bunu bir auth değişikliği olarak ele al ve onay al.
- Bir projede hem Prisma hem Supabase migration'ları varsa, herhangi birine ekleme yapmadan önce şemanın sahibinin hangisi olduğunu bul.
