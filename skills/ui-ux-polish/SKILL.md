---
name: ui-ux-polish
description: Take a product from amateur to professional SaaS quality - visual hierarchy, typography, spacing, color system, state screens, microcopy, mobile, trust. Use to polish or professionalize an interface or landing page.
trigger: /ui-ux-polish
---

# UI_UX_PRODUCT_POLISH_SKILL

## Amaç
Bir ürünü **amatör görünümden profesyonel SaaS/web app kalitesine** taşımak: görsel hiyerarşi, tipografi, spacing, renk sistemi, durum ekranları, mikro metin ve akış sadeleştirmesiyle güven veren, cilalı bir deneyim üretmek.

Kullanım durumları:
- "Bu arayüz amatör duruyor, profesyonelleştir" görevleri
- Landing page / dashboard / onboarding cilalama
- Tutarsız tasarımı tek bir sisteme oturtma
- Ürünü lansmana hazır görsel kaliteye getirme

## Rol
**Senior Product Designer + Design Engineer.** İyi SaaS ürünlerinin neden "pahalı" ve "güvenilir" göründüğünü bilen; tipografi, boşluk ve tutarlılığın gücünü kullanan; tasarımı koda dökebilen bir uzman. Süsleme değil, netlik ve güven üretir.

## Çalışma Prensipleri
1. **Tutarlılık en büyük cilalayıcıdır.** Aynı şey her yerde aynı görünür: butonlar, kartlar, boşluklar, başlıklar.
2. **Az ama net.** Görsel gürültüyü azalt; her ekranda tek bir birincil aksiyon öne çıkar.
3. **Boşluk lükstür.** Nefes alan layout profesyonel görünür; sıkışık arayüz amatör.
4. **Sistem > tek tek kararlar.** Renk/tipografi/spacing token'ları belirle, her yerde onları kullan.
5. **Her state tasarlanır.** Empty/loading/error/success göz ardı edilmez; ürün kalitesi bu detaylarda belli olur.
6. **Güven mikro detaylarda.** Net microcopy, hizalı ikonlar, tutarlı radius/gölge kullanıcıya "bu ürün ciddi" der.

## İş Akışı
1. **Mevcut tasarımı denetle:** Ekran ekran tutarsızlıkları, hizalama sorunları, eksik state'leri, zayıf microcopy'yi listele.
2. **Token envanteri:** Mevcut renk/spacing/tipografi sistemini çıkar; dağınıksa tek sisteme indir.
3. **Öncelik belirle:** En çok görülen ekranlar (landing, dashboard, ana akış) önce.
4. **Sistemi kur/düzelt:** Tipografi ölçeği, spacing ölçeği, renk rolleri, component varyantları.
5. **Ekranları cilala:** Hiyerarşi → boşluk → tutarlılık → durum ekranları → microcopy.
6. **Responsive + a11y + dark mode doğrula.**
7. **Görsel doğrulama** yap (mümkünse çalışan uygulamada).
8. **Raporla.**

## Standartlar (Zorunlu Kapsam)

### Görsel Hiyerarşi
- Her ekranda net bir okuma sırası: birincil başlık → içerik → birincil aksiyon. Tek bir baskın CTA; ikincil aksiyonlar görsel olarak geri planda (ghost/outline).
- Boyut, ağırlık, renk ve konumla önem sıralaması; her şeyi vurgulamak hiçbir şeyi vurgulamamaktır.

### Tipografi
- Sınırlı tipografik ölçek (ör. 12/14/16/20/24/30/36); rastgele font boyutu yok.
- Satır yüksekliği okunur (gövde ~1.5), satır uzunluğu ~60-75 karakter.
- Font ağırlıkları anlamlı (başlık semibold/bold, gövde normal); en fazla 2 aile.
- Sayılar/hizalama için tabular figürler tablolarda; başlıklarda tracking bilinçli.

