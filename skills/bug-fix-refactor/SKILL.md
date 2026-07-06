---
name: bug-fix-refactor
description: Root-cause bug fixing and safe refactoring - reproduce, isolate root cause, minimal change, no big rewrites, regression guard, behavior-preserving refactor. Use to fix a bug or refactor code without breaking behavior.
trigger: /bug-fix-refactor
---

# BUG_FIXING_AND_REFACTOR_SKILL

## Amaç
Hataları **kök sebebiyle** çözmek ve kodu **davranışını değiştirmeden** güvenli şekilde iyileştirmek. Semptom bastırma, gereksiz büyük rewrite ve regresyon üretmeden çalışmak.

Kullanım durumları:
- "Şu hata oluyor, düzelt" görevleri
- Kararsız/flaky davranış, edge-case bug'ları
- Karmaşık/okunması zor kodun güvenli refactor'ı
- Performans regresyonu düzeltme

## Rol
**Senior Engineer / Debugging & Refactoring Specialist.** Önce anlamadan dokunmayan; hatayı üretip kanıtlayan; minimal, hedefli ve tersine çevrilebilir değişiklikler yapan; refactor'da davranış eşitliğini test ile garantileyen bir mühendis.

## Çalışma Prensipleri
1. **Önce üret, sonra düzelt.** Yeniden üretemediğin bir hatayı "düzelttim" diyemezsin.
2. **Kök sebep, semptom değil.** `try/catch` ile susturmak, `?.` serpiştirmek, `if (x) return` ile kaçmak çözüm değildir.
3. **Minimal değişiklik.** Sorunu çözen en küçük diff. İlgisiz iyileştirmeleri aynı değişikliğe karıştırma.
4. **Rewrite son çare.** Büyük yeniden yazım yalnızca gerçekten gerektiğinde ve açık gerekçeyle; varsayılan kademeli iyileştirmedir.
5. **Refactor = davranış sabit.** Refactor girdileri/çıktıları/yan etkileri değiştirmez; yalnızca iç yapıyı iyileştirir. Bunu test ile kanıtla.
6. **Regresyonu önceden avla.** Değişen fonksiyonun tüm çağıranlarını ve edge-case'lerini kontrol et.

## İş Akışı
### Bug Fixing
1. **Hatayı üret:** Adımları, girdiyi, ortamı belirle; mümkünse başarısız bir test/senaryo yaz (kırmızı).
2. **Gözlemle:** Gerçek hata mesajı, stack trace, log; varsayım değil kanıt topla.
3. **Root cause analysis:** Hatayı üreten koşulu tam olarak izole et (5 Neden / ikili arama / log ekleme).
4. **Yan etki analizi:** Bu kodu kim çağırıyor, bu davranışa kim bağımlı?
5. **Minimal düzeltmeyi planla.**
6. **Uygula** (küçük diff).
7. **Doğrula:** Kırmızı senaryo yeşile döndü mü; ilgili diğer senaryolar hâlâ çalışıyor mu (regresyon).
8. **Raporla.**

### Refactor
1. **Mevcut davranışı belgele:** Varsa testler; yoksa önce karakterizasyon (golden) testi yaz.
2. **Hedefi netleştir:** Okunabilirlik mi, performans mı, tekrar azaltma mı? Kapsamı sınırla.
3. **Küçük adımlarla dönüştür:** Her adımda test yeşil; her adım tek bir mantıksal iyileştirme.
4. **Davranış eşitliğini doğrula:** Aynı girdilere aynı çıktı/yan etki.
5. **Performans iddiası varsa ölç:** Önce/sonra karşılaştır; tahminle konuşma.
6. **Raporla.**

## Standartlar
- **Kanıt kültürü:** Her adım gözleme dayanır; "sanırım burasıydı" ile commit yok.
- **Test önce mümkünse:** Düzeltmeyi kilitleyen bir test bırak (regresyon guard).
- **Okunabilirlik artışı:** İsimlendirme netleştir, ölü kodu kaldır, karmaşık ifadeyi anlamlı ara değişkene böl — ama davranışı değiştirmeden.
- **Performans:** Gerçek darboğazı (N+1, gereksiz kopya, ağır senkron iş) hedefle; mikro-optimizasyonla okunabilirliği bozma.
- **Küçük commit/diff:** Her diff tek bir amaç taşır; karışık diff review edilemez ve revert edilemez.

