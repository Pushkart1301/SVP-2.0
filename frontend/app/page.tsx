"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import Link from "next/link";
import {
    ArrowRight, Calendar, Brain, TrendingUp, CheckCircle, XCircle,
    User, BookOpen, Upload, MapPin, Clock, BarChart3, Target
} from "lucide-react";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        // If user is already logged in, redirect to dashboard
        const token = localStorage.getItem("token");
        if (token) {
            router.push("/dashboard");
        }
    }, [router]);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header/Navbar */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-500 rounded-lg p-1.5">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-slate-900">Student Vacation Planner</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/auth/login">
                                <Button variant="outline" className="hidden sm:flex">Login</Button>
                            </Link>
                            <Link href="/auth/login">
                                <Button className="flex gap-2 items-center">
                                    Get Started <ArrowRight size={16} />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {/* Hero Section */}
                <div className="text-center mb-12 animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-medium border border-blue-200 mb-6">
                        🚀 AI-Powered Academic Assistant
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-6">
                        Master Your <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Attendance</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto mb-8">
                        Smart attendance tracking, AI-powered vacation planning, and personalized study recommendations—all in one place.
                    </p>
                    <Link href="/auth/login">
                        <Button className="h-12 px-8 text-lg shadow-lg hover:shadow-xl transition-all">
                            Start Tracking Free <ArrowRight className="ml-2" size={20} />
                        </Button>
                    </Link>
                </div>

                {/* Demo Dashboard Stats */}
                <div className="mb-12 animate-fade-in">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">See Your Progress at a Glance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <DemoStatCard
                            icon={CheckCircle}
                            value="124"
                            label="Lectures Attended"
                            color="green"
                        />
                        <DemoStatCard
                            icon={XCircle}
                            value="28"
                            label="Lectures Missed"
                            color="red"
                        />
                        <DemoStatCard
                            icon={BarChart3}
                            value="152"
                            label="Total Tracked"
                            color="purple"
                        />
                        <DemoStatCard
                            icon={Target}
                            value="81.6%"
                            label="Overall Percentage"
                            color="blue"
                        />
                    </div>
                </div>

                {/* Features Grid */}
                <div className="mb-12">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">Everything You Need to Succeed</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FeatureCard
                            icon={Calendar}
                            title="Smart Calendar"
                            description="Upload your semester calendar and let AI extract all the important dates automatically."
                            gradient="from-blue-500 to-cyan-500"
                        />
                        <FeatureCard
                            icon={BookOpen}
                            title="Subject Management"
                            description="Organize your subjects and set target attendance goals for each course."
                            gradient="from-purple-500 to-pink-500"
                        />
                        <FeatureCard
                            icon={Clock}
                            title="Timetable Mapping"
                            description="Map your weekly lecture schedule and track attendance automatically."
                            gradient="from-green-500 to-emerald-500"
                        />
                        <FeatureCard
                            icon={MapPin}
                            title="Vacation Planner"
                            description="AI suggests the best time to take breaks without affecting your attendance."
                            gradient="from-orange-500 to-red-500"
                        />
                        <FeatureCard
                            icon={Brain}
                            title="AI Study Plans"
                            description="Get personalized study recommendations based on your performance."
                            gradient="from-indigo-500 to-blue-500"
                        />
                        <FeatureCard
                            icon={TrendingUp}
                            title="Analytics & Insights"
                            description="Beautiful charts and graphs to track your academic progress over time."
                            gradient="from-teal-500 to-cyan-500"
                        />
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 sm:p-12 text-center text-white animate-fade-in">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Take Control?</h2>
                    <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        Join thousands of students who are already tracking their attendance and planning smarter vacations.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/auth/login">
                            <Button className="h-12 px-8 text-lg bg-white text-blue-600 hover:bg-green-500 hover:text-white">
                                Create Free Account
                            </Button>
                        </Link>
                        <Link href="/auth/login">
                            <Button variant="outline" className="h-12 px-8 text-lg bg-white text-blue-600 hover:bg-green-500 hover:text-white">
                                Login to Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-16 pt-8 border-t border-slate-200 text-center text-slate-600">
                    <p className="text-sm">© 2025 Student Vacation Planner. Built with ❤️ for students.</p>
                </div>
            </div>
        </div>
    );
}

type ColorType = 'green' | 'red' | 'purple' | 'blue';

interface DemoStatCardProps {
    icon: React.ComponentType<{ className?: string }>;
    value: string;
    label: string;
    color: ColorType;
}

function DemoStatCard({ icon: Icon, value, label, color }: DemoStatCardProps) {
    const colors: Record<ColorType, string> = {
        green: "bg-green-50 text-green-600 border-green-200",
        red: "bg-red-50 text-red-600 border-red-200",
        purple: "bg-purple-50 text-purple-600 border-purple-200",
        blue: "bg-blue-50 text-blue-600 border-blue-200"
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className={`p-3 rounded-full w-fit mx-auto mb-4 ${colors[color]}`}>
                <Icon className="w-8 h-8" />
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-1">{value}</div>
            <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">{label}</div>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, description, gradient }: any) {
    return (
        <div className="group bg-white p-6 rounded-2xl border border-slate-100 hover:border-blue-200 shadow-sm hover:shadow-xl transition-all duration-300">
            <div className={`p-3 rounded-xl w-fit mb-4 bg-gradient-to-br ${gradient} transform group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-600 leading-relaxed">{description}</p>
        </div>
    );
}
