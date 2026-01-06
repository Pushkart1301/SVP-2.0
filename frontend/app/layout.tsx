import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Student Vacation Planner 2.0",
    description: "Plan your attendance and vacations smartly.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet' />
            </head>
            <body className={`${inter.className} min-h-screen bg-background text-text`}>
                {children}
            </body>
        </html>
    );
}
