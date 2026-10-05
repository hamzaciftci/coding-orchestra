# Denetim mercekleri

Bir projeye altı bakış. Her biri, daha derine inen uzman skill'in adını verir ve o skill kurulu değilken nelere bakılacağının yedek bir özetini sunar. Bir mercek, `path:line` kanıtı ve önerilen bir önem derecesiyle bulgular döndürür; kodu değiştirmez.

## İçindekiler

- Güvenlik
- Backend
- Veri ve sözleşmeler
- Frontend
- Testler
- Deploy
- Bir subagent'a brifing verme

## Güvenlik

Skill: `security-audit`.

Dışarıdan erişilebilen her giriş noktasını haritala (route handler'lar, Server Action'lar, webhook'lar, cron route'ları, admin route'ları, upload'lar), sonra her biri için kimin çağırabildiğini, hangi girdiyi kontrol ettiklerini ve neye dokunduğunu izle. Stack'e özgü kontrol edilecekler: sorgulardaki sahiplik filtreleri, kendi auth'u olmayan Server Action'lar, middleware matcher boşlukları, ham body üzerinden webhook imza doğrulaması, secret kontrolü olmayan cron route'ları, public prefix arkasındaki secret'lar, client kodundan erişilebilen service-role key'leri, dışarıya açık her tabloda row level security, bellekte tutulan rate limit, interpolasyonlu ham SQL, open redirect'ler ve kullanıcının verdiği URL'lere sunucu tarafından yapılan fetch'ler.

## Backend

Skill: `backend-engineering`.

Her handler ve action için: handler içinde kimlik doğrulama, doğrulanmış ve allowlist'ten geçirilmiş girdi, tutarlı hata ve yanıt biçimi, hatalarda dahili ayrıntı olmaması, sınırlandırılmış liste endpoint'leri. Backend genelinde: ödemelerin, webhook'ların ve job'ların idempotency'si; ilişkili yazmaların etrafında transaction'lar; sayaç ve bakiyelerde race condition'lar; dışarıya giden çağrılarda timeout'lar; veritabanı client'ının yeniden kullanımı; başlangıçta doğrulanan environment variable'lar.

## Veri ve sözleşmeler

Skill: `database-api-design`.

Şema, ORM modelleri ve tiplerin birbiriyle uyumu. İş kurallarını zorunlu kılan constraint'ler (not null, bilinçli silme davranışına sahip foreign key'ler, unique, check). Para ve zaman tipleri. Gerçek sorgu desenleri için ve foreign key'ler üzerinde index'ler. Temiz biçimde uygulanabilen migration geçmişi ve aşamalandırma gerektirecek bekleyen değişiklikler. Açıkça belirtilmiş alanları seçen yanıtlar. Bekleyen herhangi bir işin mevcut client'ları bozup bozmayacağı.

## Frontend

Skill: `frontend-engineering`.

Ana ekranlarda loading, empty, error ve success state'leri. Formlar: validation, busy state, çift gönderim koruması, korunan girdi. Klavye erişimi, label'lar, focus, kontrast. Mobil genişlikte layout. Hardcoded renklere karşı tema token'ları. Client/server component sınırı ve bundle ağırlığı. Ürünü taşıyan ekranlarda görsel tutarlılık ve metin kalitesi. Arkasında backend olmadan mock veri gösteren ekranlar.

## Testler

Skill: `testing-qa`.

Ne var ve çalışıyor mu. Bir sahiplik kontrolü, bir webhook imza kontrolü ya da bir validation kuralı kaldırılsa bir testin kalıp kalmayacağı. Kritik kullanıcı akışının uçtan uca kapsanması. Flaky ya da atlanan testler. Testlerin gerçek kimlik bilgileri ya da paylaşılan veri olmadan çalışıp çalışamadığı.

## Deploy

Skill: `deployment-readiness`.

Build gate durumu ve varsa hata bastırma flag'leri. Kullanılan environment variable'lara karşı belgelenenler. Edge runtime'ın yanlış kullanımı, connection pooling, bellekteki state'e ya da yerel dosyalara bağımlılık. Migration komutu ve sıralaması. Cron path'leri ve korunmaları. Hata takibi ve bir health endpoint'i. Robots ve metadata. Rollback yolu.

## Bir subagent'a brifing verme

Bir merceği devrederken subagent'a şunları ver: proje path'i, ürünün amacı ve ana akışları iki üç cümleyle, sahip olduğu tek mercek ve kullanacağı skill, görevin salt okunur olduğu ve dönüş formatı (bir bulgu listesi; her birinde başlık, önerilen önem derecesi, `path:line`, neden önemli olduğu ve kodda doğrulandığı mı yoksa doğrulama mı gerektirdiği). Kontrol edip temiz bulduğu alanlar için "hiçbir şey bulunamadı" diye raporlamasını iste; böylece bulgu olmaması ile kontrol edilmemiş olması birbirinden ayırt edilebilir.
