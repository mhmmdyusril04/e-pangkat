"use client";

import { api } from "@/../convex/_generated/api";
import { DataTable } from "@/components/ui/data-table";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { columns } from "./column";

export default function RiwayatPage() {
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
            {isSignedIn ? <RiwayatPageContent /> : <p>Silakan login untuk mengakses halaman ini.</p>}
        </div>
    );
}

function RiwayatPageContent() {
    const riwayat = useQuery(api.riwayat.getRiwayat);

    return (
        <>
            <h1 className="text-3xl font-bold mb-6">Riwayat Notifikasi Kenaikan Pangkat</h1>
            {riwayat === undefined ? (
                <div className="flex items-center justify-center h-40">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                    <p className="ml-2">Memuat riwayat...</p>
                </div>
            ) : (
                <DataTable columns={columns} data={riwayat} />
            )}
        </>
    );
}