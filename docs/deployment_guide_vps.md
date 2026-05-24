# دليلك الشامل لرفع مشروع Cafe Services على أي سيرفر (VPS) بنظام Ubuntu

أهلاً بك! إذا كنت قد حجزت للتو سيرفر (VPS) بنظام Ubuntu وتريد رفع مشروع **Cafe Services** ليكون متاحاً للجميع على الإنترنت، فأنت في المكان الصحيح.

سنقوم هنا بتشغيل المشروع محلياً (Bare-metal) لضمان أقصى أداء ولتكون على دراية تامة بكل ما يجري خلف الكواليس. جهز كوب قهوتك، ولنبدأ!

---

## قبل أن نبدأ، ماذا نحتاج؟

لضمان سير العملية بسلاسة، تأكد من وجود التالي:

- سيرفر VPS: يعمل بنظام Ubuntu (يفضل إصدار 22.04 أو 24.04).
- بيانات الدخول للسيرفر: عنوان الـ IP وكلمة المرور الخاصة بمستخدم الـ root.
- دومين (نطاق): مثل yourdomain.com موجه إلى IP السيرفر الخاص بك.

---

## الخطوة الأولى: الدخول إلى السيرفر

افتح موجه الأوامر (Terminal إذا كنت تستخدم ماك/لينكس، أو CMD/PowerShell في ويندوز)، واكتب الأمر التالي للدخول للسيرفر:

```bash
ssh root@YOUR_SERVER_IP
```

(لا تنسَ تغيير YOUR_SERVER_IP برقم الـ IP الفعلي لسيرفرك).

---

## الخطوة الثانية: تجهيز البيئة وتثبيت البرامج

أول قاعدة في إدارة السيرفرات هي تحديث النظام:

```bash
sudo apt update && sudo apt upgrade -y
```

الآن، سنقوم بتثبيت Git، Nginx، أدوات SSL، و PostgreSQL:

```bash
sudo apt install git nginx certbot python3-certbot-nginx postgresql postgresql-contrib -y
```

المشروع مبني بـ Node.js، لذا سنقوم بتثبيت أحدث إصدار مستقر (24.x):

```bash
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs
```

وأخيراً، سنثبت أداة PM2 التي ستتكفل بإبقاء موقعنا يعمل طوال الوقت:

```bash
sudo npm install -g pm2
```

---

## الخطوة الثالثة: إنشاء قاعدة البيانات

سندخل إلى لوحة تحكم PostgreSQL لإنشاء قاعدة البيانات ومستخدم خاص بها:

```bash
sudo -u postgres psql
```

نفذ الأوامر التالية بالترتيب (تأكد من اختيار كلمة مرور قوية):

```sql
CREATE DATABASE cafe_db;
CREATE USER cafe_user WITH ENCRYPTED PASSWORD 'YOUR_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE cafe_db TO cafe_user;
ALTER DATABASE cafe_db OWNER TO cafe_user;
\q
```

---

## الخطوة الرابعة: سحب كود المشروع

سنقوم بوضع كود المشروع في المجلد الافتراضي لمواقع الويب:

```bash
cd /var/www
git clone https://github.com/YOUR_USERNAME/cafe-services.git cafe-services
cd cafe-services
```

يحتوي المشروع على ميزة رفع ملفات، لذا يجب التأكد من إنشاء المجلد الخاص بها وإعطائه الصلاحيات:

```bash
mkdir -p public/uploads
chmod 777 public/uploads
```

---

## الخطوة الخامسة: إعداد ملفات البيئة والمكتبات

نقوم الآن بإنشاء ملف `.env` ووضع الإعدادات بداخله:
```bash
nano .env
```

ألصق الكود التالي وتأكد من مطابقة كلمة المرور:
```env
DATABASE_URL="postgresql://cafe_user:YOUR_PASSWORD@localhost:5432/cafe_db?schema=public"
NODE_ENV="production"
PORT=3000
```
(لحفظ الملف في محرّر Nano: اضغط Ctrl+X، ثم Y، ثم Enter).

