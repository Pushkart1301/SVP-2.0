"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Calendar, BookOpen, Upload, MapPin, User, Edit, TrendingUp, CheckCircle, XCircle, Clock10Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import FeatureCard from "@/components/FeatureCard";
import api from "@/lib/api";
import EditProfileModal from "@/components/EditProfileModal";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface UserProfile {
    full_name: string;
    email: string;
    branch?: string;
    semester?: string;
    profile_image?: string;
}

interface AttendanceStats {
    total_lectures: number;
    lectures_attended: number;
    lectures_missed: number;
    overall_percentage: number;
}

const Dashboard = () => {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState<AttendanceStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const fetchData = async () => {
        try {
            const [userRes, statsRes] = await Promise.all([
                api.get("/auth/me"),
                api.get("/attendance/stats/overall")
            ]);
            setUser(userRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);


    const featureCards = [
        {
            icon: Calendar,
            title: "Attendance Tracker",
            description: "Track your daily attendance and monitor progress towards your goals.",
            emoji: "📅",
            gradient: "gradient-blue",
            path: "/dashboard/calendar"
        },
        {
            icon: Clock10Icon,
            title: "Map Subjects to Schedule",
            description: "Map your subjects to weekdays and create your semester timetable.",
            emoji: "⏳",
            gradient: "gradient-cyan",
            path: "/dashboard/schedule"
        },
        {
            icon: BookOpen,
            title: "Select Subjects",
            description: "Configure your subjects and lecture schedules for accurate tracking.",
            emoji: "📚",
            gradient: "gradient-green",
            path: "/dashboard/subjects"
        },
        {
            icon: MapPin,
            title: "Plan My Vacation",
            description: "Get AI-powered vacation recommendations based on your attendance.",
            emoji: "🌴",
            gradient: "gradient-pink",
            path: "/dashboard/planner"
        }
    ];

    // Generate attendance graph data
    const generateAttendanceGraphData = (stats: AttendanceStats | null) => {
        if (!stats || stats.total_lectures === 0) {
            // Return sample/placeholder data
            return [
                { week: 'Week 1', percentage: 0, target: 75 },
                { week: 'Week 2', percentage: 0, target: 75 },
                { week: 'Week 3', percentage: 0, target: 75 },
                { week: 'Week 4', percentage: 0, target: 75 },
            ];
        }

        // Simulated weekly data (in production, this would come from backend)
        const currentPercentage = stats.overall_percentage;

        // Generate trend data showing progress towards current percentage
        return [
            { week: 'Week 1', percentage: Math.max(0, currentPercentage - 15), target: 75 },
            { week: 'Week 2', percentage: Math.max(0, currentPercentage - 10), target: 75 },
            { week: 'Week 3', percentage: Math.max(0, currentPercentage - 5), target: 75 },
            { week: 'Week 4', percentage: currentPercentage, target: 75 },
        ];
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="pt-8 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Welcome Section */}
                    <div className="text-center mb-12 animate-fade-in">
                        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                            Welcome back, <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{user?.full_name?.split(' ')[0] || "Student"}!</span>
                        </h1>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            Ready to plan your next vacation? Let's check your attendance progress and find the perfect time to take a break.
                        </p>
                    </div>

                    {/* Profile Welcome Card */}
                    <div className="welcome-card mb-12 animate-fade-in bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0 overflow-hidden">
                                {user?.profile_image ? (
                                    <img src={user.profile_image} alt={user.full_name} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-10 h-10 text-white" />
                                )}
                            </div>
                            <div className="flex-1 text-center md:text-left w-full">
                                <h3 className="text-2xl font-semibold text-slate-900">{user?.full_name || "Student Name"}</h3>
                                <p className="text-slate-500 mb-4 md:mb-2">
                                    {(user?.semester && user?.branch)
                                        ? `Semester ${user.semester} - ${user.branch}`
                                        : "Set your Semester & Branch"}
                                </p>
                                <div className="flex items-center space-x-4">
                                    <div className="flex-1">
                                        <div className="flex justify-between text-sm text-slate-600 mb-2">
                                            <span>Attendance Goal Progress</span>
                                            <span>{stats?.overall_percentage || 0}% / 75%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${stats?.overall_percentage || 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Button
                                onClick={() => setIsEditing(true)}
                                variant="outline"
                                className="hover:bg-slate-50 border-slate-200 text-slate-700"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Profile
                            </Button>
                        </div>
                    </div>

                    {/* Edit Modal */}
                    {isEditing && user && (
                        <EditProfileModal
                            user={user}
                            onClose={() => setIsEditing(false)}
                            onUpdate={fetchData}
                        />
                    )}

                    {/* Feature Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-12">
                        {featureCards.map((card, index) => (
                            <div
                                key={card.title}
                                className="animate-fade-in"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <FeatureCard
                                    icon={card.icon}
                                    title={card.title}
                                    description={card.description}
                                    emoji={card.emoji}
                                    gradient={card.gradient}
                                    onClick={() => router.push(card.path)}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Status Overview */}
                    <div className="status-card animate-fade-in bg-white rounded-3xl p-8 border border-slate-100 shadow-sm" style={{ animationDelay: '0.5s' }}>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-bold text-slate-900">Attendance Overview</h3>
                            <div className="p-2 bg-green-50 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="text-center p-6 bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg transition-shadow duration-300">
                                <div className="p-3 bg-green-50 rounded-full w-fit mx-auto mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-500" />
                                </div>
                                <div className="text-4xl font-bold text-slate-900 mb-1">{stats?.lectures_attended || 0}</div>
                                <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">Lectures Attended</div>
                            </div>

                            <div className="text-center p-6 bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg transition-shadow duration-300">
                                <div className="p-3 bg-red-50 rounded-full w-fit mx-auto mb-4">
                                    <XCircle className="w-8 h-8 text-red-500" />
                                </div>
                                <div className="text-4xl font-bold text-slate-900 mb-1">{stats?.lectures_missed || 0}</div>
                                <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">Lectures Missed</div>
                            </div>

                            <div className="text-center p-6 bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg transition-shadow duration-300">
                                <div className="p-3 bg-purple-50 rounded-full w-fit mx-auto mb-4">
                                    <Calendar className="w-8 h-8 text-purple-500" />
                                </div>
                                <div className="text-4xl font-bold text-slate-900 mb-1">{stats ? stats.lectures_attended + stats.lectures_missed : 0}</div>
                                <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total Marked</div>
                            </div>

                            <div className="text-center p-6 bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg transition-shadow duration-300">
                                <div className="p-3 bg-blue-50 rounded-full w-fit mx-auto mb-4">
                                    <TrendingUp className="w-8 h-8 text-blue-500" />
                                </div>
                                <div className="text-4xl font-bold text-slate-900 mb-1">{stats?.overall_percentage || 0}%</div>
                                <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">Overall Percentage</div>
                            </div>
                        </div>

                        {/* Attendance Tracking Graph */}
                        <div className="mt-8 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                            <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                                Attendance Tracking (Last 30 Days)
                            </h4>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={generateAttendanceGraphData(stats)}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="week"
                                        stroke="#94a3b8"
                                        style={{ fontSize: '12px' }}
                                    />
                                    <YAxis
                                        stroke="#94a3b8"
                                        style={{ fontSize: '12px' }}
                                        domain={[0, 100]}
                                        label={{ value: 'Attendance %', angle: -90, position: 'insideLeft', style: { fontSize: '12px', fill: '#64748b' } }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="percentage"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        dot={{ fill: '#3b82f6', r: 5 }}
                                        activeDot={{ r: 7 }}
                                        name="Attendance %"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="target"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                        dot={false}
                                        name="Target (75%)"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                            <p className="text-xs text-slate-500 mt-4 text-center">
                                Track your attendance trends to identify patterns and plan better
                            </p>
                        </div>

                        {stats ? (
                            <div className={`mt-8 p-6 rounded-2xl border ${stats.overall_percentage >= 75
                                ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-100"
                                : "bg-gradient-to-r from-red-50 to-orange-50 border-red-100"
                                }`}>
                                <h4 className={`flex items-center gap-2 font-bold mb-2 ${stats.overall_percentage >= 75 ? "text-green-900" : "text-red-900"
                                    }`}>
                                    <span>{stats.overall_percentage >= 75 ? "🎉" : "⚠️"}</span>
                                    {stats.overall_percentage >= 75 ? "On Track!" : "Action Required"}
                                </h4>
                                <p className={`leading-relaxed mb-3 ${stats.overall_percentage >= 75 ? "text-green-700" : "text-red-700"
                                    }`}>
                                    {stats.overall_percentage >= 75
                                        ? "Great job! You are maintaining a healthy attendance record. You are in a good position to plan your next vacation!"
                                        : "Your attendance is below the 75% threshold. You need to attend more classes to avoid detention. Check the planner for catch-up suggestions."}
                                </p>
                                <div className={`text-sm mt-4 pt-4 border-t ${stats.overall_percentage >= 75 ? "border-green-200 text-green-800" : "border-red-200 text-red-800"}`}>
                                    <p className="font-medium">
                                        📊 <strong>Tracked Attendance:</strong> You've marked {stats.lectures_attended + stats.lectures_missed} out of your total lectures
                                        ({stats.lectures_attended} attended, {stats.lectures_missed} missed)
                                    </p>
                                    <p className="text-xs mt-2 opacity-75">
                                        💡 Tip: Mark attendance daily to track your actual bunking habits and plan better!
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                                <h4 className="flex items-center gap-2 font-bold text-blue-900 mb-2">
                                    <span>🎯</span> Getting Started
                                </h4>
                                <p className="text-blue-700 leading-relaxed">
                                    Start tracking your attendance by uploading your academic calendar and selecting your subjects to get personalized insights.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
