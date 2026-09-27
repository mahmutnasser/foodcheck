# FoodCheck PWA

نسخة ويب/PWA بسيطة للموبايل، بدون APK وبدون دومين مدفوع.

## تشغيل سريع على الكمبيوتر
شغّل مجلد المشروع عبر أي static web server. مثال:
`python -m http.server 8080`
ثم افتح http://localhost:8080

> الكاميرا تحتاج HTTPS على الهاتف. GitHub Pages يوفر HTTPS تلقائيًا.

## نشر مجاني على GitHub Pages
1. أنشئ repository جديدًا باسم `foodcheck`.
2. ارفع ملفات هذا المجلد إلى الفرع `main`.
3. من Settings → Pages اختر Deploy from a branch، ثم `main` و `/root`.
4. سيظهر رابط مجاني على نمط `https://USERNAME.github.io/foodcheck/`.
5. افتح الرابط من Chrome على الهاتف.

## الخصوصية
سجل المنتجات والأعراض والإعدادات محفوظ في localStorage على نفس المتصفح.
بيانات المنتج الجديد تُطلب من Open Food Facts عند البحث.

## ملاحظة
التقييم إرشادي فقط. القواعد الحالية تبحث عن بعض محفزات الارتجاع/الغازات وتستخدم الدهون المشبعة كإشارة غذائية مرتبطة بهدف خفض LDL.
