"use client";

import { api } from "@/../convex/_generated/api";
import { Doc, Id } from "@/../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/components/ui/use-toast";
import { ColumnDef } from "@tanstack/react-table";
import { useMutation } from "convex/react";
import { CheckCircle, ChevronDown, XCircle } from "lucide-react";

type RiwayatColumn = Doc<"riwayatKenaikanPangkat"> & {
    namaPegawai: string;
    nipPegawai: string;
};

function Checklist({ riwayat }: { riwayat: RiwayatColumn }) {
    const updateStatus = useMutation(api.persyaratan.updateDokumenStatus);
    const { toast } = useToast();

    const handleCheck = (dokumenId: Id<"persyaratanDokumen">, checked: boolean) => {
        updateStatus({ riwayatId: riwayat._id, dokumenId, disetujui: checked })
            .then(() => toast.success("Sukses", { description: "Status dokumen diperbarui." }))
            .catch(e => toast.error("Gagal", { description: e.message }));
    };

    return (
        <div className="p-4 bg-muted space-y-2">
            <h4 className="font-semibold">Detail Dokumen Persyaratan:</h4>
            {riwayat.dokumenTerkumpul.map(doc => (
                <div key={doc.dokumenId} className="flex items-center space-x-2">
                    <Checkbox
                        id={doc.dokumenId}
                        checked={doc.disetujui}
                        onCheckedChange={(checked) => handleCheck(doc.dokumenId, checked as boolean)}
                    />
                    <label htmlFor={doc.dokumenId} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {doc.namaDokumen}
                    </label>
                </div>
            ))}
        </div>
    );
}

export const columns: ColumnDef<RiwayatColumn>[] = [
    { accessorKey: "namaPegawai", header: "Nama Pegawai" },
    {
        accessorKey: "nipPegawai",
        header: "NIP",
        meta: {
            className: "hidden md:table-cell"
        }
    },
    {
        accessorKey: "periodeNotifikasi",
        header: "Periode",
        meta: {
            className: "hidden sm:table-cell"
        }
    },
    {
        header: "Status",
        cell: ({ row }) => {
            const riwayat = row.original;
            const totalDokumen = riwayat.dokumenTerkumpul.length;
            const dokumenDisetujui = riwayat.dokumenTerkumpul.filter(d => d.disetujui).length;

            const isCompleted = totalDokumen > 0 && dokumenDisetujui === totalDokumen;

            return (
                <div className="flex items-center gap-2">
                    {isCompleted ? <CheckCircle className="text-green-500" /> : <XCircle className="text-red-500" />}
                    <span>{dokumenDisetujui} / {totalDokumen} Dokumen</span>
                </div>
            );
        }
    },
    {
        id: "actions",
        cell: ({ row }) => (
            <Collapsible>
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                        Kelola <ChevronDown className="h-4 w-4" />
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <Checklist riwayat={row.original} />
                </CollapsibleContent>
            </Collapsible>
        )
    }
];