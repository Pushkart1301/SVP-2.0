import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#3B82F6",
                secondary: "#64748B",
                accent: "#8B5CF6",
                background: "#F8FAFC", // Changed from #0F172A to Slate-50
                surface: "#FFFFFF",    // Changed from #1E293B to White
                text: "#0F172A",       // Changed from #F8FAFC to Slate-900
                muted: "#94A3B8"
            },
            keyframes: {
                "fade-in": {
                    "0%": { opacity: "0", transform: "translateY(10px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" }
                }
            },
            animation: {
                "fade-in": "fade-in 0.5s ease-out forwards"
            }
        },
    },
    plugins: [],
};
export default config;
