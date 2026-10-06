---
name: deployment-readiness
description: Bir web projesinin yayına hazır olup olmadığını kontrol eder ve eksikleri kapatır; build gate, environment variable'lar, Vercel, serverless ve edge runtime uyumu, veritabanı bağlantıları ve migration'lar, cron ve webhook'lar, monitoring, release checklist ve deploy sonrası smoke test konularını kapsar. Kullanıcı deploy etmek, canlıya almak, yayına çıkmak ya da bir sürüm hazırlamak istediğinde, projenin yayına hazır ya da canlıya hazır olup olmadığını sorduğunda, bir production build'i ya da deploy başarısız olduğunda veya tamamlanmış bir deploy'un doğrulanması istendiğinde kullanılır.
license: MIT
compatibility: Yardımcı script'ler Node.js 18+ gerektirir. Platform notları Vercel üzerinde PostgreSQL (Supabase, Prisma) kullanan Next.js için yazılmıştır; yöntem diğer serverless ortamlar için de geçerlidir.
metadata:
  version: "2.0.0"
  source: coding-orchestra
---

# Deploy hazırlığı

Teslim edilen şey, kullanıcının güvenebileceği bir go / no-go kararı, bu kararın arkasındaki kanıt ve yayını engelleyen her şey için düzeltmelerdir. "Benim makinemde build alıyor" ile "production'da çalışıyor" arasında bilinen bir farklar kümesi vardır; bu skill'in büyük kısmı o farklarla ilgilidir.

## Sınırlar

- Yayını hazırla; kullanıcı bu konuşmada açıkça istemedikçe gerçekleştirme. Deploy etmek, production veritabanında migration çalıştırmak ve platformdaki environment variable'ları değiştirmek canlı kullanıcıları etkiler; bu yüzden komutları birebir ve bir rollback yoluyla birlikte sun, kararı kullanıcıya bırak.
- Secret değerlerini asla yazdırma, loglama ya da kopyalama. Bir rapora değişken adları ve "tanımlı / eksik" bilgisi yeter. Gerçek env dosyalarını açma; aşağıdaki envanter script'i kaynak kod ve örnek dosya üzerinden çalışır.
- Hataları gizleyerek yeşil bir build elde etme: `ignoreBuildErrors` yok, `ignoreDuringBuilds` yok, toptan `@ts-ignore` yok, atlanan test yok. Bunlardan biri projede zaten varsa, bu bir bulgudur.

## Yaklaşım

1. **Projenin kendi gate'lerini çalıştır.** Projenin tanımladığı sırayla (genellikle install, typecheck, lint, test, build) çalıştır ve gerçek çıktıyı kaydet. Hataların kök nedenlerini düzelt.
2. **Yapılandırmanın envanterini çıkar.** Bu skill'in dizininden:

   ```
   node scripts/env-inventory.mjs <project-dir>
   ```

   Script, kodun okuduğu ama örnek dosyanın belgelemediği değişkenleri, secret'a benzeyen public prefix'li adları, git tarafından takip edilen env dosyalarını ve başlangıçta validation olup olmadığını raporlar.
3. **Production uyumunu kontrol et.** [references/production-pitfalls.md](references/production-pitfalls.md) dosyasını oku ve her hata modunu kodda ara. Bunlar yerel geliştirmede geçip platformda bozulan şeylerdir: runtime uyumsuzlukları, bağlantıların tükenmesi, bellekteki state, cron path'leri, cache varsayılanları, migration komutları.
4. [references/release-checklist.md](references/release-checklist.md) dosyasını **baştan sona işle**. Her madde bir durum ve o durumun kanıtını alır.
5. **Bir deploy var olduktan sonra** (preview ya da production) onu doğrula:

   ```
   node scripts/smoke.mjs https://<deployment-url> / /login /api/health
   ```

   Yalnızca GET istekleri atar. Status'ü, süreyi ve hangi güvenlik header'larının mevcut olduğunu raporlar. Ardından kritik kullanıcı akışını elle ya da projenin end-to-end testleriyle dene.

## Kararı verme

**Hazır**, **Koşullu hazır** ya da **Hazır değil** seçeneklerinden birini, ardından gerekçeleri belirt.

Canlıya hazır olmanın büyük kısmı bir repository'den görülemez: değişkenlerin platformda tanımlı olup olmadığı, cron'un gerçekten tetiklenip tetiklenmediği, hata takibinin event alıp almadığı, veritabanının yedeklerinin olup olmadığı. Bunları, nereye bakılacağıyla birlikte, kullanıcının teyit edeceği maddeler olarak listele. Varsayıma dayanarak işaretleme ve smoke test gerçek deploy'a karşı çalıştırılmadıysa bir sürüme doğrulandı deme.

Rollback yolunu her zaman ekle. Çoğu platformda kodu geri almak anlıktır, veritabanını geri almak değildir; bu yüzden bu sürümdeki hangi migration'ların önceki kodla geriye dönük uyumlu olmadığını söyle.
