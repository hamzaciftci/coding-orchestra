---
name: security-audit
description: Kullanıcının sahibi olduğu bir web uygulamasını istismar edilebilir güvenlik açıkları için denetler ve bunları düzeltir; IDOR, kimlik doğrulaması olmayan Server Actions, imzasız webhook'lar, açık cron route'ları ve sızmış key'ler gibi Next.js, serverless, Supabase, Prisma ve Stripe hata modlarında derinleşir. Kullanıcı güvenlik denetimi, güvenlik taraması ya da güvenlik incelemesi istediğinde, bir uygulamanın yayına çıkmak için güvenli olup olmadığını sorduğunda, güvenlik açıklarının bulunmasını ya da kapatılmasını istediğinde veya şüphelenilen bir sızıntıya ya da ihlale müdahale ederken kullanılır.
license: MIT
compatibility: Yardımcı script Node.js 18+ gerektirir. Next.js ve Node web uygulamaları için yazılmıştır; yöntem diğer stack'lere de uygulanır.
metadata:
  version: "2.0.0"
  source: coding-orchestra
---

# Güvenlik denetimi

Bu, kullanıcının sahibi olduğu ya da değerlendirmeye yetkili olduğu kod üzerinde yapılan savunma amaçlı bir iştir; pratikte bu, önündeki repository ve onun yerel ya da test ortamı demektir. Bir açığın nasıl kötüye kullanılabileceğini, önem derecesini gerekçelendirecek ve düzeltmeyi doğrulayacak kadar ayrıntıyla anlat. Silah haline getirilmiş exploit ya da tarayıcı yazma, kullanıcının kontrol etmediği host'ları yoklama. Bir isteğin bir kısmı başkasının sistemini hedefliyorsa o kısmı reddet ve geri kalanıyla devam et.

## İyi bir denetim ne teslim eder

- Dışarıdan erişilebilen her şeyin eksiksiz bir haritası; böylece kimse bakmadığı için hiçbir şey kaçmaz.
- Her biri bir kod yolunu gösteren bulgular. Okuyan kişi dosyayı açıp sorunu görebilmelidir.
- Kullanıcının düzeltilmesini istediği şeyler için, her biri doğrulanmış düzeltmeler.
- Neyin kontrol edilmediğinin ve neyi yalnızca kullanıcının yapabileceğinin dürüst bir dökümü.

## Yaklaşım

**Önce yüzeyi haritala.** Bu skill'in dizinindeki envanter script'ini projeye karşı çalıştır:

```
node scripts/attack-surface.mjs <project-dir>
```

Script; route handler'ları, Pages API route'larını, Server Action'ları, middleware matcher'ını ve vercel.json cron'larını auth, validation ve riskli sink'lere dair metin sinyalleriyle birlikte, ardından SQL dosyalarında bulunan tabloları row level security durumlarıyla ve göz atmaya değer kod desenlerini listeler. Çıktı sana nereyi okuyacağını söyler; bir bulgu listesi değildir ve temiz bir satır hiçbir şeyi kanıtlamaz. Script'in göremediklerini ekle: dashboard'da tanımlanan policy'ler, storage bucket'ları, edge function'lar, üçüncü taraf callback'leri.

**Sonra her giriş noktasını oku** ve üç soruyu cevapla: bunu kim çağırabilir, neyi kontrol ediyorlar ve bu neye dokunuyor. Çağıranın kimliğini, oturumu üreten helper dahil, request'ten sorgunun içine kadar takip et: o helper yanlışsa ona dayanan her route yanlıştır. Bu stack'teki ciddi bulguların çoğu o zincirdeki eksik bir halkadır ve ilk bakışta sorunsuz görünür.

