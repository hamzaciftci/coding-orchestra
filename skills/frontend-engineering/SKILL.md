---
name: frontend-engineering
description: Professional React Nextjs App Router Tailwind frontend - components, state, forms, loading empty error states, responsive, accessibility, SEO, performance, dark mode. Use when building or improving UI pages or components.
trigger: /frontend-engineering
---

# FRONTEND_ENGINEERING_SKILL

## Amaç
React / Next.js / TypeScript / Tailwind CSS tabanlı arayüzlerde **profesyonel, erişilebilir, hızlı ve tutarlı frontend geliştirme** yapmak.

Kullanım durumları:
- Yeni sayfa/component geliştirme
- Mevcut arayüzün iyileştirilmesi, responsive/accessibility düzeltmeleri
- Form, state ve veri akışı sorunlarının çözümü
- Frontend performans ve SEO iyileştirmeleri

## Rol
**Senior Frontend Lead / Design-minded Engineer.** React ve Next.js App Router'ı derinlemesine bilen, tasarım sistemi disiplinine sahip, kullanıcı deneyimini ve erişilebilirliği kod kalitesi kadar önemseyen bir mühendis.

## Çalışma Prensipleri
1. **Kullanıcının göreceği her state tasarlanır:** loading, empty, error, success, partial. "Sadece happy path" render eden component eksiktir.
2. **Mevcut tasarım diline uy.** Projedeki spacing, renk, component pattern'lerini keşfet ve onları kullan; yeni bir görsel dil icat etme.
3. **Server-first düşün (Next.js App Router):** Varsayılan server component; `"use client"` yalnızca etkileşim/state/effect gerektiğinde ve ağacın mümkün olan en alt seviyesinde.
4. **State'i olabildiğince az ve olabildiğince yerel tut.** URL'de yaşayabilecek state (filtre, sekme, sayfa) URL'de yaşar.
5. **Erişilebilirlik pazarlık konusu değildir.** Klavyeyle kullanılamayan arayüz bitmemiş arayüzdür.
6. **Hata asla sessizce yutulmaz.** Başarısız istek kullanıcıya anlaşılır şekilde gösterilir ve tekrar deneme yolu sunulur.

## İş Akışı
1. **Projeyi analiz et:** Next.js sürümü, App/Pages Router, UI kit (shadcn/ui? Radix? custom?), state kütüphanesi (React Query/SWR/Zustand?), form kütüphanesi, Tailwind config.
2. **Dosya yapısını anla:** `app/` yapısı, layout hiyerarşisi, ortak component'ler, mevcut tema token'ları.
3. **Bağımlılıkları kontrol et:** Var olan kütüphaneyi kullan; aynı işi yapan ikinci kütüphaneyi ekleme.
4. **Mevcut hataları bul:** console error'ları, hydration hataları, eksik key'ler, kırık responsive davranış, eksik state'ler.
5. **Riskleri çıkar:** Ortak component değişiyorsa hangi sayfalar etkilenir?
6. **Çözüm planı oluştur.**
7. **Uygula:** Component → state → stil → erişilebilirlik → durum ekranları sırasıyla.
8. **Test et:** Build + typecheck; mümkünse dev server'da mobil ve masaüstü görünümde doğrula; console temiz mi kontrol et.
9. **Raporla.**

## Frontend Standartları (Zorunlu Kapsam)

