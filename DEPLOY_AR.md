# نشر الموقع — خطوات مختصرة بالعربي

ده checklist قصير. التفاصيل الكاملة في [`DEPLOY.md`](./DEPLOY.md).

**الوقت المتوقع:** 30–45 دقيقة أول مرة.
**التكلفة:** مجاناً على Render + Supabase free tier.

---

## 1) مشروع Supabase

- [ ] افتح <https://app.supabase.com> → **New project**
- [ ] اختار منطقة **Frankfurt** (أقرب حاجة لعملاء مصر/MENA)
- [ ] استنى دقيقتين لحد ما المشروع يجهز

### خد 3 قيم من **Project Settings → API**:

- `NEXT_PUBLIC_SUPABASE_URL` (Project URL)
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (أو `ANON_KEY` في المشاريع القديمة)
- `SUPABASE_SERVICE_ROLE_KEY` (سري — بيتحط في السيرفر بس)

### شغّل الـ migrations

- [ ] من Supabase دخل **SQL Editor → New query**
- [ ] افتح الملف ده من الريبو: `supabase/combined/all_migrations.sql`
- [ ] الزقه كله في الـ SQL Editor واضغط **Run**

الـ 10 migrations كلهم هيتنفذوا مرة واحدة بالترتيب الصح.

---

## 2) خدمة على Render

- [ ] <https://dashboard.render.com> → **New → Blueprint**
- [ ] وصّل حساب GitHub واختار ريبو `Online-coaching`
- [ ] Render هيقرأ `render.yaml` لوحده — اضغط **Apply**

> **ملاحظة:** أول deploy هيفشل لأن الـ environment variables لسه فاضية. طبيعي — كمل الخطوة اللي بعدها.

---

## 3) Environment Variables على Render

من الخدمة → **Environment** tab → **Add Environment Variable**.

### مطلوبة (الأبلكيشن مش هيشتغل من غيرهم):

| المتغير | القيمة |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | من خطوة 1 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | من خطوة 1 |
| `SUPABASE_SERVICE_ROLE_KEY` | من خطوة 1 (سري) |
| `NEXT_PUBLIC_SITE_URL` | `https://<اسم-الخدمة>.onrender.com` |

### مستحسنة:

| المتغير | القيمة |
|---|---|
| `NEXT_PUBLIC_COACH_VODAFONE_NUMBER` | رقم فودافون كاش بتاعك (مثال: `+201001234567`) |
| `NEXT_PUBLIC_COACH_NAME` | اسمك (للتوقيع على رسايل واتساب) |

### اختيارية:

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` → CAPTCHA على `/apply` (لازم الاتنين مع بعض)
- `RESEND_API_KEY` + `EMAIL_FROM` → للإيميلات
- `NEXT_PUBLIC_SENTRY_DSN` + `SENTRY_DSN` → لتتبع الأخطاء
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` → analytics

احفظ → Render هيعمل redeploy لوحده.

---

## 4) ارجع لـ Supabase بعد أول deploy ناجح

بعد ما البناء ينجح وتاخد رابط الخدمة:

- [ ] **Authentication → URL Configuration**
  - **Site URL:** رابط Render بتاعك
  - **Redirect URLs:**
    - `https://<اسم-الخدمة>.onrender.com/**`
    - `http://localhost:3000/**` (للتطوير المحلي)

- [ ] ارجع Render → **Manual Deploy → Deploy latest commit** عشان `NEXT_PUBLIC_SITE_URL` يتحدّث في الـ build.

---

## 5) اعمل أول أدمن

من جهازك بعد `git clone` و `pnpm install`:

```bash
cp .env.local.example .env.local
# املأ الملف بنفس القيم اللي على Render
# بعدين:
ADMIN_EMAIL=you@example.com \
ADMIN_PASSWORD='كلمة-سر-قوية' \
ADMIN_FULL_NAME='اسمك' \
  pnpm db:bootstrap-admin
```

**أو** يدوي من Supabase Dashboard:
1. **Authentication → Users → Add user** (علّم Auto-confirm)
2. **Table editor → profiles** → عدّل `role` = `admin`

---

## 6) تحقّق إن كله شغال

- [ ] `https://<service>.onrender.com/` → الصفحة الرئيسية
- [ ] `https://<service>.onrender.com/api/health` → JSON `{"status":"ok"}`
- [ ] `/login` → سجّل دخول بالأدمن → المفروض يوديك `/admin/dashboard`

---

## 7) قبل ما تشارك الرابط مع عملاء حقيقيين

- [ ] الـ 10 migrations اتنفذوا
- [ ] أدمن متعمل (`/admin/dashboard` بيفتح)
- [ ] `NEXT_PUBLIC_SITE_URL` بيطابق الرابط الحقيقي
- [ ] Supabase redirect URLs محدّثة
- [ ] على الأقل **باكدج واحدة** متعملة من `/admin/packages`
- [ ] محتوى الصفحة الرئيسية متعدّل من `/admin/site-content`
- [ ] رقم فودافون كاش متحط
- [ ] جرّبت `/apply` وطلب وصل
- [ ] سجّلت دفعة تجريبية من `/admin/payments/new`

---

## ⚠️ تنبيهات الخطة المجانية

- **Render Free:** السيرفر بينام بعد 15 دقيقة سكون. أول طلب بعد النوم ~30 ثانية. بعدها طبيعي.
- **Supabase Free:** المشروع بيتوقف بعد أسبوع خمول كامل — افتحه مرة في الأسبوع.
- **ذاكرة 512 MB:** كافية للأبلكيشن الحالي، بس ماتضيفش مكتبات تقيلة (ffmpeg, puppeteer).

---

## مشاكل شائعة

- **الـ build بيفشل بـ `MODULE_NOT_FOUND`** → نسخة pnpm مختلفة. `render.yaml` بيستخدم `9.15.1`.
- **Login بيعمل redirect loop** → Supabase redirect URLs مش مضبوطة (ارجع خطوة 4).
- **`/admin/payments` فاضي** → migration 0010 ماتنفذش.
- **`/apply` كل الطلبات بتفشل بـ CAPTCHA error** → عندك site key من غير secret key (أو العكس). شيل الاتنين أو حطهم مع بعض.
