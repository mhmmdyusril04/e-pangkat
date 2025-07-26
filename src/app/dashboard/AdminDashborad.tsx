import { api } from "@/../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { History, Users } from "lucide-react";
import Link from "next/link";

export function AdminDashboard() {
    const allUsers = useQuery(api.users.getPegawaiUsers);
    const allRiwayat = useQuery(api.riwayat.getRiwayat);


    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Pegawai</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{allUsers?.length ?? '...'}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Notifikasi Terkirim</CardTitle>
                        <History className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{allRiwayat?.length ?? '...'}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader><CardTitle>Akses Cepat</CardTitle></CardHeader>
                    <CardContent className="flex flex-col space-y-2">
                        <Button asChild variant="outline"><Link href="/dashboard/users">Manajemen Pegawai</Link></Button>
                        <Button asChild variant="outline"><Link href="/dashboard/persyaratan">Status Persyaratan</Link></Button>
                        <Button asChild variant="outline"><Link href="/dashboard/riwayat">Riwayat Notifikasi</Link></Button>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}