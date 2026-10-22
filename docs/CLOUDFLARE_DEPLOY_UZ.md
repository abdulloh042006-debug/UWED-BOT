# Cloudflare'ga joylash (terminalsiz, faqat brauzer orqali)

`wrangler.toml` tayyor va tekshirilgan (`wrangler deploy --dry-run`: bundle 202 KiB, `DB` va `BUCKET` ulanishlari taniladi).
Hech qanday maxfiy kalit repoga yozilmaydi.

## 1. D1 baza
Dashboard → **Storage & databases → D1 → Create database** → nomi: `uwed-talent-network`.
Yaratilgach **Database ID** ni nusxalang va `wrangler.toml` ichidagi `REPLACE_WITH_D1_DATABASE_ID` o‘rniga qo‘ying
(ID maxfiy emas; menga yuborsangiz o‘zim yozib qo‘yaman). Jadvallar worker birinchi so‘rovda o‘zi yaratiladi (`ensureMigrations`).

## 2. R2 bucket
**Storage & databases → R2 → Create bucket** → nomi: `uwed-evidence`. (R2 uchun to‘lov kartasi ulangan bo‘lishi kerak bo‘lishi mumkin.)

## 3. Worker'ni GitHub'dan ulash
**Compute → Workers & Pages → Create → Import a repository** → `abdulloh042006-debug/UWED-BOT` → branch: `feature/claude-ui-v2` (yoki main'ga qo‘shilgandan keyin main).
Build command bo‘sh, deploy command: `npx wrangler deploy`. Worker nomi `uwed-talent-network` bo‘lsin.

## 4. Maxfiy qiymatlar (Worker → Settings → Variables and Secrets → Secret)
| Nomi | Qiymat |
|---|---|
| `TELEGRAM_BOT_TOKEN` | BotFather bergan YANGI (aylantirilgan) token |
| `TELEGRAM_WEBHOOK_SECRET` | 24+ tasodifiy belgi (harf/raqam) |
| `SESSION_SECRET` | 32+ tasodifiy belgi |
| `BOOTSTRAP_ADMIN_TELEGRAM_ID` | O‘zingizning Telegram ID raqamingiz |
| `MINIAPP_URL` | Worker manzili, masalan `https://uwed-talent-network.<subdomen>.workers.dev/` |

## 5. Telegram
- BotFather → `/mybots` → bot → **Bot Settings → Menu Button** → URL = `MINIAPP_URL`.
- Webhook: brauzer manzil qatoriga (token va secret o‘rniga o‘zingiznikini qo‘yib) yozing:
  `https://api.telegram.org/bot<TOKEN>/setWebhook?url=<MINIAPP_URL>api/v1/bot/webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>`
  (Secret faqat 16–256 ta harf/raqam/`_`/`-` bo‘lsin. Menyu tugmasi va webhook'ni `npm run bot:setup -- --apply` ham o‘rnatadi, lekin u terminal talab qiladi.)

## 6. Tekshirish
`/start` → ilovani oching → ikki xil akkauntda kirib ko‘ring. Faqat shundan keyin "real Telegram'da tekshirildi" deyish mumkin.

Eslatma: eski GitHub va bot tokenlarini deploydan keyin albatta yangilang.
