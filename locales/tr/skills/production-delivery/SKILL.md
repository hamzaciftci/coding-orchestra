---
name: production-delivery
description: Bir web projesi üzerinde uçtan uca canlıya hazırlık çalışması yürütür; güvenlik, backend, veri, frontend, testler ve deploy alanlarında denetim, önceliklendirilmiş bir yol haritası, doğrulanmış dikey dilimler halinde teslim edilen düzeltmeler ve son bir go / no-go raporu içerir. Kullanıcı tek bir belirli değişiklik yerine projenin bütününün bitirilmesini, devralınmasını, uçtan uca denetlenmesini ya da canlıya hazır, yayına hazır, production-ready hale getirilmesini istediğinde kullanılır.
license: MIT
compatibility: Tek başına çalışır. Diğer Coding Orchestra skill'leri (security-audit, backend-engineering, database-api-design, frontend-engineering, testing-qa, deployment-readiness) kuruluysa daha derine iner.
metadata:
  version: "2.0.0"
  source: coding-orchestra
---

# Production teslimi

Bu skill, projenin bütününü kapsayan bir çalışmayı koordine eder: projenin gerçekte hangi durumda olduğunu öğren, neyin önemli olduğunda anlaş, projeyi çalışır tutan bir sırayla düzelt ve hazır olup olmadığını dürüstçe söyle. Bu skill yönetir; alan derinliği uzman skill'lerdedir.

## Çalışmanın biçimi

**1. Anla.** Ürünün ne için olduğunu ve kimin kullandığını, stack'i ve nasıl deploy edildiğini öğren. Projenin kendi kontrollerini (install, typecheck, lint, testler, build) çalıştır ve herhangi bir şeye dokunmadan önce neyin zaten bozuk olduğunu kaydet. Ana kullanıcı akışlarını belirle; koddan net anlaşılmıyorlarsa sor.

**2. Denetle.** Projeye [references/audit-lenses.md](references/audit-lenses.md) dosyasındaki her mercekten bak: güvenlik, backend, veri ve sözleşmeler, frontend, testler, deploy. Her mercek için, kuruluysa karşılık gelen uzman skill'i kullan; kurulu değilse nelere bakılacağını mercek dosyası söyler. Mercekler birbirinden bağımsız ve çoğunlukla salt okunurdur; bu yüzden ortamın subagent'ları destekliyorsa her birine tek mercek vererek paralel çalıştır ve her birinin bulguları dosya referanslarıyla döndürmesini iste. Şaşırtıcı ya da ağır bulguları rapora girmeden önce kendin kontrol et. Subagent yoksa mercekleri öncelik sırasıyla tek tek geç.

Proje seviyesindeki iki kontrol tek bir merceğe ait değildir: bir özellik envanteri (ne var, ne yarım, belirtilen hedef için ne eksik) ve bir frontend-backend sözleşme kontrolü (her client çağrısı gerçek bir endpoint ile eşleştirilir; alan adları, tipler, auth ve status code'lar karşılaştırılır).

**3. Yol haritası, sonra dur.** Bulguları, [references/templates.md](references/templates.md) dosyasındaki ölçeği kullanarak tek bir önceliklendirilmiş listeye çevir: Engelleyici, Kritik, Önemli, Küçük, Cila. Her maddenin kanıtı, etkisi ve kabaca büyüklüğü vardır. Listeyi sun ve kodu değiştirmeden önce kullanıcının kapsamı onaylamasını bekle. Kullanıcı yalnızca denetim istediyse çalışma burada raporla biter.

**4. Dikey dilimler halinde teslim et.** Onaylanan maddeleri en ağır olandan başlayarak ele al. Bir sonrakine başlamadan önce bir şeyi tamamen bitir (şema, API, UI, test) ve her dilimden sonra projeyi build alır ve kontrollerinden geçer halde bırak. Her dilimden sonra neyin değiştiğini, nasıl doğrulandığını ve sırada ne olduğunu kısaca raporla. Bu, kullanıcının herhangi bir noktada çalışan bir projeyle durabilmesini sağlar.

**5. Yayın kararı.** `deployment-readiness` skill'indeki release checklist'i çalıştır, ardından son raporu ver: hazır, koşullu hazır ya da hazır değil; ne yapıldığı, ne kaldığı ve nasıl rollback yapılacağıyla birlikte.

## Hedefler çatıştığında öncelikler

Güvenlik, sonra veri bütünlüğü, sonra doğruluk, sonra mevcut client'larla uyumluluk, sonra performans, sonra cila. Bir güvenlik maddesi, yol haritası daha kısa görünsün diye asla düşürülmez.

## Nerede durup sorulur

Şunlardan önce açık onay bekle: migration'lar ya da veriyi silen veya yeniden yazan herhangi bir şey; kimlik doğrulama, CORS, CSP ya da cookie davranışındaki değişiklikler; bir API sözleşmesini bozmak; büyük refactor'lar, mimari değişiklikleri ya da yeni altyapı; bir secret'ın rotate edilmesini gerektiren herhangi bir şey; deploy etmek ya da production'a dokunmak. Bunların dışında, her adım için sormadan onaylanan yol haritası içinde ilerle.

Yarım kalmış bir projeye onu baştan yazarak karşılık verme. Kullanıcı ödünleşimi önünde görerek aksine karar vermedikçe, çalışanı koru ve adım adım iyileştir.

## Kanıt

Bulgular dosya ve satır gösterir. Doğruladığını (kodda okudun, çalıştırıp gözlemledin) çıkarımla söylediğinden ayır ve çalıştırılmamış bir kontrolü asla geçti diye raporlama. Secret değerlerini yazdırma, gerçek env dosyalarını açma; adlar ve konumlar yeterlidir. Bir mercekten hiçbir şey çıkmadıysa raporu şişirmek yerine bunu söyle.

## Uzun çalışmalar

Bu iş çoğu zaman tek bir oturumdan uzun sürer. Bir yol haritası onaylandıktan sonra, onu madde durumlarıyla birlikte repository'de bir dosyada (örneğin `docs/production-readiness.md`) tutmayı öner ve her dilimden sonra güncelle; böylece denetimi yeniden yapmadan işe devam edilebilir.

Yol haritası, dilim güncellemeleri ve son rapor için rapor formatları [references/templates.md](references/templates.md) dosyasındadır.
