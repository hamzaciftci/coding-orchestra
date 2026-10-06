---
name: frontend-engineering
description: React, Next.js App Router ve Tailwind arayüzlerini profesyonel seviyede kurar ve cilalar; server ve client component sınırları, formlar, loading, empty ve error state'leri, erişilebilirlik, responsive layout, dark mode, performans, görsel tutarlılık ve microcopy konularını kapsar. Sayfa ya da component oluşturulurken veya değiştirilirken, arayüz yap, sayfa tasarla, UI düzelt, tasarımı iyileştir gibi isteklerde, bir arayüz amatör ya da tutarsız görünüp cilalanması gerektiğinde veya frontend kodu, bir dashboard ya da landing page kalite açısından incelenmek istendiğinde kullanılır.
license: MIT
compatibility: Next.js App Router ve Tailwind CSS kullanan React için yazılmıştır. Kalite çıtası ve cila incelemesi her component framework'ü için geçerlidir.
metadata:
  version: "2.0.0"
  source: coding-orchestra
---

# Frontend mühendisliği

Projenin zaten sahip olduklarından başla. Component'lerini, token'larını, spacing ölçeğini, form ve veri çekme desenlerini bul ve onlarla kur. Kendi buton stilini, renk değerlerini ya da state kütüphanesini getiren yeni bir ekran, tek başına ne kadar iyi olursa olsun ürünü daha az bitmiş gösterir. Projenin henüz bir sistemi yoksa bunu söyle ve ekranları tek tek stillendirmeden önce küçük bir sistem (token'lar ve bir avuç temel component) öner.

## Bir arayüz için "bitti" ne demek

Bitmemiş UI'ların çoğu yalnızca happy path'te bitmiştir. Bir ekran şu durumda bitmiştir:

- **Her state tasarlanmıştır.** Layout kayması olmayan loading, açıklaması ve bir sonraki adımı olan empty, sade bir dille yazılmış ve yeniden deneme imkânı sunan error, sayfayı çökertmeyen kısmi hata ve başarı geri bildirimi.
- **Fare olmadan ve kusursuz görme olmadan çalışır.** Gerçek butonlar ve linkler, label'lı input'lar, görünür focus, alanlarına bağlanmış hatalar, WCAG AA seviyesinde kontrast, yalnızca renkle iletilen hiçbir şey yok.
- **360 px'te de 1440 px'te de ayakta kalır.** İstenmeyen yatay scroll yok, dokunma hedefleri 44 px civarında, tablolar yeniden akar ya da kendi container'ı içinde scroll olur.
- **İki temada da ayakta kalır**; projede dark mode varsa bu, renklerin token'lardan gelmesi demektir.
- **Formlar gerçek kullanıma dayanır.** Alan bazında hatalar, submit sırasında disabled ve busy state'leri, çift gönderim yok, başarısız bir submit'ten sonra girdi korunur. Client validation kullanıcının yararı içindir; sunucu yeniden doğrular.
- **Yıkıcı işlemler ne olacağını söyler** ve önce sorar.
- **Metinler spesifiktir.** Butonlar işlemin adını söyler, hatalar bundan sonra ne yapılacağını söyler.

## App Router'a özgü noktalar

Server ve client component sınırı, cache, Server Action'lar ve hydration, güncel React'in eski kodun ve alışkanlıkların varsaydığından ayrıldığı yerlerdir. Bir Next.js App Router projesinde çalışırken ve `"use client"`, `useEffect` ile veri çekme ya da global bir store eklemeden önce [references/app-router-notes.md](references/app-router-notes.md) dosyasını oku.

## Cila işi

Görev mevcut bir arayüzü profesyonel gösterip hissettirmekse, yeniden stillendirmeden önce incele. [references/polish-review.md](references/polish-review.md) değerlendirilecek boyutları (hiyerarşi, tipografi, spacing, renk, state'ler, formlar, mobil, metin, landing page'ler) ve bunların önceliklendirilmiş bir listeye nasıl çevrileceğini verir. Önce sistem seviyesindeki nedenleri düzelt: düzeltilen tek bir token ya da temel component her ekranı iyileştirir, ekran ekran yapılan rötuşlar ise yeniden birbirinden uzaklaşır.

Cila davranışı değiştirmemelidir. Form gönderimi, navigasyon, analytics hook'ları ve query parametreleri tam olarak eskisi gibi çalışmalıdır; görsel bir değişiklik davranış değişikliği gerektiriyorsa bunu açıkça belirt.

## Doğrulama

Herhangi bir yolun varsa (bir dev server ve tarayıcı aracı, ekran görüntüleri, projenin görsel ya da end-to-end testleri) sonuca tarayıcıda, mobil ve masaüstü genişliklerinde ve her iki temada bak. Typecheck, lint ve testleri çalıştır. Render edilmiş halini göremediysen bunu açıkça söyle; yalnızca derlenmiş bir UI doğrulanmış değildir.

Global token'larda, temada ya da paylaşılan temel component'lerde yapılan değişiklikler her ekranı etkiler. Bunlara dokunduktan sonra ilgisiz birkaç ekranı kontrol et ve özetinde değişikliğin erişim alanından bahset.