## AI Nasıl Davranmalı?
- Hatayı yeniden üretmeden veya kök sebebini kanıtlamadan düzeltme uygulamaya geçme.
- "Muhtemelen buydu" deyip birden fazla yeri aynı anda değiştirme; bir hipotez, bir değişiklik, bir doğrulama.
- Refactor'a başlamadan mevcut davranışı koruyan bir güvenlik ağı (test) olduğundan emin ol; yoksa önce onu yaz.
- Kapsamı büyütmeden önce dur; ek iyileştirmeleri raporun "Sonraki öneriler" kısmına yaz, izinsiz uygulama.
- Değişiklik sonrası regresyon kontrolünü mutlaka yap ve sonucunu raporla.

## Kritik Uyarılar
- ⚠️ Hatayı gizleyen "yamalar" (boş catch, gereksiz optional chaining, susturulmuş lint) yeni ve daha sinsi bug üretir.
- ⚠️ Testsiz refactor kördür; en az bir karakterizasyon testi olmadan büyük yapıyı değiştirme.
- ⚠️ "Bu arada şunu da düzelteyim" kapsam kayması regresyonun bir numaralı sebebidir.
- ⚠️ Performans "iyileştirmesi" ölçülmeden iddia edilmez.

## Kod Değiştirirken Uygulanacak Güvenli Sıra
1. **Önce oku** — hatalı kod + çağıranlar + varsa testler.
2. **Sonra analiz et** — kök sebep + etki alanı + regresyon yüzeyi.
3. **Sonra planla** — minimal düzeltme / adımlı refactor.
4. **Sonra küçük değişiklik yap** — tek hipotez / tek adım.
5. **Sonra test et** — kırmızı→yeşil + regresyon + (refactor'da) davranış eşitliği.
6. **Sonra raporla.**

## Yapılacaklar
- ✅ Hatayı önce yeniden üret, mümkünse başarısız testle sabitle.
- ✅ Kök sebebi izole et ve kanıtla.
- ✅ En küçük hedefli değişikliği yap.
- ✅ Refactor öncesi davranışı koruyan test yaz.
- ✅ Değişiklik sonrası regresyon + davranış eşitliğini doğrula.
- ✅ Düzeltmeyi kilitleyen regresyon testi bırak.

## Yapılmayacaklar
- ❌ Hatayı üretmeden kör düzeltme yapmak.
- ❌ Semptomu bastırıp kök sebebi bırakmak.
- ❌ Küçük bir bug için gereksiz büyük rewrite.
- ❌ Refactor sırasında davranışı (sessizce) değiştirmek.
- ❌ İlgisiz değişiklikleri aynı diff'e karıştırmak.
- ❌ Ölçmeden performans iddiası.
- ❌ Lint/type hatasını susturarak "çözmek".

## Kontrol Listesi
- [ ] Hata yeniden üretildi (veya neden üretilemediği açıklandı)
- [ ] Kök sebep kanıtlandı (dosya:satır)
- [ ] Değişiklik minimal ve tek amaçlı
- [ ] Çağıranlar/etki alanı kontrol edildi
- [ ] Kırmızı→yeşil doğrulaması yapıldı
- [ ] Regresyon testleri geçti
- [ ] (Refactor) davranış eşitliği doğrulandı
- [ ] Düzeltmeyi koruyan test eklendi

## Raporlama Formatı
1. **Yapılan analiz** (üretim adımları + kök sebep)
2. **Bulunan problemler** (kök sebep + katkıda bulunan faktörler)
3. **Yapılan değişiklikler** (minimal diff özeti)
4. **Dokunulan dosyalar**
5. **Neden bu çözüm** (neden minimal, neden rewrite değil)
6. **Güvenlik etkisi**
7. **Performans etkisi** (ölçülmüşse önce/sonra)
8. **Test sonucu** (kırmızı→yeşil + regresyon)
9. **Kalan riskler**
10. **Sonraki öneriler** (kapsam dışı bıraktığın iyileştirmeler)

## Kullanım Promptu
```
/bug-fix-refactor kurallarını yükle ve uygula.
Görev: [Hatayı / refactor hedefini yaz]
Önce hatayı yeniden üret ve kök sebebini kanıtla; minimal düzeltmeyi uygula; regresyonu doğrula.
Refactor ise önce davranışı koruyan test yaz, sonra küçük adımlarla dönüştür ve davranış eşitliğini kanıtla.
```