بعدها نقوم بتثبيت الحزم:
```bash
npm install
```

---

## الخطوة السادسة: تجهيز قاعدة البيانات وتوليد البناء (Build)

لنهيئ الجداول عبر Prisma ثم نبني المشروع للإنتاج:

```bash
npx prisma generate
npx prisma migrate deploy
npm run build
```

---

## الخطوة السابعة: تشغيل المشروع عبر PM2

لكي لا يتوقف الموقع عند إغلاق الشاشة، سنشغله عبر أداة PM2:

```bash
pm2 start npm --name "cafe-services" -- start
```

ولضمان بدء تشغيله تلقائياً مع إعادة تشغيل السيرفر:
```bash
pm2 startup
# انسخ الأمر الذي سيظهر لك في الشاشة ثم الصقه لتفعيله
pm2 save
```

---

## الخطوة الثامنة: ربط الدومين بالموقع باستخدام Nginx

المشروع الآن يعمل على البورت 3000. سنجعل Nginx يوجه زوار الدومين (عبر بورت 80) إلى هذا المشروع.

افتح ملف إعدادات جديد:
```bash
sudo nano /etc/nginx/sites-available/cafe-services
```

ألصق الإعدادات التالية (مع تغيير yourdomain.com برابط موقعك الحقيقي):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # هذه الإعدادات ضرورية لاستقرار الاتصال اللحظي (SSE)
        proxy_buffering off;
        proxy_read_timeout 86400;
    }
}
```

قم بتفعيلها ثم أعد تشغيل Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/cafe-services /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## الخطوة الأخيرة: تأمين الموقع بشهادة SSL (HTTPS)

استخدم أداة Certbot المجانية لإضافة قفل الأمان لموقعك:

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

أجب عن بعض الأسئلة البسيطة وسيتم تأمين موقعك بل وتجديد الشهادة تلقائياً.

مبارك! مشروعك الآن يعمل بكفاءة وأمان 🚀

---
---

## 🌟 قسم إضافي: كيفية تشغيل نسخة أخرى من المشروع على نفس السيرفر؟

إذا أردت لاحقاً افتتاح فرع جديد ووددت تشغيل نسخة منفصلة من النظام على **نفس السيرفر** دون التأثير على النسخة الأولى، فالأمر بسيط جداً. إليك ما ستحتاج لفعله:

1. **إنشاء قاعدة بيانات جديدة**: ادخل لـ `psql` وأنشئ قاعدة بيانات جديدة (مثلاً `cafe_db_2`) وأعطِ الصلاحيات لنفس المستخدم `cafe_user`.
2. **سحب الكود في مجلد مختلف**: اسحب كود المشروع إلى مجلد جديد كلياً:
   ```bash
   cd /var/www
   git clone https://github.com/YOUR_USERNAME/cafe-services.git cafe-branch2
   ```
3. **تغيير البورت في `.env`**: في المجلد الجديد، قم بإنشاء ملف `.env` واجعله يتصل بالقاعدة الجديدة `cafe_db_2` واجعل الـ `PORT=3001` بدلاً من 3000.
4. **تسمية مختلفة في PM2**: بعد إجراء خطوات الـ `npm install` والـ `build`، قم بتشغيل النسخة عبر PM2 باسم جديد لتجنب التداخل:
   ```bash
   pm2 start npm --name "cafe-branch2" -- start
   ```
5. **إعداد Nginx للدومين الجديد**: أنشئ ملفاً جديداً في `/etc/nginx/sites-available/` للدومين الفرعي الجديد (مثلاً `branch2.yourdomain.com`)، واجعل أمر `proxy_pass` يوجه إلى `http://localhost:3001` بدلاً من 3000. فعّله ثم أمّنه بالـ SSL بنفس الطريقة السابقة.
