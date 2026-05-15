# Next Pizza — мобильное приложение (Expo / React Native)

Это отдельная папка с минимальным **Expo**-проектом: приложение открывает ваш развёрнутый сайт во **WebView**. Так можно быстро выложить оболочку в Google Play, а контент править на сервере.

## Что сделать у себя на компьютере

1. Установите [Node.js](https://nodejs.org/) LTS.
2. В папке `mobile` выполните:
   - `npm install`
3. В файле `App.tsx` замените `SITE_URL` на адрес вашего сайта (например `https://ваш-проект.vercel.app`).
4. Запуск:
   - `npm run start`
   - на телефоне установите **Expo Go** и отсканируйте QR из терминала  
   - или `npm run android` при установленном Android Studio / эмуляторе.

## Путь к Google Play (кратко)

1. Зарегистрируйте аккаунт [Google Play Console](https://play.google.com/console) (разовый платёж).
2. Соберите **release APK/AAB** через [EAS Build](https://docs.expo.dev/build/introduction/) (`eas build -p android`).
3. Загрузите AAB в консоль, заполните описание, скриншоты, политику конфиденциальности.
4. Для публикации обычно нужен **политика приватности** (страница URL) и корректный `package` в `app.json`.

Подробные шаги Expo: официальная документация Expo + EAS.
