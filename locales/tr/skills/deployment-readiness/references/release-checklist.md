# Release checklist ve rapor

Her maddeye bir durum ve kanıtını ver. Durumlar: **Geçti** (kontrol edildi, kanıtıyla), **Kaldı** (yayını engeller ya da engellemelidir), **Teyit et** (repository'den görülemez; kullanıcı kontrol etmelidir, nereye bakacağını söyle), **N/A**.

## Checklist

| Alan | Madde | Durum | Kanıt |
|---|---|---|---|
| Build | Install, typecheck, lint, testler ve build, hata bastırma flag'leri olmadan geçiyor | | komut çıktısı |
| Build | Node sürümü sabitlenmiş, lockfile commit edilmiş, Prisma client build sırasında generate ediliyor | | |
| Yapılandırma | Kodun okuduğu her değişken örnek dosyada belgelenmiş | | env-inventory çıktısı |
| Yapılandırma | Public prefix arkasında secret yok, git tarafından takip edilen env dosyası yok | | env-inventory çıktısı |
| Yapılandırma | Değişkenler başlangıçta doğrulanıyor | | dosya |
| Yapılandırma | Production değişkenleri platformda doğru ortamlar için tanımlı | Teyit et | platform dashboard'u |
| Runtime | Edge route'larında ya da middleware'de yalnızca Node'a özgü API yok | | |
| Runtime | Uzun işler kuyruğa alınıyor ya da bilinçli bir maksimum süreye sahip; bellekteki state'e ya da yerel dosyalara bağımlılık yok | | |
| Veri | Uygulama pool'lanmış bir bağlantı kullanıyor; client instance başına bir kez oluşturuluyor | | |
| Veri | Migration'lar production komutuyla uygulanıyor; deploy'a göre sıralaması güvenli | | |
| Veri | Veri yok eden migration'lardan önce yedek ya da point-in-time recovery mevcut | Teyit et | sağlayıcı dashboard'u |
| Job'lar | Cron path'leri route'larla eşleşiyor; cron ve webhook endpoint'leri secret'larını ya da imzalarını doğruluyor | | attack-surface çıktısı ya da kod |
| Job'lar | Production webhook endpoint'leri ve secret'ları sağlayıcılarda kayıtlı | Teyit et | sağlayıcı dashboard'u |
| Güvenlik | Açık Kritik ya da Yüksek bulgu yok (`security-audit` skill'ine bak) | | |
| Güvenlik | Güvenlik header'ları ve cookie flag'leri ayarlı | | smoke çıktısı ya da config |
| Gözlemlenebilirlik | Hata takibi sunucu ve client için bağlı; health endpoint'i var | | |
| Gözlemlenebilirlik | Event'ler tracker'a gerçekten ulaşıyor | Teyit et | tracker dashboard'u |
| İçerik | Metadata, robots ve sitemap production için doğru; staging index'lenemiyor | | |
| Cache | Paylaşılan cache'lerde kullanıcıya özel veri yok; mutation'lar değiştirdiklerini invalidate ediyor | | |
| Doğrulama | Smoke kontrolü ve kritik kullanıcı akışı deploy edilmiş URL'de geçiyor | | smoke çıktısı |
| Rollback | Rollback işlemi biliniyor; önceki build'i bozan migration'lar belirlenmiş | | |

## Rapor

```markdown
# Yayın hazırlığı — <proje> @ <commit>

**Karar:** Hazır | Koşullu hazır | Hazır değil

<İki üç cümle: kararı ne belirliyor.>

## Engelleyenler
- <madde> — <kanıt> — <düzeltme ya da sorumlu>

## Bu turda düzeltilenler
- <ne değişti ve nasıl doğrulandı>

## Sizin teyit etmeniz gerekenler
- <ne, nereye bakılacak>

## Checklist
<yukarıdaki tablo, doldurulmuş halde>

## Rollback
<kod nasıl geri alınır; hangi migration'lar geriye dönük uyumlu değil; rollback neyi geri almaz>

## Yayından sonra
<ilk saatlerde ne izlenmeli: hata oranı, fonksiyon süresi, bağlantı sayısı, cron çalışmaları>
```
