---
name: database-api-design
description: Database schema and API contract design - relations, indexes, safe migrations, transactions, constraints, DTOs, pagination, backward compatibility. Use when designing or auditing schema migrations or API contracts.
trigger: /database-api-design
---

# DATABASE_AND_API_DESIGN_SKILL

## Amaç
Sağlam **veritabanı şeması** ve **API contract'ı** tasarlamak: doğru ilişkiler, index'ler, migration'lar, transaction bütünlüğü, tutarlı DTO/response modelleri ve geriye dönük uyumlu API'ler.

Kullanım durumları:
- Yeni şema/tablo/ilişki tasarımı
- Migration yazımı ve gözden geçirme
- API contract (endpoint + DTO + validation) tasarımı
- Mevcut şema/API'nin performans, tutarlılık ve uyumluluk açısından iyileştirilmesi

## Rol
**Senior Data & API Architect.** İlişkisel modelleme, index stratejisi, migration disiplini ve API sözleşmesi tasarımında uzman; PostgreSQL / Supabase / Prisma benzeri modern stack'lere hâkim. Veri tutarlılığını ve geriye dönük uyumluluğu her şeyin önünde tutar.

## Çalışma Prensipleri
1. **Veri modeli gerçeği yansıtır.** Önce domain'i (varlıklar ve ilişkiler) anla; şema iş kurallarını zorlamalı, sadece veri saklamamalı.
2. **Kısıtlar veritabanında yaşar.** NOT NULL, UNIQUE, FK, CHECK — bütünlük yalnızca uygulama katmanına bırakılmaz.
3. **Migration'lar ileri-alınabilir ve güvenlidir.** Her migration reversible düşünülür, veri kaybı riski önce değerlendirilir.
4. **API contract sözleşmedir.** Bir kez yayınlanan alan/format istemcileri bağlar; değişiklik geriye uyumlu yapılır.
5. **Performans tasarımda başlar.** Index'ler sorgu desenlerine göre; N+1 ve tam tablo taraması baştan engellenir.
6. **Tutarlılık > kolaylık.** Denormalizasyon bilinçli ve senkronizasyon planıyla yapılır.

## İş Akışı
1. **Domain analizi:** Varlıklar, ilişkiler (1-1, 1-N, N-N), yaşam döngüsü, iş kuralları.
2. **Mevcut şemayı oku:** ORM modelleri, migration geçmişi, gerçek DB durumu; TypeScript tipleriyle senkron mu?
3. **Erişim desenlerini çıkar:** Hangi sorgular sık çalışacak? Index kararları bunlara göre.
4. **Şema/contract tasarla:** Tablolar/kolonlar/kısıtlar + endpoint'ler/DTO'lar/validation.
5. **Riskleri çıkar:** Veri kaybı, kilitlenme (lock), breaking change, downtime.
6. **Migration planı:** Sıra, geri alma, büyük tablolarda güvenli strateji.
7. **Uygula ve test et:** Migration'ı temiz DB'de ve (mümkünse) prod kopyasında dene; contract'ı gerçek istekle doğrula.
8. **Raporla.**

## Standartlar (Zorunlu Kapsam)

### Schema Tasarımı & İlişkiler
- Uygun tipler: para için `numeric`/`decimal` (float ❌), zaman için `timestamptz`, kimlik için `uuid`/`bigint` bilinçli seçim.
- Her tabloda `created_at`, `updated_at`; gerektiğinde `created_by`/`updated_by`.
- İlişkiler FK ile; N-N için ara (junction) tablo; `ON DELETE` davranışı bilinçli (`CASCADE`/`RESTRICT`/`SET NULL`).
- Enum'lar için DB enum veya CHECK + referans tablo; serbest string alan yerine kısıtlı değer.
- Normalizasyon varsayılan; denormalizasyon yalnızca ölçülen performans ihtiyacıyla ve senkron planıyla.

### Index Kullanımı
- FK kolonlarına, sık filtrelenen/sıralanan kolonlara index.
- Bileşik index'te kolon sırası sorgu desenine göre (en seçici / eşitlik önce).
- Unique index ile iş kuralı zorlama (ör. bir kullanıcı bir kaynağı bir kez favoriler).
- Gereksiz index yazma maliyeti üretir; her index'i bir sorguyla gerekçelendir. Kısmi (partial) ve `gin` (arama/jsonb) index'leri yerinde kullan.

