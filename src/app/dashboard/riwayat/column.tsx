"use client";

import { Id } from "@/../convex/_generated/dataModel";
import { ColumnDef } from "@tanstack/react-table";

type RiwayatColumn = {
    _id: Id<"riwayatKenaikanPangkat">;
    namaPegawai: string;
    nipPegawai: string;
    periodeNotifikasi: string;
    tanggalNotifikasiDikirim: string;
    golonganSaatNotifikasi: string;
    pangkatSaatNotifikasi: string;
};

export const columns: ColumnDef<RiwayatColumn>[] = [
    { accessorKey: "namaPegawai", header: "Nama Pegawai" },
    {
        accessorKey: "nipPegawai",
        header: "NIP",
        meta: {
            className: "hidden md:table-cell",
        },
    },
    {
        accessorKey: "periodeNotifikasi",
        header: "Periode",
        meta: {
            className: "hidden sm:table-cell",
        },
    },
    {
        accessorKey: "golonganSaatNotifikasi",
        header: "Golongan Awal",
        meta: {
            className: "hidden lg:table-cell",
        },
    },
    {
        accessorKey: "pangkatSaatNotifikasi",
        header: "Pangkat Awal",
        meta: {
            className: "hidden lg:table-cell",
        },
    },
    {
        accessorKey: "tanggalNotifikasiDikirim",
        header: "Tgl Notifikasi",
        cell: ({ row }) => {
            return new Date(row.original.tanggalNotifikasiDikirim).toLocaleDateString("id-ID");
        }
    },
];