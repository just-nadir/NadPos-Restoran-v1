# Active Context

## Joriy Fokus
Hozirda asosiy e'tibor tizimning barqarorligini ta'minlash, VPS serverda ishlashini nazorat qilish va yuzaga kelishi mumkin bo'lgan kichik xatoliklarni tuzatishga qaratilgan. "Memory Bank" tizimi endi loyihaning haqiqiy holatini aks ettirishi kerak.

## So'nggi O'zgarishlar
-   **Multi-Restoran Tizimi**: `Restaurant` entitysiga `access_key` qo'shildi, Serverda identifikatsiya qilish va POS uchun `Onboarding` jarayoni yaratildi.
-   **Cloud Admin Panel**: Restoranlarni yaratish, ID va Access Key olish uchun Dashboard va yangi sahifalar qo'shildi. `https://halboldi.uz` da ishga tushirildi.
-   **VPS Deploy**: `cloud-server` va `cloud-admin` VPS ga (`213.142.148.35`) muvaffaqiyatli joylandi. Nginx proxy va SSL sozlandi.
-   **Xatoliklar Tuzatildi**:
    -   `WaiterApp` dagi eski litsenziya kodi olib tashlandi.
    -   `SyncService` va POS ulanishi `https://halboldi.uz/api` ga o'tkazildi.
    -   Admin Dashboard API manzili to'g'irlandi.
    -   **Fix**: Admin Dashboard restoranlar ro'yxatida `key` ko'rinmaslik muammosi hal qilindi (`licenseKey` -> `accessKey`).
    -   **Waiter App**: Brauzerda ochilganda Onboarding ekranini avtomatik o'tkazib yuborish qo'shildi (`window.electron` tekshiruvi).
    -   **Sync Fix**: SQLite ga yozishda "Binding" xatosi tuzatildi (Obyektlarni tozalash va Stringga o'girish).




## Keyingi Qadamlar
1.  **Monitoring**: Tizimning VPS dagi ishlashini kuzatish.
2.  **Lokalizatsiya**: O'zbek tili tarjimalarini tekshirish va to'ldirish.
3.  **Hujjatlashtirish**: `memory-bank` fayllarini doimiy yangilab borish.

## Faol Qarorlar
-   **Cloud-First Sync**: POS endi o'zini tanitish (`verify`) va sinxronizatsiya uchun `access_key` headeridan foydalanadi.
-   **Production URL**: Barcha so'rovlar `https://halboldi.uz/api` orqali Nginx proxyga yo'naltiriladi.
-   **Barcha hujjatlar O'zbek tilida** yuritiladi.
