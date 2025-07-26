"use client";

import { Doc } from "@/../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, MoreHorizontal, Trash2 } from "lucide-react";
import Image from "next/image";

export type UserColumn = Doc<"users"> & {
  openEditDialog: (user: Doc<"users">) => void;
  openDeleteDialog: (user: Doc<"users">) => void;
};

const isDataLengkap = (user: Doc<"users">) => {
  return user.pangkat && user.golongan && user.tmtPangkat;
};

export const columns: ColumnDef<UserColumn>[] = [
  {
    accessorKey: "image",
    header: "Avatar",
    cell: ({ row }) => (
      <Image
        src={row.original.image || ""}
        alt={row.original.name}
        width={40}
        height={40}
        className="rounded-full"
      />
    ),
  },
  {
    accessorKey: "name",
    header: "Nama",
    cell: ({ row }) => {
      const user = row.original;
      const lengkap = isDataLengkap(user);
      return (
        <div className="flex items-center gap-2">
          {user.name}
          {!lengkap && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Data kepegawaian belum lengkap.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "nip",
    header: "NIP",
    meta: {
      className: "hidden sm:table-cell",
    },
  },
  {
    accessorKey: "pangkat",
    header: "Pangkat",
    meta: {
      className: "hidden md:table-cell",
    },
  },
  {
    accessorKey: "golongan",
    header: "Golongan",
    meta: {
      className: "hidden md:table-cell",
    },
  },
  {
    accessorKey: "tmtPangkat",
    header: "TMT Pangkat",
    meta: {
      className: "hidden lg:table-cell",
    },
  },
  {
    accessorKey: "pendidikan",
    header: "Pendidikan",
    meta: {
      className: "hidden lg:table-cell",
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    meta: {
      className: "hidden sm:table-cell",
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      const lengkap = isDataLengkap(user);

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Buka menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => user.openEditDialog(user)}>
              {lengkap ? "Edit Data" : "Lengkapi Data"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={() => user.openDeleteDialog(user)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
