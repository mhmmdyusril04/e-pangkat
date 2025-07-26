"use client";

import { api } from "@/../convex/_generated/api";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { useQuery } from "convex/react";
import { HardHat, History, LayoutDashboard, Star } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
    { name: "Manajemen User", href: "/dashboard/users", icon: HardHat },
    { name: "Status Persyaratan", href: "/dashboard/persyaratan", icon: Star },
    { name: "Riwayat Notifikasi", href: "/dashboard/riwayat", icon: History },
];

export function SideNav() {
    const pathname = usePathname();
    const me = useQuery(api.users.getMe);

    return (
        <nav className="grid items-start text-sm font-medium">
            <Link href="/dashboard">
                <Button
                    variant="ghost"
                    className={clsx("w-full justify-start gap-2", {
                        "bg-muted text-primary": pathname === "/dashboard",
                    })}
                >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                </Button>
            </Link>

            {me?.role === 'admin' && (
                <>
                    {links.map((link) => (
                        <Link key={link.name} href={link.href}>
                            <Button
                                variant="ghost"
                                className={clsx("w-full justify-start gap-2", {
                                    "bg-muted text-primary": pathname.startsWith(link.href),
                                })}
                            >
                                <link.icon className="h-4 w-4" />
                                {link.name}
                            </Button>
                        </Link>
                    ))}
                </>
            )}
        </nav>
    );
}