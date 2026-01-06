"use client";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard>
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="pt-16">
                    {children}
                </div>
            </div>
        </AuthGuard>
    );
}
