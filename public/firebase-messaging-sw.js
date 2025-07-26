importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: 'AIzaSyAobb3hUqqNxNPT5jRvnhTVJZsCD_y46Ss',
    authDomain: 'system-kepolisian.firebaseapp.com',
    projectId: 'system-kepolisian',
    storageBucket: 'system-kepolisian.firebasestorage.app',
    messagingSenderId: '393672829333',
    appId: '1:393672829333:web:d4ac305b7f74d8bfff6e9c',
    measurementId: 'G-B9HPX37TBJ',
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/favicon.ico',
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