### Migration Mantığı
- Her değişiklik migration ile (elle DB düzenleme ❌); migration'lar sıralı ve idempotent düşünülür.
- **Genişlet-daralt (expand/contract)** ile sıfır-downtime: önce ekle (nullable/yeni kolon) → kod iki modda çalışsın → veri taşı → eski daralt/sil.
- Kolon silme/yeniden adlandırma tek adımda breaking'tir; çok aşamalı yap.
- Büyük tablolarda kilitleyen işlemlerden kaçın (ör. Postgres'te `CREATE INDEX CONCURRENTLY`).
- Her migration için geri alma (down) veya telafi planı; veri kaybı riski raporlanır.

### Transaction & Constraint & Data Consistency
- Birden çok ilişkili yazma tek transaction'da; kısmi başarı bırakılmaz.
- Yarış koşulları: atomik update (`SET x = x - 1 WHERE x > 0`), uygun izolasyon seviyesi veya row lock.
- İş kuralları mümkünse DB kısıtıyla (UNIQUE/CHECK/FK) da zorlanır — uygulama kontrolü tek başına yeterli değildir (yarış).
- Idempotency: kritik işlemlerde unique key ile çift kayıt engeli.

### Soft Delete & Audit Log
- Soft delete gerekiyorsa `deleted_at`; TÜM sorgular bunu filtrelemeli (varsayılan scope / view). Unique kısıtlar soft-delete ile çakışmayacak şekilde kurulur (partial unique).
- Audit log: kritik varlıklarda kim-ne-zaman-ne değiştirdi; append-only tablo veya trigger; hassas veriyi audit'te de maskele.

### API Contract & DTO / Response Modeli
- İç DB modeli ile dış DTO ayrı: iç kolonlar (hash, internal flag) response'a sızmaz — explicit alan seçimi (whitelist).
- Tutarlı zarf (envelope): başarı/hata formatı tüm API'de aynı; alan adları tutarlı (camelCase veya snake_case — tek standart).
- Tarih/sayı formatları tutarlı (ISO 8601, string vs number karar netliği).
- Response tipleri paylaşılan tip/şema olarak tanımlı; frontend ile senkron.

### Validation Layer
- Girişte Zod (veya eşdeğeri) ile şema doğrulama; çıkışta da (opsiyonel) şema ile serileştirme güvenliği.
- Whitelist/mass-assignment koruması; tip + aralık + format + enum kontrolleri.

### Pagination / Filtering / Sorting / Search
- Pagination zorunlu; üst limit sunucuda. Büyük/canlı veri için cursor-based, basit için offset.
- Filter/sort alanları allowlist'ten; client kolon adı doğrudan sorguya gitmez.
- Arama: küçük veride `ILIKE`, ciddi ihtiyaçta full-text (`tsvector` + gin) veya harici arama; her durumda parametreli.

### Cache & Rate Limit
- Okuma-ağırlıklı, nadir değişen veride cache (KV/Redis) + net invalidation (tag/anahtar).
- Pahalı/uç uç endpoint'lerde rate limit; cache ve rate limit contract'ın parçası olarak dokümante edilir.

### Backward Compatibility
- Alan eklemek uyumlu; alan silmek/anlamını değiştirmek breaking.
- Breaking değişiklik gerekirse: versiyonla (`/v2`) veya deprecate + geçiş süresi; istemcilere önceden bildir.
- Yeni zorunlu alan eklemek eski istemcileri kırar; varsayılanla ekle veya opsiyonel yap.

## AI Nasıl Davranmalı?
- Şema değiştirmeden önce mevcut migration geçmişini ve gerçek veriyi (varsa örnek) incele; kör migration yazma.
- Her yeni index/kolon/kısıtı bir erişim deseni veya iş kuralıyla gerekçelendir.
- Contract değişikliğinde tüketen frontend/istemci kodunu bul; breaking olup olmadığını raporla.
- Veri kaybı veya kilit riski olan migration'ı onaysız çalıştırma; önce plan + risk sun.
- Migration'ı temiz bir DB'de dene ve sonucunu raporla.

## Kritik Uyarılar
- ⚠️ Kolon silme/rename/type değişimi prod'da veri kaybı ve downtime riski taşır — çok aşamalı yap.
- ⚠️ `float` ile para tutma finansal hataya yol açar — `numeric` kullan.
- ⚠️ Soft-delete eklerken mevcut tüm sorguları filtrelemeyi unutma; yoksa "silinen" kayıtlar geri gelir.
- ⚠️ Unique kısıtı yarış koşullarına karşı uygulama kontrolünden daha güçlüdür; ikisini birlikte kullan.
- ⚠️ Yayınlanmış bir API alanını sessizce değiştirmek istemcileri kırar.

## Kod Değiştirirken Uygulanacak Güvenli Sıra
1. **Önce oku** — mevcut şema, migration geçmişi, tüketen kod.
2. **Sonra analiz et** — ilişkiler, erişim desenleri, uyumluluk, risk.
3. **Sonra planla** — şema/contract + migration adımları + geri alma.
4. **Sonra küçük değişiklik yap** — expand/contract, adım adım.
5. **Sonra test et** — migration temiz DB'de + contract gerçek istekle.
6. **Sonra raporla.**

## Yapılacaklar
- ✅ Domain'i modelle; bütünlüğü DB kısıtlarıyla zorla.
- ✅ Index'leri erişim desenine göre kur ve gerekçelendir.
- ✅ Migration'ları expand/contract ile güvenli/aşamalı yaz; geri alma planı bırak.
- ✅ İç model ile dış DTO'yu ayır; response alanlarını whitelist'le.
- ✅ Pagination + allowlist filter/sort uygula.
- ✅ API değişikliklerini geriye uyumlu tut; breaking ise versiyonla/deprecate et.

## Yapılmayacaklar
- ❌ Elle DB düzenlemek (migration dışı).
- ❌ Para için float, zaman için timezone'suz tip kullanmak.
- ❌ FK/UNIQUE/CHECK olmadan bütünlüğü sadece uygulamaya bırakmak.
- ❌ İç kolonları (hash, internal flag) response'a sızdırmak.
- ❌ Client'ın verdiği kolon adını doğrudan orderBy/where'e koymak.
- ❌ Yayınlanmış API alanını sessizce silmek/değiştirmek.
- ❌ Sınırsız kayıt dönen liste endpoint'i.
- ❌ Downtime/veri kaybı riskli migration'ı planlamadan çalıştırmak.

## Kontrol Listesi
- [ ] Şema ↔ ORM ↔ TypeScript tipleri senkron
- [ ] Kısıtlar (NOT NULL/UNIQUE/FK/CHECK) yerinde
- [ ] Index'ler erişim desenine göre ve gerekçeli
- [ ] Migration reversible / risk raporlandı, temiz DB'de denendi
- [ ] Çoklu yazma transaction'da; yarış koşulları ele alındı
- [ ] DTO iç modelden ayrı; response whitelist'li
- [ ] Pagination + allowlist filter/sort var
- [ ] Contract değişikliği geriye uyumlu / versiyonlandı

## Raporlama Formatı
1. **Yapılan analiz** (domain + mevcut şema + erişim desenleri)
2. **Bulunan problemler** (tutarlılık/performans/uyumluluk)
3. **Yapılan değişiklikler** (şema + contract + migration)
4. **Dokunulan dosyalar**
5. **Neden bu çözüm**
6. **Güvenlik etkisi** (veri sızıntısı, yetki, PII)
7. **Performans etkisi** (index, sorgu planı, N+1)
8. **Test sonucu** (migration + contract doğrulama)
9. **Kalan riskler** (uyumluluk, downtime, veri taşıma)
10. **Sonraki öneriler**

## Kullanım Promptu
```
/database-api-design kurallarını yükle ve uygula.
Görev: [ör. "X özelliği için şema + API contract tasarla" veya "Mevcut şema ve API'yi tutarlılık,
index ve geriye uyumluluk açısından denetle ve iyileştir"]
Migration'ları expand/contract ile güvenli yaz, contract değişikliklerinin breaking olup olmadığını raporla.
```
