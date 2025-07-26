"use client";

import { api } from "@/../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "convex/react";
import { Award, ChevronDown, ListChecks, User } from 'lucide-react';

export function PegawaiDashboard() {
    const me = useQuery(api.users.getMe);
    const myHistory = useQuery(api.riwayat.getMyPromotionHistory);
    const semuaDokumen = useQuery(api.dokumen.getAll);

    if (!me) {
        return <div>Memuat data profil...</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Selamat Datang, {me.name}!</h1>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><User /> Profil Saya</CardTitle>
                    <CardDescription>Informasi kepegawaian Anda yang terdaftar di sistem.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div><p className="font-semibold">NIP</p><p>{me.nip}</p></div>
                        <div><p className="font-semibold">Pangkat / Golongan</p><p>{me.pangkat} ({me.golongan})</p></div>
                        <div><p className="font-semibold">TMT Pangkat</p><p>{me.tmtPangkat}</p></div>
                        <div><p className="font-semibold">Pendidikan Terakhir</p><p>{me.pendidikan}</p></div>
                        <div><p className="font-semibold">Tanggal Lahir</p><p>{me.tanggalLahir}</p></div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Award /> Status Kenaikan Pangkat</CardTitle>
                    <CardDescription>Riwayat dan detail status proses kenaikan pangkat Anda.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {myHistory === undefined ? (
                        <p>Memuat riwayat...</p>
                    ) : myHistory.length === 0 ? (
                        <p>Belum ada riwayat kenaikan pangkat yang tercatat untuk Anda.</p>
                    ) : (
                        myHistory.map((item) => {
                            const totalDokumen = item.dokumenTerkumpul.length;
                            const dokumenDisetujui = item.dokumenTerkumpul.filter(d => d.disetujui).length;
                            const progressValue = totalDokumen > 0 ? (dokumenDisetujui / totalDokumen) * 100 : 0;

                            return (
                                <Collapsible key={item._id} className="border rounded-lg">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4">
                                        <div>
                                            <p className="font-semibold">Periode {item.periodeNotifikasi}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Pangkat Awal: {item.pangkatSaatNotifikasi} ({item.golonganSaatNotifikasi})
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Progress value={progressValue} className="w-32 h-2" />
                                                <span className="text-xs font-medium">{dokumenDisetujui}/{totalDokumen} Dokumen</span>
                                            </div>
                                        </div>
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" size="sm" className="w-full sm:w-auto self-end sm:self-center">
                                                Lihat Detail <ChevronDown className="h-4 w-4 ml-1" />
                                            </Button>
                                        </CollapsibleTrigger>
                                    </div>
                                    <CollapsibleContent>
                                        <div className="p-4 border-t bg-muted/50">
                                            <h4 className="font-semibold mb-2">Checklist Dokumen:</h4>
                                            <div className="space-y-2">
                                                {item.dokumenTerkumpul.map(doc => (
                                                    <div key={doc.dokumenId} className="flex items-center">
                                                        <Checkbox id={doc.dokumenId} checked={doc.disetujui} disabled className="mr-2" />
                                                        <label htmlFor={doc.dokumenId} className="text-sm">{doc.namaDokumen}</label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            )
                        })
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ListChecks /> Daftar Dokumen Persyaratan</CardTitle>
                    <CardDescription>Daftar dokumen umum yang perlu disiapkan untuk kenaikan pangkat.</CardDescription>
                </CardHeader>
                <CardContent>
                    {myHistory === undefined || semuaDokumen === undefined ? (
                        <p>Memuat informasi...</p>
                    ) : myHistory.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-2 text-sm">
                            {semuaDokumen.map(doc => (
                                <li key={doc._id}>{doc.namaDokumen}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-center text-muted-foreground p-4">
                            Saat ini belum ada proses kenaikan pangkat yang aktif untuk Anda.
                            <br />
                            Sistem akan memberitahu Anda 2 bulan sebelum jadwal kenaikan pangkat berikutnya.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}