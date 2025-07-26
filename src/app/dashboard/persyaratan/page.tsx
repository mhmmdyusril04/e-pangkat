"use client";

import { api } from "@/../convex/_generated/api";
import { Doc } from "@/../convex/_generated/dataModel";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { columns } from "./column";

const formSchema = z.object({
    namaDokumen: z.string().min(3, { message: "Nama dokumen minimal 3 karakter." }),
    deskripsi: z.string().optional(),
});


function ManajemenDokumen() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingDokumen, setDeletingDokumen] = useState<Doc<"persyaratanDokumen"> | null>(null);

    const { toast } = useToast();
    const dokumen = useQuery(api.dokumen.getAll);
    const createDokumen = useMutation(api.dokumen.createDokumen);
    const deleteDokumen = useMutation(api.dokumen.deleteDokumen);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { namaDokumen: "", deskripsi: "" },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await createDokumen(values);
            toast.success("Sukses", { description: "Dokumen persyaratan baru telah ditambahkan." });
            form.reset();
            setIsCreateDialogOpen(false);
        } catch {
            toast.error("Gagal");
        }
    }

    const handleDelete = async () => {
        if (!deletingDokumen) return;
        try {
            await deleteDokumen({ id: deletingDokumen._id });
            toast.success("Sukses", { description: `Dokumen "${deletingDokumen.namaDokumen}" telah dihapus.` });
            setDeletingDokumen(null);
            setIsDeleteDialogOpen(false);
        } catch {
            toast.error("Gagal menghapus dokumen");
        }
    }

    return (
        <Card className="mb-8">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <CardTitle>Manajemen Dokumen Persyaratan</CardTitle>
                    <CardDescription>Tambah atau hapus daftar master dokumen yang diperlukan untuk kenaikan pangkat.</CardDescription>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button><PlusCircle className="mr-2 h-4 w-4" /> Tambah Dokumen</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Tambah Dokumen Persyaratan Baru</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField name="namaDokumen" control={form.control} render={({ field }) => (<FormItem><FormLabel>Nama Dokumen</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField name="deskripsi" control={form.control} render={({ field }) => (<FormItem><FormLabel>Deskripsi (Opsional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <Button type="submit" disabled={form.formState.isSubmitting}>Simpan</Button>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama Dokumen</TableHead>
                                <TableHead>Deskripsi</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dokumen?.map((doc) => (
                                <TableRow key={doc._id}>
                                    <TableCell>{doc.namaDokumen}</TableCell>
                                    <TableCell>{doc.deskripsi || "-"}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="destructive" size="sm" onClick={() => { setDeletingDokumen(doc); setIsDeleteDialogOpen(true); }}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                {dokumen && dokumen.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-4">Belum ada dokumen persyaratan.</p>
                )}
            </CardContent>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Konfirmasi Penghapusan</AlertDialogTitle>
                        <AlertDialogDescription>
                            Anda yakin ingin menghapus dokumen <strong>{deletingDokumen?.namaDokumen}</strong>? Aksi ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Hapus</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}

function StatusPegawaiContent() {
    const daftarStatus = useQuery(api.persyaratan.getDaftarStatus);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Status Pengumpulan Persyaratan Pegawai</CardTitle>
                <CardDescription>Kelola dan lihat progres pengumpulan dokumen dari setiap pegawai yang sedang dalam proses kenaikan pangkat.</CardDescription>
            </CardHeader>
            <CardContent>
                {daftarStatus === undefined ? (
                    <div className="flex items-center justify-center h-40">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                        <p className="ml-2">Memuat data status...</p>
                    </div>
                ) : (
                    <DataTable columns={columns} data={daftarStatus} />
                )}
            </CardContent>
        </Card>
    );
}


export default function PersyaratanPage() {
    const { isLoaded, isSignedIn } = useAuth();

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 space-y-8">
            {isSignedIn ? (
                <>
                    <ManajemenDokumen />
                    <StatusPegawaiContent />
                </>
            ) : (
                <p>Silakan login untuk mengakses halaman ini.</p>
            )}
        </div>
    );
}