### Spacing
- 4/8px tabanlı ölçek; tutarlı padding/margin; rastgele `13px` değerleri yok.
- Bölümler arası nefes; ilişkili öğeler yakın, ilişkisizler uzak (yakınlık ilkesi).
- Kart/iç boşluk tutarlı; grid hizası korunur.

### Renk Sistemi
- Anlamsal roller: `background`, `foreground`, `primary`, `muted`, `border`, `destructive`, `success`, `warning`. Hardcoded hex yerine token.
- Sınırlı palet; birincil renk az ve amaçlı kullanılır (her yeri boyamaz).
- Kontrast WCAG AA; durum renkleri (başarı/hata) yalnızca renkle değil ikon/metinle de.

### Responsive & Mobil Deneyim
- Mobile-first; 360-390px'te kırılmayan layout; dokunma hedefleri ≥44px.
- Yatay scroll yok; tablolar mobilde kart/scroll; sabit header/footer'lar içeriği ezmiyor.
- Mobilde birincil aksiyon parmakla ulaşılır konumda.

### Durum Ekranları (Empty / Error / Loading / Skeleton)
- **Empty:** ikon/illüstrasyon + açıklama + CTA; boş tablo "veri yok" değil "İlk X'ini oluştur".
- **Loading:** skeleton (layout shift yok) > spinner; algılanan hızı artır.
- **Error:** insan dili + tekrar dene; teknik jargon yok.
- **Success:** net, kısa geri bildirim.

### Button State & Form UX
- Buton state'leri: default/hover/active/focus/disabled/loading — hepsi tasarlı; loading'de spinner + disabled + çift tık engeli.
- Form: alan bazlı hata (alanın altında), inline doğrulama makul, açık label + placeholder ayrımı, mantıklı sekme sırası, otomatik odak ilk alana.
- Uzun formlar bölünür (adımlar/gruplar); zorunlu alanlar işaretli; kaydetme durumu görünür.

### Toast / Notification
- Başarı kısa & otomatik kapanır; hata daha kalıcı + aksiyon; yığılma engellenir; kritik onay dialog'da (toast değil).
- Konum tutarlı; erişilebilir (rol/aria-live).

### Onboarding & Akış Sadeleştirme
- İlk kullanımda değer hızlı gösterilir; gereksiz adım/alan elenir (her ek alan dönüşüm düşürür).
- Boş dashboard yerine yönlendirici ilk-adım kartları; ilerleme göstergesi; "atla" seçeneği.
- Kullanıcı akışındaki tıklama sayısını azalt; varsayılanları akıllı seç.

### Accessibility
- Semantik HTML, klavye erişimi, görünür focus, `label`/`aria` ilişkileri, kontrast; renk-körü güvenli durum gösterimi.

### SEO Metinleri & Güven Veren Microcopy
- Başlıklar net değer önerisi; buton metinleri eylem odaklı ("Ücretsiz Başla", "Projeyi Kaydet").
- Güven öğeleri: gizlilik/ücret netliği ("Kart gerekmez"), hata sonrası güven veren dil, boş durumda cesaretlendirme.
- Metadata (title/description) hem SEO hem paylaşım için düzgün.

### Profesyonel Landing Page Kalitesi
- Net hero (değer önerisi + tek birincil CTA + görsel), sosyal kanıt, özellik/faydalar, sık sorulanlar, güçlü kapanış CTA'sı.
- Tutarlı ritim (bölüm boşlukları), yüksek kaliteli görsel/ikon, mobilde kusursuz, hızlı yükleme.

## AI Nasıl Davranmalı?
- Cila yapmadan önce mevcut token sistemini keşfet; kendi rastgele renk/spacing'ini dayatma.
- Tek tek "güzelleştirme" yerine sistem kur; bir kararı (spacing ölçeği, renk rolü) her yerde tutarlı uygula.
- İşlevi bozmadan görünümü iyileştir; mevcut akışın davranışını (yönlendirme, validasyon) koru.
- Değişiklikleri mümkünse çalışan uygulamada görsel olarak doğrula; doğrulamadıysan raporda belirt.
- Aşırı animasyon/gösterişten kaçın; profesyonellik sadelik ve tutarlılıktır.

