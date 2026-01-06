import clsx from "clsx";
import React from "react";
import { twMerge } from "tailwind-merge";

export function Button({ className, variant = "primary", size = "default", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" | "ghost" | "danger", size?: "default" | "sm" | "lg" }) {
    const variants = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm",
        outline: "border border-slate-200 hover:bg-slate-50 text-slate-700 bg-white",
        ghost: "hover:bg-slate-100 text-slate-600",
        danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
    };

    const sizes = {
        default: "px-4 py-2",
        sm: "px-3 py-1.5 text-sm",
        lg: "px-6 py-3 text-lg"
    };

    return (
        <button
            className={twMerge("rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center", variants[variant], sizes[size], className)}
            {...props}
        />
    )
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            className={twMerge("w-full bg-white border border-slate-200 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-slate-400 text-slate-900 shadow-sm", className)}
            {...props}
        />
    )
}

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={twMerge("bg-white border border-slate-100 rounded-2xl p-6 shadow-sm", className)} {...props}>
            {children}
        </div>
    )
}
