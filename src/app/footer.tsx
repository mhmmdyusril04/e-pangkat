import Link from "next/link";

export function Footer() {
    return (
        <div className="h-40 bg-gray-100 mt-12 flex items-center">
            <div className="container mx-auto flex justify-center items-center gap-16">
                <div>System</div>

                <Link className="text-blue-900 hover:text-blue-500" href="/about">
                    About
                </Link>
            </div>
        </div>
    );
}