# Cila incelemesi

Çalışan ama bitmemiş görünen bir arayüzü değerlendirmenin ve önce neyin düzeltileceğine karar vermenin bir yolu. Bunu bir mercek olarak kullan, sonra bulguları etkisine göre raporla; her ekran için doldurulacak bir form değildir.

## İçindekiler

- İnceleme nasıl yapılır
- Boyutlar
- UI'ı genellikle amatör gösteren şeyler
- Landing page'ler
- Raporlama

## İnceleme nasıl yapılır

1. Yalnızca koda değil, ürüne bak. Ana ekranları mobil ve masaüstü genişliklerinde, her iki temada, üretebildiğin yerlerde boş, dolu ve hatalı veriyle aç.
2. Önce sistemi bul: token'lar, temel component'ler, tipografi ölçeği, spacing ölçeği. Ekranların bunu nerede atladığını not et.
3. Ürünü taşıyan iki üç ekranı seç (ilk kullanım, ana dashboard ya da liste, birincil form, fiyatlandırma ya da landing). Orada derine inmek, her şeyin üzerinden yüzeysel bir geçişten daha değerlidir.
4. Nedenleri belirtilerden ayır. Hizası bozuk yirmi kart genellikle eksik tek bir layout component'idir.

## Boyutlar

**Hiyerarşi.** Her ekranın bariz tek bir birincil aksiyonu ve net bir okuma sırası vardır. Her şey kalın ya da renkliyse hiçbir şey öne çıkmaz. İkincil aksiyonlar görsel olarak daha sessizdir.

**Tipografi.** Küçük ve sabit bir ölçek (örneğin 12, 14, 16, 20, 24, 30, 36), en fazla iki font ailesi, gövde metninde 1,5 civarında satır yüksekliği, 60 ile 75 karakter arası satırlar, sayısal kolonlarda tabular rakamlar.

**Spacing.** Değerler 4 ya da 8 px'lik bir ölçekten gelir. İlişkili şeyler yakın, ilişkisiz şeyler uzak durur. Kartların içinde tutarlı padding ve bölümler arasında tutarlı boşluklar. Sıkışık layout'lar her şeyden hızlı amatör görünür.

**Renk.** Tutarlı kullanılan semantik roller (background, foreground, primary, muted, border, destructive, success, warning). Primary renk bir anlam taşıyacak kadar seyrek kullanılır. Kontrast AA'yı karşılar. Durum, renge ek olarak ikon ya da metinle de taşınır.

**Tutarlılık.** Aynı öğe her yerde aynı görünür: tek buton seti, tek input stili, tek radius ölçeği, tek gölge ölçeği, tek çizgi kalınlığında tek ikon ailesi.

**State'ler.** İçeriğin şeklini taşıyan skeleton'lar, açıklayan ve ilk aksiyonu sunan empty state'ler, insan diliyle yazılmış ve yeniden deneme sunan hatalar, görünür başarı. Butonların hover, focus, active, disabled ve busy state'leri vardır.

**Formlar.** Label'lar alanların üstünde (placeholder label değildir), hatalar ait oldukları alanın altında, mantıklı tab sırası, uzun formlar gruplanmış ya da adımlara bölünmüş, zorunlu alanlar işaretli, kaydetme durumu görünür.

**Geri bildirim.** Toast'lar başarıda kısa, hatada bir aksiyonla birlikte kalıcıdır; tek bir konumdadır ve asla beşi üst üste yığılmaz. Geri alınamaz işlemlerin onayı, sonucu açıkça söyleyen bir dialog kullanır.

**Mobil.** Hiçbir şey taşmaz, birincil aksiyonlara başparmakla ulaşılır, sticky bar'lar içeriği örtmez, tablolar kartlara dönüşür ya da kendi içinde scroll olur.

**Metin.** Butonlar ne olacağını söyler ("Gönder" değil, "Proje oluştur"). Hatalar ne yapılacağını söyler. Empty state'ler teşvik eder. Terminoloji her ekranda aynıdır.

**İlk kullanım.** Yeni bir hesap boş bir dashboard değil, yönlendirme ve bir ilk adım görür. Kayıtta zorunlu her alan dönüşüm kaybettirir; yalnızca şimdi gerekeni iste.

## UI'ı genellikle amatör gösteren şeyler

Neden olma sıklığına göre kabaca sıralı:

1. Tutarsız spacing ve hizalama.
2. Çok fazla font boyutu ve kalınlığı.
3. Net bir birincil aksiyon yok; birkaç öğe birbiriyle yarışıyor.
4. Rengin semantik değil dekoratif kullanılması; düşük kontrastlı griler.
5. Eksik state'ler: yüklenirken boş ekranlar, ham hata string'leri, boş tablolar.
6. Farklı kaynaklardan gelen karışık component stilleri.
7. Jenerik ya da geliştiriciye hitap eden metinler.
8. Yapının eksik olduğu yerde ilgi çekmek için kullanılan efektler (gradient, blur, gölge, animasyon).

## Landing page'ler

Bir landing page sırasıyla şunlara ihtiyaç duyar: değeri ziyaretçinin diliyle söyleyen bir başlık, tek bir birincil call to action, ürünün bir görseli, kanıt (müşteriler, sayılar, referanslar), ana faydalar, itirazlara cevaplar (fiyat netliği, SSS, "kart gerekmez" gibi güven sinyalleri) ve kapanışta bir call to action. Dekoratif herhangi bir şeyden önce yükleme hızını ve mobil layout'u kontrol et.

## Raporlama

Bulguları kısa, önceliklendirilmiş bir liste olarak raporla; her biri nerede olduğunu, kullanıcı için neden önemli olduğunu ve düzeltmeyi içersin. Nedene göre grupla: önce sistem seviyesindeki düzeltmeler (token'lar, temel component'ler), sonra kilit ekranlar, sonra kalan ayrıntılar. Hangi ekranları gerçekten render edilmiş halde gördüğünü ve hangilerini yalnızca koddan değerlendirdiğini söyle.