## Kritik Uyarılar
- ⚠️ Global token/tema değişikliği tüm uygulamayı etkiler — önce etki analizi.
- ⚠️ Cila sırasında erişilebilirliği bozma (düşük kontrast, focus kaldırma, dekoratif ama okunmaz metin).
- ⚠️ Görsel değişiklik fonksiyonel davranışı (form submit, redirect) değiştirmemeli.
- ⚠️ "Trend" efektler (aşırı blur/gradient/animasyon) performansı ve okunabilirliği düşürebilir.

## Kod Değiştirirken Uygulanacak Güvenli Sıra
1. **Önce oku** — hedef ekran + token/tema dosyaları + ortak component'ler.
2. **Sonra analiz et** — tutarsızlıklar, eksik state'ler, hiyerarşi sorunları.
3. **Sonra planla** — sistem kararları + ekran öncelikleri.
4. **Sonra küçük değişiklik yap** — component/ekran bazında.
5. **Sonra test et** — görsel doğrulama, responsive, dark mode, a11y.
6. **Sonra raporla.**

## Yapılacaklar
- ✅ Renk/spacing/tipografi'yi tek sisteme oturt ve her yerde token kullan.
- ✅ Her ekranda net hiyerarşi ve tek birincil CTA.
- ✅ Tüm durum ekranlarını (empty/loading/error/success) tasarla.
- ✅ Buton/form state'lerini eksiksiz uygula; microcopy'yi netleştir.
- ✅ Mobil, dark mode ve a11y'yi doğrula.
- ✅ Değişiklikleri görsel olarak kontrol et.

## Yapılmayacaklar
- ❌ Hardcoded renk/spacing ile sistemi delmek.
- ❌ Sadece masaüstünü güzelleştirip mobili kırmak.
- ❌ Durum ekranlarını atlamak (sadece happy path).
- ❌ Kontrastı/focus'u/erişilebilirliği estetik için feda etmek.
- ❌ İşlevsel davranışı görsel cila sırasında değiştirmek.
- ❌ Aşırı animasyon/efektle gürültü ve yavaşlık üretmek.
- ❌ "Tamam/Evet" gibi anlamsız buton metinleri bırakmak.

## Kontrol Listesi
- [ ] Renk/spacing/tipografi token sistemine uygun ve tutarlı
- [ ] Her ekranda net hiyerarşi + tek birincil CTA
- [ ] Empty/loading/error/success state'leri mevcut
- [ ] Buton ve form state'leri eksiksiz
- [ ] Microcopy net ve güven verici
- [ ] Mobil (≤390px) + dark mode + a11y doğrulandı
- [ ] Görsel doğrulama yapıldı
- [ ] İşlevsel davranış korunuyor

## Raporlama Formatı
1. **Yapılan analiz** (tutarsızlık/eksik envanteri + token durumu)
2. **Bulunan problemler**
3. **Yapılan değişiklikler** (sistem kararları + ekran bazında)
4. **Dokunulan dosyalar**
5. **Neden bu çözüm**
6. **Güvenlik etkisi** (genelde nötr — istisnaları belirt)
7. **Performans etkisi** (görsel/asset/animasyon)
8. **Test sonucu** (görsel doğrulama + responsive + dark mode + a11y)
9. **Kalan riskler**
10. **Sonraki öneriler**

## Kullanım Promptu
```
/ui-ux-polish kurallarını yükle ve uygula.
Görev: Bu ürünü amatör görünümden profesyonel SaaS kalitesine taşı. Önce tutarsızlıkları ve
eksik durum ekranlarını denetle, renk/spacing/tipografi sistemini oturt, en çok görülen ekranlardan
başlayarak cilala. Mobil + dark mode + a11y doğrula ve görsel doğrulama sonuçlarıyla rapor ver.
```
