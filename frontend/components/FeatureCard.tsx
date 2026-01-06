"use client";

import React from "react";
import { ArrowRight, LucideIcon } from "lucide-react";

interface FeatureCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    emoji: string;
    gradient: string;
    onClick: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
    icon: Icon,
    title,
    description,
    emoji,
    gradient,
    onClick
}) => {
    // Map gradient names to tailwind classes if needed, or use them directly if defined in config
    // Assuming the user wants to use the string as a class or looking for specific mapping

    const getGradientClasses = (g: string) => {
        switch (g) {
            case 'gradient-blue': return 'from-blue-500 to-blue-600';
            case 'gradient-cyan': return 'from-cyan-500 to-teal-500';
            case 'gradient-green': return 'from-green-500 to-emerald-500';
            case 'gradient-pink': return 'from-pink-500 to-rose-500';
            default: return 'from-blue-500 to-indigo-500';
        }
    };

    const gradientClass = getGradientClasses(gradient);

    return (
        <div
            onClick={onClick}
            className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden ring-1 ring-slate-100/50"
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className="text-2xl bg-gray-50 rounded-full w-10 h-10 flex items-center justify-center border border-gray-100">
                    {emoji}
                </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {title}
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
                {description}
            </p>

            <div className="flex items-center text-blue-600 font-medium text-sm opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                Get Started <ArrowRight className="w-4 h-4 ml-1" />
            </div>
        </div>
    );
};

export default FeatureCard;
