# Next.js App Router ve modern React notları

Bu stack'te doğru görünen frontend kodunun yanlış gittiği yerler. Framework varsayılanları major sürümler arasında farklılık gösterir; cache ya da API ayrıntılarına güvenmeden önce kurulu sürümü kontrol et.

## İçindekiler

- Server ve client component'ler
- Veri çekme ve state
- Server Action'lar ve formlar
- Hydration
- Route dosyaları
- Performans
- Tailwind ve tema
- UI katmanında güvenlik

## Server ve client component'ler

- Component'ler varsayılan olarak server component'tir. `"use client"` ifadesini yalnızca state, effect, event handler ya da bir tarayıcı API'si olan yere ekle ve ağaçta mümkün olduğunca aşağıya koy. Bir sayfayı ya da layout'u client olarak işaretlemek tüm alt ağacını bundle'a çeker.
- Bir client component, `children` olarak geçirilen server component'leri render edebilir; onları import edemez.
- Sınırı geçen prop'lar serialize edilebilir olmalıdır. Fonksiyonlar (Server Action'lar dışında), class instance'ları ve bazı kurulumlarda nesne olarak Date'ler sınırı geçemez.
- Server-only modüller (veritabanı erişimi, secret taşıyan client'lar) `import "server-only"` ile başlamalıdır; böylece bir client component'ten import edilmeleri build'i kırar.
- `async` component'ler, `cookies()`, `headers()` ve await edilen `params` / `searchParams` sunucu tarafındadır. Yeni sürümlerde `params` ve `searchParams` birer promise'tir.
- Context provider'lar client component'tir. Onları küçük bir provider dosyasına sar ve layout'un kendisini sunucuda tut.

## Veri çekme ve state

- Mümkün olan yerde veriyi server component'lerde çek ve aşağıya geçir. `useEffect` içinde fetch etmek waterfall'a, loading titremesine yol açar ve SEO sağlamaz.
- Client tarafındaki server state için projenin cache kütüphanesini kullan (TanStack Query, SWR). Çekilen veriyi global bir store'a kopyalama.
- Sayfa yenilendiğinde korunması ya da paylaşılabilmesi gereken state (filtreler, sekmeler, pagination, sıralama) URL'e aittir.
- Türetilmiş değerler render sırasında hesaplanır; state'te saklanıp bir effect ile senkronize edilmez.
- Prop'lardan ya da state'ten state set eden `useEffect` çağrılarının çoğu ya bug'dır ya da gereksizdir. Effect'ler React dışındaki bir şeyle senkronizasyon içindir.
- Memoization (`memo`, `useMemo`, `useCallback`) ölçülmüş sorunlar içindir. React Compiler etkinken elle memoization çoğunlukla gereksizdir.

## Server Action'lar ve formlar

- Bir Server Action herkese açık bir endpoint'tir. Form nasıl görünürse görünsün kimlik doğrulamayı, validation'ı ve yetkilendirmeyi kendisi yapar.
- Sonuç için `useActionState`, submit butonunu disable etmek için `useFormStatus` (ya da pending değeri) kullan. Beklenen hataları action'dan veri olarak döndür ki form gösterebilsin; fırlatılan hatalar production'da genel bir mesajla değiştirilir.
- Proje Zod resolver'lı React Hook Form kullanıyorsa onu kullanmaya devam et ve şemayı sunucuyla paylaş.
- Optimistic update'ler yalnızca action'ın geri alınabildiği yerde, hata durumunda bir rollback ve mesajla birlikte kullanılır.
- Bir mutation'dan sonra etkilenen path'i ya da tag'i revalidate et; yoksa kullanıcı eskimiş veri görür.

## Hydration

- Hydration uyuşmazlığı, sunucunun ve client'ın farklı markup render ettiği anlamına gelir. Tipik nedenler: `Date.now()`, `Math.random()`, locale'e bağlı formatlama, render sırasında `window` ya da `localStorage` okumak, geçersiz HTML iç içeliği ve tarayıcı eklentileri.
- Nedeni düzelt (yalnızca client'a ait değeri mount'tan sonra render et ya da sunucudan geçir). `suppressHydrationWarning`, `<html>` üzerindeki tema class'ı gibi nadir ve kaçınılmaz durumlar içindir.
- Titreme olmadan tema değiştirmek, temanın paint'ten önce uygulanmasını gerektirir (`next-themes` bunu inline bir script ile yapar).

## Route dosyaları

- Segment seviyesinde skeleton'lar için `loading.tsx`, segment seviyesinde hatalar için `error.tsx` (bir client component), bulunamayan kayıtlar için `not-found.tsx`, root için `global-error.tsx`.
- Yavaş kısımları, nihai layout ile eşleşen bir skeleton'a sahip `<Suspense>` içine sar; böylece sayfanın geri kalanı önce stream edilir.
- Metadata, `metadataBase` ayarlanmış olarak `export const metadata` ya da `generateMetadata` üzerinden verilir.

## Performans

- Görseller, boyutlarıyla ya da `fill` artı `sizes` ile `next/image` üzerinden; `priority` yalnızca ekranın ilk görünen kısmındaki en büyük görselde. Fontlar `next/font` üzerinden.
- Yalnızca client'ta çalışan ağır widget'ları (grafikler, editörler, haritalar) `next/dynamic` ile yükle.
- Bir client component'in neyi import ettiğine dikkat et: bir barrel dosyasından tek bir ikon ya da bir tarih kütüphanesi yüzlerce kilobayt ekleyebilir.
- Listelerde kararlı ve benzersiz `key` değerleri. Index key, liste yeniden sıralandığında state'i bozar.
- Hedefler: orta seviye bir telefonda LCP 2,5 sn altında, CLS 0,1 altında, INP 200 ms altında.

## Tailwind ve tema

- Renkler, radius'lar ve gölgeler temadan gelir (CSS değişkenleri ya da `bg-background`, `text-muted-foreground` gibi semantik class'lar). Hardcoded bir `bg-white` ya da hex değeri dark mode'u bozar ve paletten sapar.
- Tailwind v4 temayı CSS içinde `@theme` ile yapılandırır; v3 `tailwind.config` kullanır. Token eklemeden önce projenin hangisinde olduğunu kontrol et.
- Koşullu class'ları projenin `cn()` helper'ı ile (tailwind-merge'li clsx) birleştir. Class adları kaynakta tam string olarak görünmelidir; `"text-" + color` asla üretilmez.
- Tekrarlanan class grupları kopyalanmaz; bir component'e ya da bir variant'a (cva) dönüşür.
- Tam yükseklikli mobil layout'lar için `dvh` birimlerini kullan; `100vh` mobil tarayıcılarda görünür alandan daha uzundur.
- Dialog, menü, popover ve combobox'lar için erişilebilir primitive'ler projenin kütüphanesinden gelir (Radix, shadcn/ui, React Aria, Headless UI). Elle yazılanlar genellikle focus yönetimini atlar.

## UI katmanında güvenlik

- `dangerouslySetInnerHTML` ve kullanıcının verdiği `href` değerleri sanitize edilmelidir. React metni escape eder; HTML'i ya da URL'leri değil.
- Token'ların yeri `localStorage` değildir. Gizli hiçbir şey public prefix'li bir değişkende ya da bir client component'e geçirilen prop'larda bulunmamalıdır.
- Bir butonu gizlemek yetkilendirme değildir. Kararı sunucu verir.
