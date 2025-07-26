"use client";

import { api } from "@/../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { AdminDashboard } from "./AdminDashborad";
import { PegawaiDashboard } from "./PegawaiDashboard";

export default function DashboardPage() {
    const { isLoaded, isSignedIn } = useAuth();

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10">
            {isSignedIn ? <DashboardDisplayer /> : <p>Silakan login untuk mengakses halaman ini.</p>}
        </div>
    );
}

function DashboardDisplayer() {
    const me = useQuery(api.users.getMe);

    if (me === undefined) {
        return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }

    if (me?.role === 'admin') {
        return <><Notification /><AdminDashboard /></>;
    }

    if (me?.role === 'pegawai') {
        return <><Notification /><PegawaiDashboard /></>;
    }

    return <div>Peran tidak dikenali. Hubungi administrator.</div>;
}

function Notification() {
    const me = useQuery(api.users.getMe);

    const { permissionGranted, requestPermissionAndSaveToken } = usePushNotifications();

    const shouldShowNotificationPrompt = !permissionGranted && me?.role === 'pegawai';

    return (
        <>
            {shouldShowNotificationPrompt && (
                <Card className="mb-6 bg-yellow-50 border-yellow-200">
                    <CardHeader>
                        <CardTitle className="text-lg">Aktifkan Notifikasi Anda</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4 text-sm text-muted-foreground">
                            Dapatkan pemberitahuan penting seperti reminder kenaikan pangkat langsung di perangkat Anda.
                        </p>
                        <Button onClick={requestPermissionAndSaveToken}>Aktifkan Notifikasi</Button>
                    </CardContent>
                </Card>
            )}</>
    )
}