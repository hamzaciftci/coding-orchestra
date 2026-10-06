# Çalışma anlaşması

<!--
Coding Orchestra'dan isteğe bağlı, her zaman geçerli yönergeler. Aşağıdaki bölümü projenizin
AGENTS.md (Codex ve diğer agent'lar okur) veya CLAUDE.md (Claude Code okur) dosyasına kopyalayın.
Bilerek kısa tutulmuştur: bir agent'ın koddan çıkaramayacağı şeyi, yani risk, kapsam ve
raporlamanın nasıl ele alınmasını istediğinizi kapsar. Projenize uyacak şekilde düzenleyin.
-->

## Bu repository'de nasıl çalışılır

- Kendi varsayılanların yerine kodda zaten var olan konvansiyonları (yapı, isimlendirme, hata yönetimi, test stili) izle.
- Değişiklikleri istenenle sınırlı tut. Fark ettiğin ilgisiz sorunları belirt; aynı değişiklik içinde düzeltme.
- Hedefler çatıştığında sıra şudur: güvenlik, veri bütünlüğü, doğruluk, mevcut client'larla uyumluluk, performans, cila.
- Geri alması zor olan veya bu repository'nin dışına uzanan bir şey yapmadan önce sor: veritabanı migration'ları ve veri silme, kimlik doğrulama veya CORS/CSP davranışındaki değişiklikler, bir API sözleşmesini bozmak, altyapı veya büyük bir bağımlılık eklemek, deploy etmek ya da production'a dokunan herhangi bir şey.
- Secret değerlerini asla yazdırma, loglama veya commit etme; gerçek env dosyalarını açma. Secret'lara değişken adıyla atıfta bulun. Sızmış bir secret'ın bir insan tarafından rotate edilmesi gerekir; koddan silmek çözüm değildir.
- Bir değişiklikten sonra projenin kontrollerini (typecheck, lint, testler, build) çalıştır ve gerçek sonucu raporla. Neyi doğruladığını, neyi çıkarımla söylediğini ve neyi test etmediğini belirt.
