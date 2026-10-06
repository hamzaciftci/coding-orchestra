---
name: backend-engineering
description: Next.js ve Node serverless uygulamalarında sunucu tarafı kodu production'da ayakta kalacak şekilde yazar ve değiştirir; route handler, Server Actions, kimlik doğrulama ve kayıt bazında yetkilendirme, girdi doğrulama (validation), webhook, cron ve arka plan işleri, ödeme ve idempotency, rate limit ve cache konularını kapsar. Bir API endpoint'i, Server Action, webhook, cron job ya da auth veya ödeme akışı eklenirken ya da değiştirilirken, "backend yaz", "API yaz", "endpoint ekle" gibi isteklerde veya backend kodunun canlıya hazır olup olmadığı incelenmek istendiğinde kullanılır.
license: MIT
compatibility: Next.js (App Router) ve serverless ortamlarda çalışan Node ile, Prisma veya Supabase üzerinden PostgreSQL için yazılmıştır. Sorular her backend için geçerlidir.
metadata:
  version: "2.0.0"
  source: coding-orchestra
---

# Backend mühendisliği

Bir şey yazmadan önce, değiştireceğin endpoint'e yakın bir iki mevcut endpoint'i oku ve bu projenin kimlik doğrulama, validation, hata yanıtları ve veri erişimini nasıl yaptığını bul. Projenin konvansiyonları burada önerilen varsayılanlardan önce gelir; tek bir API'de iki stili karıştırmak ikisinden de kötüdür. Aşağıdaki varsayılanları yalnızca projenin henüz bir konvansiyonu olmadığı yerlerde kullan.

## Sunucu kodu için "bitti" ne demek

Bir handler ya da action, aşağıdakilerin her birine bilinçli bir cevap verildiğinde bitmiştir. Bazı cevaplar "burada gerekmiyor" olur; bu bir kararsa sorun değildir.

1. **Bunu kim çağırabilir?** Kimlik doğrulama, handler'ın ya da action'ın kendi içinde kontrol edilir. Middleware ve UI tarafındaki gizleme sayılmaz: route handler'lar ve Server Action'lar herkese açık URL'lerdir.
2. **Bu çağıran bu kayda dokunabilir mi?** Sahiplik ya da tenant bilgisi, okumada da yazmada da sorgunun `where` koşuluna girer. Rol, kullanıcının sunucudaki halinden alınır.
3. **Hangi biçimde girdi kabul ediliyor?** Girdi bir şemaya göre parse edilir ve yalnızca listelenen alanlar ileriye aktarılır. Ham body asla ORM'e ulaşmaz.
4. **İki kez çalışırsa ne olur?** Çift tıklama, client retry'ları, sağlayıcının yeniden gönderimi ve eşzamanlı istekler gerçekten yaşanır. Tekrarın paraya mal olacağı ya da state'i bozacağı yerlerde unique constraint, idempotency key, atomik update ya da transaction kullan.
5. **Hata neye benziyor?** Doğru status code, kararlı ve makinenin okuyabileceği bir hata kodu; yanıtta stack trace, SQL ya da dahili path yok.
6. **Çağırmanın maliyeti ne?** E-posta gönderen, ücretli bir API çağıran, ağır bir sorgu çalıştıran ya da kimlik bilgisi tahminine imkân veren her şey, birden fazla instance'ta da geçerli kalan bir limite ihtiyaç duyar.
7. **Yanıtı kim tüketiyor?** Bir alan adını, tipi, status code'u ya da hata biçimini değiştirmeden önce çağıranları bul. Değişiklik onları bozuyorsa iki tarafı birlikte güncelle ya da eski biçimi çalışır durumda tut.

## Bu stack uzun ömürlü bir sunucudan nerede ayrılır

Serverless ve App Router, Express tarzı sunucularla eğitilmiş bir modelin varsayılan olarak yanlış yaptığı birkaç şeyi değiştirir: bellekteki state kalıcı değildir, bağlantılar pool'lanmalıdır, edge runtime'da Node API'leri yoktur, webhook imzaları ham body ister, cron route'ları herkese açıktır ve cache varsayılanları Next.js sürümüne göre değişir.

- Handler ve action yazarken ya da incelerken [references/request-handling.md](references/request-handling.md) dosyasını oku: auth, yetkilendirme, validation, hatalar, yanıt biçimi, pagination.
- İş webhook, cron, kuyruk, ödeme, transaction, rate limit, cache ya da runtime yapılandırması içeriyorsa [references/async-and-runtime.md](references/async-and-runtime.md) dosyasını oku.

## Dur ve önce sor

Şunlardan önce bir plan sun ve onay bekle: bir migration ya da veriyi yok eden herhangi bir işlem çalıştırmak, login ya da oturumların çalışma biçimini değiştirmek, yayınlanmış bir API sözleşmesini bozmak ya da yeni bir altyapı bağımlılığı (kuyruk, cache, auth sağlayıcısı) eklemek. Bunların geri alınması zordur ya da bu değişikliğin dışındaki insanları etkiler.

## Doğrulama

Yeni ya da değişen her endpoint'i başarı durumu, geçersiz girdi, oturumsuz istek ve başka bir kullanıcıya ait oturum için dene. Projenin typecheck, lint ve testlerini çalıştır. Neyin çalıştırıldığını ve neyin çalıştırılmadığını raporla; bir raporda "test edilmedi" satırı kabul edilebilir, çalıştırılmamış bir testi geçmiş gibi anlatmak edilemez.
