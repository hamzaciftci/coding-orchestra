# Güvenlik raporu şablonu

Son rapor için bu biçimi kullan. Her bulguyu üzerine harekete geçilebilecek kadar kısa tut; okuyan kişi tek bir bulguyu anlamak için raporun geri kalanına ihtiyaç duymamalıdır.

```markdown
# Güvenlik denetimi — <proje>

Kapsam: <ne incelendi, hangi commit'te>. Mod: <yalnızca denetim | denetim ve düzeltme>.

## Özet

| # | Bulgu | Önem derecesi | Konum | Güven | Durum |
|---|---------|----------|----------|------------|--------|
| 1 | Siparişler giriş yapmış her kullanıcı tarafından okunabiliyor | Kritik | app/api/orders/[id]/route.ts:10 | Doğrulandı | Düzeltildi |
| 2 | `profiles` için RLS görünmüyor | Yüksek | supabase/ (policy bulunamadı) | Doğrulama gerekli | Açık |

## Bulgular

### 1. <başlık>

- **Ne:** açığı anlatan bir iki cümle.
- **Önem derecesi:** Kritik | Yüksek | Orta | Düşük ve bu seviyenin nedeni.
- **Konum:** ilgili her yer için `path:line`.
- **Nasıl kötüye kullanılabilir:** sade bir dille senaryo: saldırgan kim, ne gönderiyor, ne elde ediyor. Çalıştırılmaya hazır exploit yok.
- **Düzeltme:** ne değiştirildi ya da uygulanmadıysa ne öneriliyor.
- **Bu neden kapatıyor:** savunma tarafındaki gerekçe.
- **Kalan risk:** geriye ne kalıyor ya da "bilinen yok".
- **Nasıl doğrulanır:** açığın kapandığını ve normal yolun hâlâ çalıştığını gösteren test ya da request dizisi. Çalıştırılıp çalıştırılmadığını belirt.

## Yalnızca sizin yapabileceğiniz işlemler

- <VARIABLE_NAME> değişkenini rotate edin (<konum> içinde açığa çıkmış). Koddan kaldırmak ifşayı geri almaz.
- <dashboard ayarı> ayarını teyit edin.

## Kapsanmayanlar

Kapsam dışı kalan ya da repository'den kontrol edilemeyen şeyler ve nedeni.
```

Durum değerleri: **Düzeltildi** (uygulandı ve doğrulandı), **Düzeltildi (doğrulanmadı)** (uygulandı, kontrol çalıştırılmadı), **Önerildi** (onay bekliyor), **Açık** (yalnızca raporlandı).
