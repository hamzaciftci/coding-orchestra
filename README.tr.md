<p align="center">
  <img src=".github/social-preview.png" alt="Coding Orchestra — production web uygulamaları için Agent Skills" width="100%">
</p>

# 🎻 Coding Orchestra

**Bir coding agent'ın Next.js / serverless web uygulamasını production'a taşımasına yardım eden yedi Agent Skill. [Claude Code](https://claude.com/claude-code), [Codex](https://developers.openai.com/codex) ve açık [Agent Skills](https://agentskills.io) formatını okuyan diğer agent'larda çalışır.**

[![Release](https://img.shields.io/github/v/release/hamzaciftci/coding-orchestra?color=6E56CF)](https://github.com/hamzaciftci/coding-orchestra/releases)
[![Lisans: MIT](https://img.shields.io/badge/Lisans-MIT-green.svg)](LICENSE)
[![Skill](https://img.shields.io/badge/skill-7-6E56CF)](#skilller)
[![Diller](https://img.shields.io/badge/skill-TR%20%2B%20EN-blue)](#kurulum)
[![Agent Skills](https://img.shields.io/badge/format-Agent%20Skills-D97757)](https://agentskills.io)
[![Katkıya Açık](https://img.shields.io/badge/PR-hoş%20geldin-brightgreen.svg)](CONTRIBUTING.md)

> 🇬🇧 English → [README.md](README.md) · v1'den (11 skill) mi geliyorsunuz? → [v1'den geçiş](#v1den-geçiş)

Güncel modeller genel mühendislik pratiğini zaten biliyor. Gerçek bir projede eksik olan, stack'e ve işe özgü bilgi: Server Actions, Supabase row level security ya da Vercel cron'un production'da nasıl bozulduğu, geri alınamaz bir şeye dokunmadan önce nerede durup sorulacağı, işe yarar bir denetim raporunun neye benzediği. Bu skill'ler tam olarak bu bilgiyi verir, fazlasını değil, ve yalnızca görev gerektirdiğinde yüklenir.

---

## Hızlı başlangıç

**Claude Code** (plugin):

```
/plugin marketplace add hamzaciftci/coding-orchestra
/plugin install coding-orchestra-tr@coding-orchestra
```

**Claude Code ya da Codex** (kurulum script'i):

```bash
git clone https://github.com/hamzaciftci/coding-orchestra.git
cd coding-orchestra
./install.sh --agent all --tr        # Windows: ./install.ps1 -Agent all -Tr
```

Sonra işi anlatın:

```
Yayına çıkmadan önce bu uygulamada güvenlik açığı var mı bak. Sadece raporla, kod değiştirme.
```

Agent, açıklamasına bakarak `security-audit` skill'ini seçer. İngilizce set ve projeye özel kurulum dahil diğer seçenekler [Kurulum](#kurulum) bölümünde.

---

## Skill'ler

| Skill | Ne zaman | Ne katar |
|---|---|---|
| `production-delivery` | Bütün bir projenin denetlenmesini, bitirilmesini ya da production'a hazırlanmasını istediğinizde | Altı mercekten denetim (agent subagent destekliyorsa paralel), önceliklendirilmiş yol haritası, onay kapısı, doğrulanmış dikey dilimlerle düzeltmeler ve nihai hazır / hazır değil raporu |
| `security-audit` | Sahibi olduğunuz bir uygulamada güvenlik açıklarının bulunmasını ya da kapatılmasını istediğinizde | Route'lar, Server Actions, cron, middleware kapsamı ve row level security için envanter script'i; Next.js, Supabase, Prisma ve Stripe tuzakları; güven etiketli 8 alanlı bulgu formatı |
| `deployment-readiness` | Deploy etmek üzereyken, production build'i kırıldığında ya da bir deploy'un doğrulanması gerektiğinde | Env değişkeni envanter script'i (yalnızca isimler, asla değerler), Vercel / serverless / edge tuzakları, kanıtlı release checklist'i, smoke script'i |
| `backend-engineering` | Endpoint, Server Action, webhook, cron job, auth ya da ödeme akışı eklerken veya değiştirirken | Sunucu kodu için "bitti" tanımı ve serverless'ın uzun ömürlü sunucudan ayrıldığı yerler |
| `database-api-design` | Şema değiştirirken, migration yazarken ya da API sözleşmesini değiştirirken | Aşamalı expand/contract tarifleri, kilitlemeyen DDL, Prisma ve Supabase tuzakları, uyumluluk kuralları |
| `frontend-engineering` | Arayüz geliştirirken ya da bir arayüzün profesyonel görünmesi gerektiğinde | Arayüz için "bitti" tanımı, App Router notları, cila inceleme yöntemi |
| `testing-qa` | Test eklerken, QA planlarken ya da bir düzeltmeyi doğrularken | Risk öncelikli test planı, yetkilendirme matrisi, webhook, cron ve Server Action'ların gerçekten nasıl test edileceği |

**Next.js (App Router) · React · TypeScript · Tailwind · Node serverless · PostgreSQL / Supabase / Prisma · Vercel · Stripe** için yazıldı. Her skill'deki yöntem başka stack'lere de taşınır; reference ayrıntıları taşınmaz.

`production-delivery` tek başına çalışır; diğer altı skill kuruluysa daha derine iner. Genel kodlama ya da hata düzeltme için bilerek bir skill yok: güncel modeller bunu skill olmadan iyi yapıyor ve her kodlama görevini sahiplenen bir skill hepsinde context harcar.

Güvenlik çalışması savunma amaçlıdır. Skill'ler sahibi olduğunuz ya da değerlendirmeye yetkili olduğunuz sistemleri denetlemek ve düzeltmek içindir; agent'a silah haline getirilmiş exploit yazmamasını ve üçüncü taraf host'ları yoklamamasını söyler.

---

## Kullanım

İşi anlatın; agent onu bir skill'in açıklamasıyla eşleştirir:

```
Bu projeyi baştan sona denetle ve bana bir yol haritası çıkar. Kapsamı onaylayana kadar kod değiştirme.
Cuma günü deploy ediyoruz. Release'i ne engelliyor?
users.fullname kolonunu kesinti olmadan display_name olarak yeniden adlandır.
Ödeme akışına test ekle; en çok bozulma ihtimali olan yerden başla.
```

Ya da skill'i adıyla çağırın:

| Agent | Doğrudan çağırma |
|---|---|
| Claude Code (script ya da elle kurulum) | `/security-audit` |
| Claude Code (plugin) | `/coding-orchestra-tr:security-audit` |
| Codex | `$security-audit` ya da `/skills` listesinden seçin |

Yardımcı script'ler tek başına da çalışır; Node 18+ yeterlidir, bağımlılık yoktur:

```bash
node skills/security-audit/scripts/attack-surface.mjs path/to/project
node skills/deployment-readiness/scripts/env-inventory.mjs path/to/project
node skills/deployment-readiness/scripts/smoke.mjs https://staging.example.com / /login /api/health
```

---

## Anthropic ve OpenAI önerilerine göre tasarlandı

v2, iki firmanın Agent Skills için yayımladığı önerileri izler; böylece aynı klasör iki agent'ta da değişmeden çalışır:

| Öneri | Coding Orchestra'da nasıl uygulandı |
|---|---|
| Yalnızca Agent Skills spesifikasyonunda tanımlı alanları kullan | Frontmatter `name`, `description`, `license`, `compatibility` ve `metadata` ile sınırlı. v1'deki standart dışı `trigger:` alanı kaldırıldı. |
| Açıklama üçüncü şahıs ağzından yazılır; skill'in ne yaptığını **ve ne zaman kullanılacağını** söyler, çünkü skill yüklenmeden önce agent'ın gördüğü tek şey odur | Her açıklama önce kapsamı, sonra bir "Use when…" cümlesini içerir. Kapsam dışı istekler (hata düzeltme, refactor, CI) agent'a skill'siz bırakılır. |
| `SKILL.md` kısa tutulur (500 satırın çok altında); ayrıntı yalnızca gerektiğinde yüklenen dosyalara taşınır (kademeli yükleme), tek seviye derinlikte | Her `SKILL.md` 60 satırın altında. Stack'e özgü ayrıntı `references/` altında ve doğrudan `SKILL.md`'den link verilir. |
| Katı kurallar yığmak yerine gerekçeyi açıkla, yöntemi modele bırak | Skill'ler sonucu, sınırları ve muhakeme gerektiren kararları gerekçeleriyle anlatır. Büyük harfli MUST listeleri yok. |
| Deterministik, tekrarlanabilir işler için script kullan | `scripts/` altında envanter ve smoke kontrol script'leri; agent çalıştırır, tek başına da okunabilir. |
| Codex, isteğe bağlı görüntüleme bilgilerini `agents/openai.yaml` dosyasından okur | Her skill görünen ad, kısa açıklama ve varsayılan prompt içeren bir `agents/openai.yaml` ile gelir. |
| Her zaman geçerli proje kuralları skill'e değil `AGENTS.md` (Codex) ya da `CLAUDE.md` (Claude Code) dosyasına yazılır | Altı satırlık bir [çalışma anlaşması](locales/tr/templates/AGENTS.md) kapsamı, onay noktalarını, secret'ların ele alınışını ve dürüst raporlamayı kapsar. |
| Skill'in işe yaradığını varsayma, ölç | [`evals/`](evals/) altında validator, context maliyeti karşılaştırması, seçim testi ve tohumlanmış hatalı denetim benchmark'ı var. |

Bir skill'in yapısı:

```
skills/security-audit/
├── SKILL.md              # ~50 satır: sonuç, yaklaşım, sınırlar, muhakeme gerektiren kararlar
├── references/           # yalnızca görev gerektirdiğinde yüklenir
│   ├── stack-pitfalls.md
│   └── report-template.md
├── scripts/
│   └── attack-surface.mjs
└── agents/openai.yaml    # Codex için görüntüleme bilgileri
```

---

## Sonuçlar

2026-10-05 tarihinde v1'e karşı ölçüldü; tüm sayılar ve sınırları [`evals/RESULTS.md`](evals/RESULTS.md) dosyasında.

- **Daha az context.** Bir skill tetiklendiğinde gövdesi, yerini aldığı v1 dosyasından %57–86 daha küçük; genel kodlama ve hata düzeltme istekleri artık hiçbir şey yüklemiyor. Her oturumda duran skill listesi %23 büyüdü, çünkü açıklamalar artık her skill'in ne zaman kullanılacağını da söylüyor.
- **Daha isabetli seçim.** Kapsam içindeki 32 isteğin 31–32'sinde doğru skill seçildi; kapsam dışındaki 14 isteğin hiçbirinde skill yüklenmedi (v1 bunların 4–6'sında yüklüyordu).
- **Denetim başarısı modele bağlı.** Sonnet'te her koşul, skill'li ya da skill'siz, tohumlanmış 30 hatanın hepsini buldu; iyileşen raporun kendisiydi. Haiku'da v2 ortalama 30'da 25,7 buldu; v1 21,5, skill'siz 19,5. Fark büyük ölçüde stack'e özgü hatalardan geliyor.
- **Çalıştırması daha ucuz değil.** Denetim başına token kullanımı v1 ile aşağı yukarı aynı.

Örneklem küçük (her hücrede iki ya da üç çalıştırma), benchmark projesini skill'lerin yazarı hazırladı ve Codex içinde henüz hiçbir şey çalıştırılmadı.

---

## Kurulum

Varsayılan dil İngilizcedir. Her yolun Türkçe karşılığı vardır.

### Claude Code plugin

```
/plugin marketplace add hamzaciftci/coding-orchestra
/plugin install coding-orchestra-tr@coding-orchestra    # Türkçe
/plugin install coding-orchestra@coding-orchestra       # İngilizce
```

Claude Code kurulum kapsamını sorar (user, project ya da local). Plugin skill'leri namespace ile gelir: `/coding-orchestra-tr:security-audit`, `/coding-orchestra:security-audit`.

### Kurulum script'i (Claude Code, Codex ya da ikisi)

```bash
./install.sh --tr                    # Claude Code, Türkçe -> ~/.claude/skills
./install.sh --tr --agent codex      # Codex               -> ~/.agents/skills
./install.sh --tr --agent all        # ikisi birden
```

Windows PowerShell: `./install.ps1 -Tr`, `./install.ps1 -Tr -Agent codex`, `./install.ps1 -Tr -Agent all`.

| Flag (sh / ps1) | Etki |
|---|---|
| `--agent claude\|codex\|all` / `-Agent` | Hangi agent'ın skill dizinine kurulacağı (varsayılan `claude`) |
| `--lang en\|tr`, `--en`, `--tr` / `-Lang`, `-En`, `-Tr` | Dil (varsayılan `en`) |
| `--project` / `-Project` | Bulunduğunuz projeye kurar (`.claude/skills`, `.agents/skills`); ekip arkadaşlarınız skill'leri repo'dan alır |
| `--dir PATH` / `-Dir PATH` | `PATH` konumundaki projeye kurar |
| `--skill NAME` / `-Skill a,b` | Yalnızca adı verilen skill'leri kurar |
| `--prune-legacy` / `-PruneLegacy` | Artık var olmayan v1 skill'lerini kaldırır |
| `--force` / `-Force` | Coding Orchestra'dan gelmeyen aynı adlı bir skill'in üzerine yazar |
| `--dry-run` / `-DryRun` | Hiçbir şeyi değiştirmeden ne olacağını gösterir |

Kurulum script'i yalnızca Coding Orchestra skill'lerinin üzerine yazar. Aynı adla başka bir skill kuruluysa `--force` vermediğiniz sürece ona dokunmaz.

### Elle

Herhangi bir skill klasörünü agent'ınızın taradığı dizine kopyalayın. Her klasör kendi kendine yeterlidir.

```bash
cp -r locales/tr/skills/security-audit ~/.claude/skills/     # Claude Code
cp -r locales/tr/skills/security-audit ~/.agents/skills/     # Codex
```

İngilizce skill'ler `skills/` altındadır. İki dil aynı skill adlarını kullanır; bir konuma tek dil kurun.

### İsteğe bağlı: çalışma anlaşması

Skill'ler ihtiyaç olduğunda yüklenir. Her oturumda geçerli olmasını istediğiniz birkaç kural için [`locales/tr/templates/AGENTS.md`](locales/tr/templates/AGENTS.md) içindeki bölümü projenizin `AGENTS.md` (Codex ve diğerleri) ya da `CLAUDE.md` (Claude Code) dosyasına kopyalayın. İngilizcesi: [`templates/AGENTS.md`](templates/AGENTS.md).

Claude Code da Codex de yeni kurulan skill'leri kendiliğinden algılar. Bir skill görünmezse Claude Code'da plugin kurulumundan sonra `/reload-plugins` çalıştırın ya da yeni bir oturum başlatın.

---

## v1'den geçiş

v1, adım adım yönetilmesi gereken modeller için yazılmış on bir uzun kural kitabıydı. v2, davranışı hâlâ değiştiren kısımları tutar, gerisini bırakır.

| v1 skill | v2 |
|---|---|
| `production-delivery` | `production-delivery` (yeniden yazıldı) |
| `fullstack-delivery` | `production-delivery` içine alındı |
| `ui-ux-polish` | `frontend-engineering` içine alındı (cila incelemesi) |
| `security-audit`, `backend-engineering`, `database-api-design`, `deployment-readiness`, `frontend-engineering`, `testing-qa` | aynı adlar, yeniden yazıldı |
| `general-coding` | kaldırıldı; yerini [çalışma anlaşması](locales/tr/templates/AGENTS.md) aldı |
| `bug-fix-refactor` | kaldırıldı; güncel modeller bunu skill olmadan yapıyor |

Diğer kırıcı değişiklikler:

- İngilizce `skills/` altına taşındı ve artık kurulum script'inin varsayılanı. Türkçe `locales/tr/skills/` altına taşındı; kurmak için `--tr` verin.
- `trigger:` frontmatter alanı kaldırıldı.

Mevcut bir kurulumu güncellemek ve kaldırılan skill'leri silmek için:

```bash
git pull
./install.sh --tr --prune-legacy     # Windows: ./install.ps1 -Tr -PruneLegacy
```

---

## Repository yapısı

```
coding-orchestra/
├── skills/                  # İngilizce skill'ler (aynı zamanda Claude Code plugin'inin skill'leri)
├── locales/tr/              # Türkçe skill'ler, plugin manifest'i ve çalışma anlaşması
├── templates/AGENTS.md      # isteğe bağlı, her zaman açık çalışma anlaşması
├── .claude-plugin/          # plugin ve marketplace manifest'leri
├── evals/                   # validator, context maliyeti, seçim testi, denetim benchmark'ı
├── install.sh, install.ps1
└── README.md, README.tr.md, CONTRIBUTING.md, CHANGELOG.md, LICENSE
```

## Katkı

[CONTRIBUTING.md](CONTRIBUTING.md) dosyasına bakın. Kısaca: modelin zaten bilmediği bilgiyi ekleyin, `SKILL.md` dosyasını yalın tutun, İngilizce ve Türkçeyi birlikte değiştirin ve her commit'ten önce `node evals/validate.mjs` çalıştırın.

## Lisans

[MIT](LICENSE) © Hamza Çiftçi.

---

<sub>Anthropic ya da OpenAI ile bağlantılı değildir. "Claude" ve "Claude Code" Anthropic'in, "Codex" OpenAI'ın ticari markasıdır.</sub>