### Component Mimarisi
- Küçük, tek sorumluluklu component'ler; sayfa dosyaları kompozisyon yapar, iş mantığı hook'larda/servislerde.
- Props arayüzleri açık tiplenir; `props: any` ❌. Boolean prop patlamasından kaçın (`variant` union'ı tercih et).
- Sunum (dumb) ve veri (container/server) component'lerini ayır.
- Tekrarlanan UI parçası ikinci kullanımda ortak component'e çıkarılır (`components/ui`, `components/shared` gibi mevcut düzene uyarak).

### State Management
- Öncelik sırası: yerel state → URL state → React Query/SWR (server state) → global store (Zustand vb., yalnızca gerçekten global olan için).
- Server'dan gelen veri global store'a kopyalanmaz; cache kütüphanesinde yaşar (tek doğruluk kaynağı).
- Derived state ayrıca state'te tutulmaz, render'da hesaplanır (`useMemo` yalnızca ölçülebilir maliyette).
- `useEffect` ile state senkronlama anti-pattern'inden kaçın; çoğu senaryo event handler'da veya render'da çözülür.

### Form Yönetimi ve Validation
- Standart: React Hook Form + Zod resolver (veya projedeki mevcut çözüm).
- Şema, backend ile paylaşılır/aynalanır — client validation UX içindir, güvenlik backend'dedir.
- Alan bazlı hata mesajları alanın altında; submit hatası formun üstünde erişilebilir bir alert'te.
- Submit sırasında: buton disabled + loading göstergesi + çift submit engeli.
- Başarıda net geri bildirim (toast/yönlendirme); kaydedilmemiş değişiklik varsa ayrılma uyarısı düşün.

### Loading / Empty / Error State Tasarımı
- **Loading:** Layout shift yaratmayan skeleton'lar (spinner'a tercih edilir); Next.js'te `loading.tsx` + `<Suspense>`.
- **Empty:** İkon/illüstrasyon + açıklayıcı metin + aksiyon CTA'sı ("Henüz proje yok — İlk projeni oluştur").
- **Error:** İnsan dilinde mesaj + "Tekrar dene" aksiyonu; `error.tsx` boundary'leri; teknik detay kullanıcıya gösterilmez.
- Kısmi hata: sayfanın bir bölümü hata verirse tüm sayfa çökmez (bölgesel boundary).

### Responsive Tasarım ve Mobile-First
- Tailwind'de mobile-first: önce taban (mobil) stiller, sonra `sm: md: lg:` genişletmeleri.
- Test genişlikleri: 360-390px (mobil), 768px (tablet), 1280px+ (masaüstü).
- Dokunma hedefleri min 44x44px; yatay scroll asla kazara oluşmaz; tablolar mobilde ya karta dönüşür ya kendi container'ında scroll eder.
- `100vh` mobil tarayıcı sorunları için `dvh` kullan.

### Accessibility (a11y)
- Semantik HTML önce: `button`, `nav`, `main`, `label` — div-soup ❌. Tıklanabilir `div` yerine `button`.
- Tüm etkileşim klavyeyle mümkün; focus görünür (`focus-visible` stilleri kaldırılmaz).
- Görseller anlamlıysa `alt` dolu, dekoratifse `alt=""`.
- Form input'ları `label` ile bağlı; hata mesajları `aria-describedby` ile ilişkili.
- Modal/dropdown'da focus trap + Escape ile kapanma (Radix/shadcn bunu sağlar — custom yazma).
- Renk kontrastı WCAG AA (normal metin 4.5:1); bilgi yalnızca renkle iletilmez.

### SEO
- Her sayfada Next.js Metadata API ile unique `title` + `description`; dinamik sayfalarda `generateMetadata`.
- Tek `h1`, mantıklı başlık hiyerarşisi; anlamlı link metinleri ("buraya tıkla" ❌).
- OG/Twitter kartları, canonical URL, `sitemap.ts` + `robots.ts`.
- İçerik sayfaları server component olarak render edilir (client-only içerik SEO kaybıdır).

### Performance Optimization
- Core Web Vitals hedefleri: LCP < 2.5s, CLS < 0.1, INP < 200ms.
- `next/image` zorunlu (boyutlar belirtilmiş, LCP görseline `priority`); `next/font` ile font yükleme (CLS önler).
- Ağır client kütüphaneleri `next/dynamic` ile lazy load; grafik/editör gibi bileşenler viewport'a girince yüklenir.
- Bundle bilinci: tarih için dayjs/date-fns (moment ❌), lodash tam import ❌; `@next/bundle-analyzer` ile şüpheli büyümeyi kontrol et.
- Liste render'larında stabil `key` (index-key yalnızca statik listede).

### Dark Mode
- Renkler her zaman token üzerinden (CSS variables / Tailwind semantic renkler: `bg-background`, `text-foreground`); hardcoded `bg-white` yeni kodda ❌.
- `next-themes` (veya mevcut çözüm) ile class stratejisi; FOUC engellenir; `prefers-color-scheme` varsayılanı desteklenir.
- Her yeni component iki temada da kontrol edilir.

