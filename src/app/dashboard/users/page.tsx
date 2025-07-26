"use client";

import { api } from "@/../convex/_generated/api";
import { Doc } from "@/../convex/_generated/dataModel";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { columns, UserColumn } from "./column";

const formSchema = z.object({
    name: z.string().min(1, "Nama tidak boleh kosong"),
    nip: z.string().min(1, "NIP tidak boleh kosong"),
    pangkat: z.string().min(1, "Pangkat tidak boleh kosong"),
    golongan: z.string().min(1, "Golongan tidak boleh kosong"),
    tanggalLahir: z.string().min(1, "Tanggal lahir tidak boleh kosong"),
    tmtPangkat: z.string().min(1, "TMT Pangkat tidak boleh kosong"),
    pendidikan: z.enum(["S1", "S2", "S3"]),
    role: z.enum(["admin", "pegawai"]),
});

export default function UsersPage() {
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
            {isSignedIn ? <UsersPageContent /> : <p>Silakan login untuk mengakses halaman ini.</p>}
        </div>
    );
}

function UsersPageContent() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<Doc<"users"> | null>(null);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingUser, setDeletingUser] = useState<Doc<"users"> | null>(null);

    const data = useQuery(api.users.getPegawaiUsers);
    const updateUserMutation = useMutation(api.users.adminUpdatePegawaiData);
    const deleteUserMutation = useMutation(api.users.adminDeleteUser);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "", nip: "", pangkat: "", golongan: "",
            tanggalLahir: "", tmtPangkat: "", pendidikan: "S1", role: "pegawai",
        },
    });

    const openEditDialog = (user: Doc<"users">) => {
        setEditingUser(user);
        form.reset({
            name: user.name,
            nip: user.nip || '',
            pangkat: user.pangkat || '',
            golongan: user.golongan || '',
            tanggalLahir: user.tanggalLahir || '',
            tmtPangkat: user.tmtPangkat || '',
            pendidikan: user.pendidikan || 'S1',
            role: user.role,
        });
        setIsDialogOpen(true);
    };

    const handleDialogClose = () => {
        setIsDialogOpen(false);
        setEditingUser(null);
        form.reset();
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!editingUser) return;

        try {
            await updateUserMutation({
                userId: editingUser._id,
                ...values,
            });
            toast.success("Sukses", { description: "Data pengguna berhasil diperbarui." });
            handleDialogClose();
        } catch {
            toast.error("Gagal");
        }
    }

    const openDeleteDialog = (user: Doc<"users">) => {
        setDeletingUser(user);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteUser = async () => {
        if (!deletingUser) return;
        try {
            await deleteUserMutation({ userId: deletingUser._id });
            toast.success("Sukses", { description: "Pengguna telah dihapus." });
            setIsDeleteDialogOpen(false);
            setDeletingUser(null);
        } catch {
            toast.error("Gagal");
        }
    };

    const tableData: UserColumn[] | undefined = data?.map(u => ({
        ...u,
        openEditDialog,
        openDeleteDialog
    }));

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manajemen User & Data Kepegawaian</h1>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
                Untuk menambah atau menghapus pengguna, silakan lakukan melalui Dasbor Clerk Anda. Halaman ini digunakan untuk melengkapi data kepegawaian pengguna yang sudah ada.
            </p>

            <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleDialogClose()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Data User & Kepegawaian</DialogTitle>
                        <DialogDescription>
                            Lengkapi atau perbarui data untuk pengguna: <strong>{editingUser?.name}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField name="name" control={form.control} render={({ field }) => (<FormItem><FormLabel>Nama</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField name="nip" control={form.control} render={({ field }) => (<FormItem><FormLabel>NIP</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField name="pangkat" control={form.control} render={({ field }) => (<FormItem><FormLabel>Pangkat</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField name="golongan" control={form.control} render={({ field }) => (<FormItem><FormLabel>Golongan</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField name="tanggalLahir" control={form.control} render={({ field }) => (<FormItem><FormLabel>Tanggal Lahir</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField name="tmtPangkat" control={form.control} render={({ field }) => (<FormItem><FormLabel>TMT Pangkat</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField name="pendidikan" control={form.control} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Pendidikan</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="S1">S1</SelectItem>
                                            <SelectItem value="S2">S2</SelectItem>
                                            <SelectItem value="S3">S3</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField name="role" control={form.control} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="pegawai">Pegawai</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}</Button>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda benar-benar yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Aksi ini tidak dapat dibatalkan. Ini akan menghapus data pengguna <strong>{deletingUser?.name}</strong> secara permanen dari database aplikasi.
                            Pastikan Anda juga telah menghapus pengguna ini dari Dasbor Clerk untuk sinkronisasi penuh.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteUser}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Ya, Hapus Pengguna
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {data === undefined ? (
                <div className="flex items-center justify-center h-40">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                    <p className="ml-2">Memuat data pengguna...</p>
                </div>
            ) : (
                <DataTable columns={columns} data={tableData ?? []} />
            )}
        </>
    );
}
