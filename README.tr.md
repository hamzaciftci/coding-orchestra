<p align="center">
  <img src=".github/social-preview.png" alt="Coding Orchestra — production web uygulamaları için Agent Skills" width="100%">
</p>

# 🎻 Coding Orchestra

**Web uygulamalarını production'a taşımak için Agent Skills: [Claude Code](https://claude.com/claude-code), [Codex](https://developers.openai.com/codex) ve [Agent Skills](https://agentskills.io) formatını okuyan diğer agent'lar için.**

[![Release](https://img.shields.io/github/v/release/hamzaciftci/coding-orchestra?color=6E56CF)](https://github.com/hamzaciftci/coding-orchestra/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Skills](https://img.shields.io/badge/skills-7-6E56CF)](#skilller)
[![Languages](https://img.shields.io/badge/skills-EN%20%2B%20TR-blue)](#kurulum)
[![Agent Skills](https://img.shields.io/badge/format-Agent%20Skills-D97757)](https://agentskills.io)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

> [!IMPORTANT]
> **Coding Orchestra baştan yenilendi — bu sürüm v2.** v1'in on bir uzun kural kitabı; ihtiyaç halinde yüklenen reference'lar, yardımcı script'ler ve ölçülmüş sonuçlarla gelen yedi yalın, taşınabilir Agent Skill'e dönüştü ve artık hem Claude Code'da hem Codex'te çalışıyor. [Ne değişti](#v2de-ne-değişti) · [v1'den geçiş](#v1den-geçiş) · [Sonuçlar](evals/RESULTS.md)

Yedi skill, bir coding agent'a Next.js / serverless / PostgreSQL projesinde çalışırken zaten bilmediği şeyleri verir: bu stack'e özgü hata modları, önemli sınırlar (neyin onayınızı gerektirdiği, neyin asla yazdırılmaması gerektiği), işe yarar bir çıktının biçimi ve denetimi eksiksiz bir envanterle başlatan küçük script'ler. Yedi skill'den biri, diğerlerini kullanarak uçtan uca bir production'a hazırlık çalışmasını yönetir.

> 🇬🇧 English → [README.md](README.md)
> Skill'ler **İngilizce** (`skills/`) ve **Türkçe** (`locales/tr/skills/`) olarak, aynı yapı ve aynı script'lerle gelir.

---

## v2'de ne değişti

v1, adım adım yönetilmesi gereken modeller için yazılmış on bir uzun kural kitabıydı. Güncel modeller genel mühendislik pratiğini zaten biliyor; o metnin çoğu davranışı değiştirmeden context harcıyordu. v2, davranışı gerçekten değiştiren kısımları korur ve yeniden yapılandırır:

- **Modelin ihtiyaç duymadığı talimatlar değil, sahip olmadığı bilgi.** Her `SKILL.md` 60 satırın altında: iyi bir sonuç neye benzer, nerede durup sorulur, hangi kararlar muhakeme ister. Stack'e özgü ayrıntı, yalnızca görev gerektirdiğinde yüklenen reference dosyalarında durur.
- **Deterministik işler için script'ler.** Güvenlik denetimi için giriş noktası ve policy envanteri, secret değerlerini hiç okumayan bir environment variable envanteri ve deploy sonrası smoke kontrolü.
- **Taşınabilir.** Frontmatter yalnızca Agent Skills spesifikasyonundaki alanları kullanır; aynı klasörler Claude Code'da, Codex'te ve uyumlu diğer agent'larda çalışır.
- **Daha az, daha keskin skill.** On bir skill yediye indi. Her zaman açık olan "genel kodlama" kural kitabı ve bug-fix kural kitabı kaldırıldı; yerlerini `AGENTS.md` / `CLAUDE.md` dosyanıza ekleyebileceğiniz 6 satırlık bir [çalışma anlaşması](locales/tr/templates/AGENTS.md) aldı.
- **Ölçüldü.** [`evals/`](evals/) altında bir validator, v1'e karşı context maliyeti karşılaştırması, bir tetikleme testi ve tohumlanmış hatalarla bir denetim benchmark'ı var. Sonuçlar, v2'nin kazanmadığı yerler dahil, [`evals/RESULTS.md`](evals/RESULTS.md) dosyasında.

v1'den mi geliyorsunuz? [v1'den geçiş](#v1den-geçiş) bölümüne bakın.

---

## Skill'ler

| Skill | Ne zaman | Ne katar |
|---|---|---|
| `production-delivery` | Bütün bir projenin denetlenmesini, bitirilmesini ya da production'a hazırlanmasını istediğinizde | Altı mercekten denetim (agent subagent destekliyorsa paralel), önceliklendirilmiş yol haritası, onay kapısı, dikey dilimler, nihai hazır / hazır değil raporu |
| `security-audit` | Sahibi olduğunuz bir uygulamada güvenlik açıklarının bulunmasını ya da kapatılmasını istediğinizde | Route'lar, Server Actions, cron, middleware kapsamı ve row level security için envanter script'i; Next.js, Supabase, Prisma, Stripe tuzakları; güven etiketli 8 alanlı bulgu formatı |
| `deployment-readiness` | Deploy etmek üzereyken, production build'i kırıldığında ya da bir deploy'un doğrulanması gerektiğinde | Env envanter script'i (yalnızca isimler), Vercel / serverless / edge production tuzakları, kanıtlı release checklist'i, smoke script'i |
| `backend-engineering` | Endpoint, Server Action, webhook, cron job, auth ya da ödeme akışı eklerken veya değiştirirken | Sunucu kodu için "bitti" tanımı ve serverless'ın uzun ömürlü sunucudan ayrıldığı yerler |
| `database-api-design` | Şema değiştirirken, migration yazarken ya da API sözleşmesini değiştirirken | Aşamalı expand/contract tarifleri, kilitlemeyen DDL, Prisma ve Supabase tuzakları, uyumluluk kuralları |
| `frontend-engineering` | Arayüz geliştirirken ya da bir arayüzün profesyonel görünmesi gerektiğinde | Arayüz için "bitti" tanımı, App Router notları, cila inceleme yöntemi |
| `testing-qa` | Test eklerken, QA planlarken ya da bir düzeltmeyi doğrularken | Risk öncelikli test planı, yetkilendirme matrisi, webhook, cron ve Server Action'ların gerçekten nasıl test edileceği |

**Next.js (App Router) · React · TypeScript · Tailwind · Node serverless · PostgreSQL / Supabase / Prisma · Vercel · Stripe** için yazıldı. Her skill'deki yöntem başka stack'lere de taşınır; reference ayrıntıları bu stack'e özgüdür.

Güvenlik çalışması savunma amaçlıdır: skill'ler sahibi olduğunuz ya da değerlendirmeye yetkili olduğunuz sistemleri denetlemek ve düzeltmek içindir; agent'a silah haline getirilmiş exploit yazmamasını ve üçüncü taraf host'ları yoklamamasını söyler.

---

## Kurulum

Agent'ınıza uyan yolu seçin. Varsayılan dil İngilizcedir; Türkçe set için aşağıdaki isim ya da flag'i kullanın.

### Claude Code — plugin

```
/plugin marketplace add hamzaciftci/coding-orchestra
/plugin install coding-orchestra-tr@coding-orchestra
```

İngilizce: `/plugin install coding-orchestra@coding-orchestra`. Plugin skill'leri namespace ile gelir, örneğin `/coding-orchestra-tr:security-audit`.

### Claude Code ya da Codex — kurulum script'i

```bash
git clone https://github.com/hamzaciftci/coding-orchestra.git
cd coding-orchestra
./install.sh --tr                  # Claude Code, Türkçe  -> ~/.claude/skills
./install.sh --tr --agent codex    # Codex                -> ~/.agents/skills
./install.sh --tr --agent all      # ikisi birden
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
| `--dry-run` / `-DryRun` | Ne olacağını gösterir, hiçbir şeyi değiştirmez |

Kurulum script'i yalnızca Coding Orchestra skill'lerinin üzerine yazar. Aynı adla başka bir skill kuruluysa `--force` vermediğiniz sürece ona dokunmaz.

### Elle

Herhangi bir skill klasörünü agent'ınızın taradığı dizine kopyalayın:

```bash
cp -r locales/tr/skills/security-audit ~/.claude/skills/     # Claude Code
cp -r locales/tr/skills/security-audit ~/.agents/skills/     # Codex
```

Her klasör kendi kendine yeterlidir (`SKILL.md`, `references/`, `scripts/`, `agents/openai.yaml`). İngilizce ve Türkçe setler aynı skill adlarını kullanır; bir konuma tek dil kurun.

Kurulumdan sonra yeni bir oturum başlatın.

### İsteğe bağlı: çalışma anlaşması

Skill'ler ihtiyaç olduğunda yüklenir. Her oturumda geçerli olmasını istediğiniz birkaç kural için (kapsam, onay noktaları, secret'ların ele alınışı, dürüst raporlama) [`locales/tr/templates/AGENTS.md`](locales/tr/templates/AGENTS.md) içindeki bölümü projenizin `AGENTS.md` (Codex ve diğerleri) ya da `CLAUDE.md` (Claude Code) dosyasına kopyalayın. İngilizcesi: [`templates/AGENTS.md`](templates/AGENTS.md).

---

## Kullanım

İşi anlatın; agent skill'i açıklamasından seçer:

```
Bu projeyi baştan sona denetle ve bana bir yol haritası çıkar. Kapsamı onaylayana kadar kod değiştirme.
Yayına çıkmadan önce bu uygulamada güvenlik açığı var mı bak. Sadece raporla.
Cuma günü deploy ediyoruz. Release'i ne engelliyor?
users.fullname kolonunu kesinti olmadan display_name olarak yeniden adlandır.
```

Ya da skill'i adıyla çağırın: Claude Code'da `/security-audit` (plugin olarak kuruluysa `/coding-orchestra-tr:security-audit`), Codex'te `$security-audit`.

Yardımcı script'ler doğrudan da çalıştırılabilir; Node 18+ yeterlidir, bağımlılık yoktur:

```bash
node skills/security-audit/scripts/attack-surface.mjs path/to/project
node skills/deployment-readiness/scripts/env-inventory.mjs path/to/project
node skills/deployment-readiness/scripts/smoke.mjs https://staging.example.com / /login /api/health
```

---

## Bir skill nasıl kurulu

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

- `description`, skill'in ne yaptığını ve ne zaman kullanılacağını söyler; skill etkinleşene kadar agent'ın gördüğü tek şey budur.
- `SKILL.md` büyük harfli kurallar yerine gerekçeleri açıklar ve yöntemi modele bırakır.
- Frontmatter `name`, `description`, `license`, `compatibility` ve `metadata` ile sınırlıdır. Araca özgü ayarlar dışarıda kalır; böylece her agent dosyayı yükleyebilir.
- Skill'ler birbirine adıyla atıf yapar. `production-delivery` tek başına çalışır; uzman skill'ler kuruluysa daha derine iner.

---

## Evals

```bash
node evals/validate.mjs        # spec uyumu, boyut bütçeleri, linkler, EN/TR eşitliği, manifest'ler
node evals/context-cost.mjs    # context ayak izi, v1 ve güncel sürüm
```

`evals/` ayrıca bir skill seçim testi (yakın ıskalar dahil 46 İngilizce ve Türkçe istek) ve bir denetim benchmark'ı içerir: 30 tohumlanmış hata barındıran, kasıtlı olarak kusurlu bir Next.js projesi; skill'siz, v1 skill'iyle ve güncel skill'le denetlenir. Nasıl çalıştırılacağı için [`evals/README.md`](evals/README.md), sayılar ve sınırları için [`evals/RESULTS.md`](evals/RESULTS.md) dosyasına bakın.

---

## v1'den geçiş

| v1 skill | v2 |
|---|---|
| `production-delivery` | `production-delivery` (yeniden yazıldı) |
| `fullstack-delivery` | `production-delivery` içine alındı |
| `security-audit` | `security-audit` |
| `backend-engineering` | `backend-engineering` |
| `database-api-design` | `database-api-design` |
| `deployment-readiness` | `deployment-readiness` |
| `frontend-engineering` | `frontend-engineering` |
| `ui-ux-polish` | `frontend-engineering` içine alındı (cila incelemesi) |
| `testing-qa` | `testing-qa` |
| `general-coding` | kaldırıldı; [çalışma anlaşmasına](locales/tr/templates/AGENTS.md) bakın |
| `bug-fix-refactor` | kaldırıldı; güncel modeller bunu skill olmadan yapıyor |

Diğer kırıcı değişiklikler: İngilizce artık `skills/` altında ve kurulum script'inin varsayılanı; Türkçe `locales/tr/skills/` altına taşındı (`--tr`). Standart dışı `trigger:` frontmatter alanı kaldırıldı. Mevcut bir kurulumu temizlemek için kurulum script'ini `--prune-legacy` ile çalıştırın.

---

## Repository yapısı

```
coding-orchestra/
├── skills/                  # İngilizce skill'ler (aynı zamanda Claude Code plugin'inin skill'leri)
├── locales/tr/              # Türkçe skill'ler, plugin manifest'i ve çalışma anlaşması
├── templates/AGENTS.md      # isteğe bağlı, her zaman açık çalışma anlaşması
├── .claude-plugin/          # plugin ve marketplace manifest'leri
├── evals/                   # validator, context maliyeti, tetikleme testi, denetim benchmark'ı
├── install.sh, install.ps1
└── README.md, README.tr.md, CONTRIBUTING.md, CHANGELOG.md, LICENSE
```

## Katkı

[CONTRIBUTING.md](CONTRIBUTING.md) dosyasına bakın. Kısaca: modelin sahip olmadığı bilgiyi ekleyin, `SKILL.md` dosyasını yalın tutun, İngilizce ve Türkçeyi birlikte güncelleyin ve `node evals/validate.mjs` çalıştırın.

## Lisans

[MIT](LICENSE) © Hamza Çiftçi.

---

<sub>Anthropic ya da OpenAI ile bağlantılı değildir. "Claude" ve "Claude Code" Anthropic'in, "Codex" OpenAI'ın ticari markasıdır.</sub>
