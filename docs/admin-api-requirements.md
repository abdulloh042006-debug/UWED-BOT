# Admin panel — backend uchun API talablari

Barcha endpointlar `/api/v1/admin/...` ostida. Har so‘rovda server Telegram `initData` sessiyasi va rolni tekshiradi;
interfeysdagi yashirish/qulflash xavfsizlik hisoblanmaydi. Xatolar: 401/403. Muhim amallar audit logga yoziladi.

| Endpoint | Maqsad |
|---|---|
| `GET dashboard/summary` | 7 ta hisoblagich (talabalar, faol foydalanuvchi, faol mentor, skill exchange, faol loyiha, tasdiq kutayotgan, shikoyat) va oxirgi amallar |
| `GET users?q=&role=&status=` | Qidiruv va filtr |
| `GET users/{id}` | Profil va faollik xulosasi |
| `POST users/{id}/suspend`, `POST users/{id}/restore` | Hisob holati |
| `POST users/{id}/role` | Rol berish — faqat Admin |
| `GET verifications?type=&status=` | type: mentor, certificate, portfolio |
| `POST verifications/{id}/approve`, `POST verifications/{id}/reject` | reject uchun `reason` majburiy |
| `GET reports?status=` | Shikoyatlar va dalillar |
| `POST reports/{id}/resolve`, `/dismiss`, `/remove-content` | `remove-content` idempotent bo‘lishi kerak |
| `GET projects?status=&reported=` | Loyihalar va ishtirok statistikasi |
| `POST projects/{id}/hide` | Kontentni yashirish |
| `POST announcements` | `audience` (all, students, mentors) va `text` |
| `GET announcements/{id}/delivery` | queued / sent / delivered / failed hisoblari |
| `GET settings`, `PATCH settings/{key}` | Platforma sozlamalari (sezgirlari — Admin) |
| `GET audit-log?cursor=` | Admin amallari tarixi, pagination bilan |

Holat qiymatlari uchun umumiy enum kerak; prototipdagi nomlar (`faol`, `to‘xtatilgan`, `pending`, `approved`, `rejected`) faqat namuna.
