"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import clsx from "clsx";

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();

    if (pathname.includes("/auth")) return null;

    const links = [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/dashboard/calendar", label: "Attendance" },
        { href: "/dashboard/subjects", label: "Subjects" },
        { href: "/dashboard/schedule", label: "Timetable" },
        { href: "/dashboard/planner", label: "Plan Vacation" },
        { href: "/dashboard/contact", label: "Contact Us" },
    ];

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/auth/login");
    };

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 overflow-x-auto">
            <div className="px-4 h-16 flex items-center gap-4 min-w-max">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="bg-blue-500 rounded-lg p-1.5">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        </svg>
                    </div>
                    <span className="text-lg font-bold text-gray-900">VP</span>
                </Link>

                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={clsx(
                                "text-sm font-medium transition-colors relative py-5 px-2",
                                isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
                            )}
                        >
                            {link.label}
                            {isActive && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full" />
                            )}
                        </Link>
                    )
                })}

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors ml-auto"
                    title="Logout"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </nav>
    );
}