**Sonra giriş noktası olmayan yerleri tara:** oturumların ve cookie'lerin nasıl verildiği, parolaların saklanması, saklanan içeriğin render edilmesi, CORS ve güvenlik header'ları, client bundle'ına neyin ulaştığı, veritabanı policy'leri, hata yanıtları, framework ve bağımlılık sürümleri. Raporu yazmadan önce script çıktısına geri dön ve her route, action, tablo ve desen satırının ya raporlandığını ya da bilinçli olarak temize çıkarıldığını kontrol et.

Herhangi bir alanı temiz saymadan önce [references/stack-pitfalls.md](references/stack-pitfalls.md) dosyasını oku. Next.js'e, serverless platformlara, Supabase'e, Prisma'ya ve Stripe'a özgü, genel checklist'lerin kaçırdığı hata modlarını listeler.

**Denetim mi, düzeltme mi?** Kullanıcı bir denetim istediyse raporla ve hiçbir şeyi değiştirme. Bul ve düzelt dediyse, sınırlı düzeltmeleri doğrudan uygula (eksik bir sahiplik filtresi, bir imza kontrolü, bir girdi şeması) ve meşru kullanıcılar için davranışı değiştiren ya da geri alınamayan değişikliklerden önce onay için dur: auth akışları, uygulama genelindeki CORS, CSP ya da cookie ayarları, veritabanı policy'leri ve şeması, bir secret'ın rotate edilmesini ya da git geçmişinin yeniden yazılmasını gerektiren her şey.

**Her düzeltmeyi doğrula.** Yetkisiz yolun artık başarısız olduğunu ve meşru yolun hâlâ çalıştığını gösteren bir test ya da somut bir request dizisi kullan. Çalıştıramadıysan bunu söyle; çalıştırılmamış bir kontrolü geçmiş gibi anlatma.

## Önem taşıyan muhakeme kararları

- **Sızmış secret'lar.** Bir secret'ı koddan kaldırmak sızıntıyı düzeltmez. Secret'ın rotate edilmesi gerekir ve bunu yalnızca kullanıcı yapabilir. Değeriyle değil, değişken adı ve konumuyla raporla; teyit etmek için gerçek env dosyalarını açma. Git geçmişini yeniden yazmak yıkıcıdır ve kullanıcının kararıdır.
- **Yalnızca gösterebildiğini raporla.** "Hiçbir şey bulunamadı" bir kategori için geçerli bir sonuçtur. Her bulguyu **Doğrulandı** (kodda izlendi) ya da **Doğrulama gerekli** (dashboard policy'leri ya da platform env değerleri gibi repo dışındaki bir şeye bağlı) olarak işaretle ki okuyan hangisinin hangisi olduğunu bilsin.
- **Önem derecesi, saldırganın ne kazandığına ve neye ihtiyaç duyduğuna göre belirlenir.** Kritik: anonim ya da giriş yapmış herhangi bir kullanıcı başka kullanıcıların verisine, paraya, admin fonksiyonlarına ya da bir secret'a ulaşır. Yüksek: aynısı, anlamlı ön koşullarla. Orta: sınırlı etki ya da gerçekleşmesi zor ön koşullar. Düşük: sıkılaştırma.
- **Bir şeyi test etmek için asla bir kontrolü kapatma** ve asla bir bypass'ı yerinde bırakma.
- **Bir düzeltme uygulamayı bozabilir.** CORS, CSP ya da cookie flag'lerini sıkılaştırmak davranışı her yerde değiştirir; önce mevcut davranışa neyin bağlı olduğunu kontrol et.

## Rapor

En ağır olan en üstte olacak şekilde bir özet tablosuyla başla, ardından her bulgu için [references/report-template.md](references/report-template.md) dosyasındaki sekiz alanı içeren bir blok ver: ne, önem derecesi ve nedeni, konum, nasıl kötüye kullanılabileceği, düzeltme, bunun açığı neden kapattığı, kalan risk ve nasıl doğrulanacağı. Kapsam dışı kalan ya da doğrulanmayanlarla ve yalnızca kullanıcının yapabileceği işlemlerle bitir.
