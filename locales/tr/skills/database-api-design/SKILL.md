---
name: database-api-design
description: PostgreSQL şemalarını (Prisma, Supabase, SQL migration'ları) ve API sözleşmelerini veri kaybetmeden ve mevcut client'ları bozmadan tasarlar ve değiştirir; constraint, index, kesintisiz (zero-downtime) expand/contract migration, row level security (RLS), soft delete, response DTO, pagination ve geriye dönük uyumluluk konularını kapsar. Tablo, kolon, index ya da policy eklenirken veya değiştirilirken, bir migration yazılırken ya da incelenirken, veritabanı tasarımı ya da şema tasarımı istendiğinde veya bir API request ya da response'una alan eklenirken, alan yeniden adlandırılırken ya da kaldırılırken kullanılır.
license: MIT
compatibility: Prisma ya da Supabase migration'ları kullanan PostgreSQL için yazılmıştır. Uyumluluk kuralları her ilişkisel veritabanı ve HTTP API için geçerlidir.
metadata:
  version: "2.0.0"
  source: coding-orchestra
---

# Veritabanı ve API tasarımı

Şema ve sözleşme değişiklikleri diğer kod değişikliklerinden önemli bir noktada ayrılır: deploy ettiğinde mevcut veri ve mevcut client'lar değişmez. Bir migration eski kurallarla yazılmış satırların üzerinde çalışır, bir API yanıtını da eski biçime göre yazılmış kod okur. Her değişikliği ikisi de ayakta kalacak şekilde tasarla.

## Şemayı değiştirmeden önce

- Mevcut şemayı, migration geçmişini ve etkilenen tabloları okuyan ve yazan kodu oku. ORM modelleri, veritabanı ve TypeScript tipleri birbirini tutmuyorsa, karışıklığa yenisini eklemeden önce hangisinin doğru olduğunu bul.
- Bir komutu çalıştırmadan önce hangi veritabanına dokunacağını belirle. Kimlik bilgilerini yazdırmadan, bağlantı yapılandırmasındaki host'a bak. Paylaşılan ya da production bir veritabanı olma ihtimali varsa üzerinde hiçbir şey çalıştırma; migration'ı yaz ve komutu kullanıcıya bırak.
- Sorguların ne olduğunu sor. Index'ler, denormalizasyon ve pagination stratejisi entity diyagramından değil, erişim desenlerinden çıkar.

## Tasarım

Her zaman doğru olması gereken şeyi veritabanı zorunlu kılsın: `NOT NULL`, bilinçli seçilmiş bir `ON DELETE` ile foreign key'ler, "bunlardan yalnızca bir tane" için unique constraint'ler, aralıklar ve durumlar için check constraint'ler. Yalnızca uygulama tarafındaki kontroller, eşzamanlı isteklere ve birinin elle çalıştıracağı bir sonraki script'e yenilir.

Bu stack'te kolayca yanlış yapılan ayrıntılar (para ve BigInt serileştirme, timestamp'ler, unique constraint'lerle soft delete, yeni tablolarda RLS, Prisma'nın yeniden adlandırmaları ele alışı) [references/schema-and-contract-notes.md](references/schema-and-contract-notes.md) dosyasındadır. Tablo ya da yanıt biçimi tasarlarken oku.

## Migration

Mevcut kodun bağımlı olduğu bir şeyi kaldıran ya da yeniden yorumlayan her değişiklik aşamalı yapılır: yeni şeyi ekle, kodu ikisiyle de çalışır hale getir, veriyi taşı, sonra eski şeyi daha sonraki bir sürümde kaldır. Yeniden adlandırmalar, tip değişiklikleri, yeni `NOT NULL` kolonlar ve silinen kolonlar hep bu deseni izler. Büyük tablolarda kilit açısından güvenli index ve constraint oluşturma dahil adım adım tarifler [references/migration-playbook.md](references/migration-playbook.md) dosyasındadır. Nullable bir kolon ya da yeni bir tablo eklemekten fazlasını yapan herhangi bir migration yazmadan önce oku.

Her migration "nasıl geri döneriz" sorusunun cevabıyla birlikte gelir: bir down migration, telafi edici bir migration ya da geri alınamaz olduğunu ve hangi yedeğin bunu karşıladığını açıkça söyleyen bir not.

## Dur ve önce sor

Şunlardan önce, planı ve riski belirterek açık onay al:

- tek kullanımlık bir yerel ya da test instance'ı olmayan bir veritabanında herhangi bir migration çalıştırmak;
- veriyi silen ya da yeniden yazan herhangi bir adım (kolon ya da tablo silme, tip değişikliği, üzerine yazan backfill);
- yayınlanmış bir API alanında kırıcı bir değişiklik;
- bir veritabanını sıfırlamak ya da migration geçmişini düzenlemek.

Migration dosyasını yazıp göstermek her zaman serbesttir. Uygulamak kullanıcının kararıdır.

## API sözleşmeleri

Yayınlanmış bir response ya da request biçimini, başka kodun ona göre derlendiği bir şey olarak ele al. Ekleme niteliğindeki opsiyonel değişiklikler güvenlidir; geri kalan her şey bir geçiş (eskisinin yanında yeni alan ya da yeni bir versiyon) ve önce tüketicilerin aranmasını gerektirir. Yarın bir tabloya eklenen kolon bugün yazılmış bir endpoint'ten sızmasın diye açıkça seçilmiş alanları döndür.

## Raporlama

Şemada ve sözleşmede neyin değiştiğini, hangi mevcut satırların ve client'ların etkilendiğini, neyin hangi veritabanında çalıştırıldığını, nasıl rollback yapılacağını ve aşamalı bir migration'ın hangi adımlarının sonraki bir sürüm için hâlâ beklediğini söyle.
