'use node';

import { v } from 'convex/values';
import { App, cert, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { api } from './_generated/api';
import { internalAction } from './_generated/server';

let firebaseApp: App | undefined;

function getFirebaseApp() {
    if (firebaseApp) return firebaseApp;
    const serviceAccountJson = process.env.FIREBASE_ADMIN_CONFIG;
    if (!serviceAccountJson) throw new Error('Environment variable FIREBASE_ADMIN_CONFIG is not set.');
    const serviceAccount = JSON.parse(serviceAccountJson);
    firebaseApp = initializeApp({ credential: cert(serviceAccount) });
    return firebaseApp;
}

export const sendPushNotification = internalAction({
    args: {
        userId: v.id('users'),
        title: v.string(),
        body: v.string(),
    },
    handler: async (ctx, { userId, title, body }) => {
        try {
            getFirebaseApp();
            const user = await ctx.runQuery(api.users.getUserById, { userId });
            if (!user || !user.fcmToken) {
                console.log(`User ${userId} tidak memiliki FCM token. Notifikasi dibatalkan.`);
                return;
            }
            const message = {
                token: user.fcmToken,
                notification: { title, body },
                webpush: { fcmOptions: { link: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard` } },
            };
            await getMessaging().send(message);
            console.log(`Notifikasi berhasil dikirim ke user ${userId}`);
        } catch (error) {
            console.error('Gagal mengirim notifikasi:', error);
        }
    },
});
