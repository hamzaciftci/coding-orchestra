# Çalışma şablonları

Projeye uyan kısımları kullan. Boş bir tablo hiçbir şey katmaz; içeriği olmayan bölümleri çıkar ve bunu tek satırla belirt.

## İçindekiler

- Öncelik ölçeği
- Denetim raporu ve yol haritası
- Dilim güncellemesi
- Son rapor

## Öncelik ölçeği

| Seviye | Anlamı |
|---|---|
| Engelleyici | Ürün yayınlanamaz: temel bir akış bozuk, build başarısız ya da veri veya para herkese açık. |
| Kritik | Yayından kısa süre sonra bir olaya yol açar: normal bir hesapla istismar edilebilir, olağan kullanımda veri kaybı, kurtarma yolu olmayan bir hata. |
| Önemli | Gerçek kullanıcılar karşılaşır; bir geçici çözümü vardır ya da hasarı sınırlıdır. |
| Küçük | Pürüzler ve küçük borçlar. |
| Cila | Ürünü daha bitmiş hissettirir. |

## Denetim raporu ve yol haritası

```markdown
# Canlıya hazırlık denetimi — <proje> @ <commit>

## Özet
<Ürünün ne yaptığı, stack ve genel durum, üç dört cümleyle.>

Başlangıç kontrolleri: install <ok/fail>, typecheck <…>, lint <…>, testler <n geçti / n kaldı / yok>, build <…>.

## Özellik envanteri
| Özellik | Durum | Uçtan uca çalışıyor | Notlar |
|---|---|---|---|
| Kayıt ve giriş | Tam / Kısmi / Eksik | Doğrulandı / Doğrulanmadı / Bozuk | |

## Frontend–backend sözleşmesi
| Client çağrısı | Endpoint | Eşleşme | Sorun |
|---|---|---|---|
| `lib/api.ts:42` createOrder | POST /api/orders | Uyuşmuyor | client `qty` gönderiyor, sunucu `quantity` bekliyor |

## Bulgular
| # | Öncelik | Alan | Bulgu | Kanıt | Güven |
|---|---|---|---|---|---|
| 1 | Engelleyici | Güvenlik | Siparişler giriş yapmış her kullanıcı tarafından okunabiliyor | app/api/orders/[id]/route.ts:10 | Doğrulandı |

<Engelleyici ve Kritik maddeler için ayrıntı: ne, etki, önerilen düzeltme, büyüklük.>

## Yol haritası
1. <madde> — <neden ilk> — <S/M/L>
2. …

## Sizden beklenen kararlar
<Kapsam soruları, onaya bağlı değişiklikler için onaylar, yalnızca sizin yapabileceğiniz şeyler (key rotate etmek, dashboard ayarlarını teyit etmek).>

## Kapsanmayanlar
<Repository'den kontrol edilemeyenler.>
```

## Dilim güncellemesi

```markdown
### Dilim: <ad> (yol haritası #<n>)
- **Değişen:** <ne, hangi dosyalarda>
- **Doğrulanan:** <çalıştırılan komutlar ve sonuçları; elle kontrol edilenler>
- **Doğrulanmayan:** <ve nedeni>
- **Yan etkiler ya da takip işleri:** <sözleşme değişiklikleri, yeni env değişkenleri, onay bekleyen migration'lar>
- **Sırada:** <sonraki dilim>
```

## Son rapor

```markdown
# Canlıya hazırlık — <proje> @ <commit>

**Karar:** Hazır | Koşullu hazır | Hazır değil
<Gerekçe, iki üç cümleyle.>

## Alan bazında durum
| Alan | Durum | Notlar |
|---|---|---|
| Güvenlik | İyi / Koşullu / Engelli | |
| Backend | | |
| Veri | | |
| Frontend | | |
| Testler | | |
| Deploy | | |

## Yapılanlar
<Dilim bazında, kısaca.>

## Kapatılan güvenlik bulguları
| Bulgu | Önem derecesi | Düzeltme | Doğrulandı |
|---|---|---|---|

## Hâlâ açık olanlar
<Kabul edilen riskler ve kalan yol haritası maddeleri, öncelikleriyle.>

## Sizin yapmanız gerekenler
<Rotate işlemleri, dashboard kontrolleri, onaylar.>

## Release checklist ve smoke sonucu
<deployment-readiness skill'inden.>

## Rollback
<Nasıl yapılır ve neyi geri almaz.>
```