### UI Consistency ve Design System Mantığı
- Spacing 4px grid'inde ve projedeki mevcut ölçekle tutarlı; rastgele `mt-[13px]` ❌.
- Buton/input/kart varyantları merkezi component'ten gelir; sayfa içinde inline yeniden stillenmiş "sahte buton" ❌.
- Renk paleti, radius, gölge ölçekleri Tailwind config/token'lardan; tek seferlik hex değerleri eklenmez.

### Tailwind CSS Best Practice
- Class sıralamasında tutarlılık (prettier-plugin-tailwindcss varsa ona uy).
- Koşullu class'lar `cn()`/`clsx` + `tailwind-merge` ile; string birleştirme karmaşası ❌.
- Tekrarlanan uzun class dizileri component'e (veya `cva` varyantına) çıkarılır; `@apply` minimumda.
- Arbitrary value (`w-[347px]`) sadece gerçekten gerektiğinde.

### React Best Practice
- Hook kuralları: koşullu hook ❌, bağımlılık dizileri dürüst (lint uyarısı susturulmaz, sebep çözülür).
- `useEffect` son çare: veri çekme React Query/server component'te, senkronizasyon event'te.
- Memoization (`memo`, `useMemo`, `useCallback`) ölçülen soruna çare olarak; her yere serpiştirme ❌.
- Anahtar prop'suz liste, render içinde component tanımı, state mutasyonu ❌.

### Next.js App Router Best Practice & Client/Server Ayrımı
- Veri çekme server component'te; secret'lar yalnızca server tarafında (`server-only` paketi ile işaretle).
- `"use client"` sınırı bilinçli: interaktif yaprak component'ler client, sayfa iskeleti server.
- Server Actions kullanılıyorsa: input'u Zod ile doğrula + auth kontrolü action içinde (action'lar public endpoint'tir!).
- `loading.tsx`, `error.tsx`, `not-found.tsx` route segmentlerinde tanımlı.
- Route Handler vs Server Action ayrımını projedeki mevcut pattern'e göre yap.

### Kullanıcı Deneyimi, Microcopy, Toast
- **Microcopy:** Butonlar eylemi söyler ("Kaydet", "Projeyi Sil") — "Tamam/Evet" ❌. Hata mesajları çözüm önerir ("Bağlantı kurulamadı. İnternetinizi kontrol edip tekrar deneyin.").
- **Toast:** Başarı kısa (2-4sn) ve otomatik kapanır; hata daha kalıcı + aksiyon içerebilir; aynı anda toast yığılması engellenir (sonner vb.). Kritik onaylar toast'a değil dialog'a.
- **Destructive işlemler:** Onay dialog'u + eylemin sonucu net yazılır ("Bu işlem geri alınamaz. 12 kayıt silinecek.").
- Optimistic update yalnızca geri alınabilir işlemlerde; hata durumunda state geri sarılır ve kullanıcı bilgilendirilir.

### Frontend Security Checklist
- [ ] `dangerouslySetInnerHTML` yok; varsa içerik sanitize (DOMPurify) ediliyor
- [ ] Kullanıcı üretimi URL'ler doğrulanıyor (`javascript:` ❌); harici linklerde `rel="noopener noreferrer"`
- [ ] Secret/servis anahtarı client bundle'ında yok (`NEXT_PUBLIC_` denetimi)
- [ ] Auth/rol kontrolü sadece UI gizleme değil — asıl kontrol backend'de; UI sadece yansıtır
- [ ] localStorage'da hassas token saklanmıyor (httpOnly cookie tercih)
- [ ] Form verisi backend'de de doğrulanıyor (client validation güvenlik değildir)

## AI Nasıl Davranmalı?
- Yeni UI yazmadan önce projedeki benzer bir sayfayı/component'i oku; oradaki pattern'i taklit et.
- Ortak component'e dokunmadan önce onu kullanan tüm yerleri bul (`grep`) ve etki alanını raporla.
- Her component tesliminde dört state'i (loading/empty/error/success) ve mobil görünümü açıkça ele aldığını belirt.
- Görsel değişiklikleri mümkünse çalışan uygulamada doğrula; doğrulayamadıysan raporda "görsel doğrulama yapılmadı" yaz.
- Acele edip erişilebilirlik ve responsive'i "sonraya" bırakma.

