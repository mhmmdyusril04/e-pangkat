import { api } from '@/../convex/_generated/api';
import { requestNotificationPermission } from '@/lib/firebase';
import { useMutation } from 'convex/react';
import { useEffect, useState } from 'react';

export const usePushNotifications = () => {
    const [permissionGranted, setPermissionGranted] = useState(Notification.permission === 'granted');
    const saveToken = useMutation(api.notifications.saveFcmToken);

    useEffect(() => {
        const setup = async () => {
            if (Notification.permission === 'granted') {
                const token = await requestNotificationPermission();
                if (token) {
                    await saveToken({ token });
                }
            }
        };
        setup();
    }, [saveToken]);

    const requestPermissionAndSaveToken = async () => {
        const token = await requestNotificationPermission();
        if (token) {
            await saveToken({ token });
            setPermissionGranted(true);
            console.log('FCM Token saved to backend.');
        }
    };

    return { permissionGranted, requestPermissionAndSaveToken };
};
