---
name: testing-qa
description: Production'daki web uygulamalarında gerçekten bozulan şeylere odaklanan testleri planlar ve yazar; yetkilendirme ve IDOR matrisleri, girdi validation'ı, webhook'lar, cron job'ları, ödemeler, uçtan uca kritik kullanıcı akışları ve düzeltilen bug'lar için regresyon testleri gibi konuları projenin kendi araçlarıyla (Vitest, Jest, Playwright) ele alır. Kullanıcı test yaz, test ekle ya da testleri iyileştir dediğinde, test altyapısı ya da QA kurulmasını, bir test planı yazılmasını, anlamlı coverage artışını veya bir düzeltmenin ya da sürümün doğrulanmasını istediğinde kullanılır.
license: MIT
compatibility: Örnekler Vitest ya da Jest ve Playwright ile test edilen bir TypeScript web uygulaması varsayar. Risk öncelikli yaklaşım her stack için geçerlidir.
metadata:
  version: "2.0.0"
  source: coding-orchestra
---

# Test ve QA

Amaç bir coverage rakamı değil, en çok can yakacak şeylerin otomatik olarak kontrol edildiğine dair güvendir. Yetkilendirme kuralları, ödeme yolu ve ana kullanıcı akışı üzerinde 30 testi olan bir proje, formatter'lar üzerinde 300 testi olan bir projeden daha güvenlidir.

## Riskten başla

Test yazmadan önce, bozulduğunda pahalıya patlayacak şeyleri listele: bir kullanıcının başkasının verisini okuması, paranın yanlış verilmesi ya da yanlış tahsil edilmesi, veri kaybı, kayıt ya da checkout akışının bozulması, sessizce duran bir job. Her birini onu koruyan kodla eşleştir ve o koruma kaldırılsa bir testin kalıp kalmayacağını kontrol et. Bu eksik listesi test planıdır. Kullanıcının öncelikleri ayarlayabilmesi için büyük bir suite yazmadan önce planı sun.

Ardından projenin mevcut test runner'ını, düzenini, factory'lerini ve konvansiyonlarını kullan. Hiç test kurulumu yoksa stack'e uyan en küçüğünü öner ve bağımlılık eklemeden önce onay al.

## Bu stack'te testler nerede karşılığını verir

[references/risk-based-test-plan.md](references/risk-based-test-plan.md) dosyasında yetkilendirme matrisi şablonu ve route handler'ları, Server Action'ları, gerçek imza doğrulamalı webhook'ları, cron route'larını, veritabanına dayanan kodu ve Playwright ile end-to-end akışları test etmek için somut yönergeler bulunur. Bir suite planlarken ya da bunlardan herhangi birini test ederken oku.

Önce neyin kapsanacağının kısa hali:

- **Matris olarak yetkilendirme.** Korumalı her işlem için: anonim, sahip, aynı role sahip başka bir kullanıcı ve bir admin. "Başka kullanıcı" durumu IDOR'u bulan durumdur ve çoğu suite'te eksik olan da odur.
- **Girdinin reddi.** Bilinmeyen alanlar yazılmaz (mass assignment), geçersiz biçimler belgelenen hatayı döndürür ve limitler tutar.
- **Para ve tekrarlar.** Hatalı imzalı bir webhook reddedilir, iki kez teslim edilen aynı event tek bir etki yaratır, eşzamanlı istekler bakiyeyi aşamaz.
- **Uçtan uca kritik akış**, gerçek bir tarayıcıda, bir kez.
- **Düzeltilen her bug için bir regresyon testi**, düzeltmeden önce kalacak şekilde yazılmış.

## Bir test suite'inin değerini koruyan kurallar

- Kalan bir test bilgidir. Onu assertion'ı zayıflatarak, case'i silerek, test edilen koddaki bir güvenlik kontrolünü gevşeterek ya da toptan bir retry ekleyerek geçirme. Test yanlışsa nedenini söyle ve testi düzelt; kod yanlışsa kodu düzelt.
- Testler asla production'a ya da paylaşılan veriye dokunmaz ve asla gerçek kimlik bilgilerine ihtiyaç duymaz. Tek kullanımlık bir veritabanı, sağlayıcıların test modları ve test kurulumunda tanımlanan sahte secret'lar kullan.
- Flaky bir testin nedeni teşhis edilir (zaman, sıralama, paylaşılan state, ağ, animasyon) ve düzeltilir. Süreleri değil, koşulları bekle.
- Davranışı public interface'ler üzerinden test et. Implementasyon ayrıntılarına bağlı testler her refactor'da kalır ve onlara güvenilmez olur.

## Raporlama

Artık neyin kapsandığını riskler cinsinden, neyi çalıştırdığını ve gerçek sonucunu, neyin test edilmeden kaldığını ve nedenini raporla. Bir suite'i, çalıştırıp geçtiğini görmediysen geçiyor diye sunma; bu ortamda çalıştırılamayan bir şey varsa hangi kısım olduğunu söyle.