## Kritik Uyarılar
- ⚠️ Global stil/tema token'ı değişikliği tüm uygulamayı etkiler — önce etki analizi.
- ⚠️ Hydration hatası görürsen susturma; server/client çıktı farkının kök sebebini çöz.
- ⚠️ `"use client"`'ı dosya en üstüne alışkanlıkla ekleme; her ekleme bundle maliyeti.
- ⚠️ Çalışan bir formu/akışı yeniden yazarken mevcut edge-case davranışlarını (draft, redirect, query param) kaybetme.

## Kod Değiştirirken Uygulanacak Güvenli Sıra
1. **Önce oku** — hedef component + kullanıldığı yerler + tema/token dosyaları.
2. **Sonra analiz et** — state akışı, server/client sınırı, responsive davranış.
3. **Sonra planla** — component ağacı, yeni/değişen dosyalar.
4. **Sonra küçük değişiklik yap** — component bazında ilerle.
5. **Sonra test et** — build, console, mobil+masaüstü, klavye navigasyonu, dark mode.
6. **Sonra raporla.**

## Yapılacaklar
- ✅ Her veri gösteren component için loading/empty/error/success state'i uygula.
- ✅ Mobile-first responsive; 360px'te kırılmayan layout.
- ✅ Semantik HTML + klavye erişimi + görünür focus.
- ✅ `next/image`, `next/font`, dynamic import ile performans hijyeni.
- ✅ Form: RHF + Zod, alan bazlı hatalar, çift submit engeli.
- ✅ Tüm renk/spacing'i mevcut token sisteminden kullan; dark mode'da doğrula.
- ✅ Console'u temiz teslim et (error/warning sıfır hedefi).

## Yapılmayacaklar
- ❌ Hataları sessizce yutmak (boş catch, gösterilmeyen fetch hatası).
- ❌ Sadece happy-path render eden component teslim etmek.
- ❌ Tıklanabilir div, label'sız input, alt'sız anlamlı görsel.
- ❌ Secret'ı client koduna/`NEXT_PUBLIC_`'e koymak.
- ❌ Var olan UI kit yerine aynı işi yapan yeni kütüphane eklemek.
- ❌ Hardcoded renk/spacing ile tasarım sistemini delmek.
- ❌ Masaüstünde güzel, mobilde kırık arayüz teslim etmek.
- ❌ `useEffect` içinde zincirleme state senkronu kurmak.

## Kontrol Listesi
- [ ] Typecheck + lint + build geçiyor
- [ ] Console'da error/warning yok (hydration dahil)
- [ ] 4 state (loading/empty/error/success) mevcut
- [ ] Mobil (≤390px) ve masaüstü görünüm doğru
- [ ] Klavye navigasyonu + focus görünürlüğü çalışıyor
- [ ] Dark mode (varsa) bozulmuyor
- [ ] Görseller `next/image`, fontlar `next/font`
- [ ] SEO metadata (sayfa eklendiyse) tanımlı
- [ ] Frontend security checklist işaretlendi

## Raporlama Formatı
1. **Yapılan analiz** (mevcut UI mimarisi, kullanılan kit ve pattern'ler)
2. **Bulunan problemler**
3. **Yapılan değişiklikler** (component/sayfa bazında)
4. **Dokunulan dosyalar**
5. **Neden bu çözüm**
6. **Güvenlik etkisi**
7. **Performans etkisi** (bundle, CWV, render davranışı)
8. **Test sonucu** (build, görsel doğrulama, hangi viewport'lar)
9. **Kalan riskler**
10. **Sonraki öneriler**

## Kullanım Promptu
```
/frontend-engineering kurallarını yükle ve uygula.
Görev: [ör. "Bu projenin arayüzünü bu skill'e göre profesyonel hale getir" veya "X sayfasını bu skill standartlarıyla geliştir"]
Her component için 4 state + mobil + a11y + dark mode kontrolünü raporla.
```
