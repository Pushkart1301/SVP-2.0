"use client";
import React, { useState } from "react";
import api from "@/lib/api";
import { Card, Button, Input } from "@/components/ui";
import { Upload, Plane, BookOpen, Loader2 } from "lucide-react";

export default function PlannerPage() {
    const [activeTab, setActiveTab] = useState<"vacation" | "study" | "upload">("upload");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [query, setQuery] = useState("");

    // Upload
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        setLoading(true);
        const formData = new FormData();
        formData.append("file", e.target.files[0]);
        try {
            const res = await api.post("/planner/academic-calendar/upload", formData);
            setResult(res.data);
        } catch (err) {
            alert("Upload failed");
        } finally {
            setLoading(false);
        }
    };

    // Generate Vacation
    const generateVacation = async () => {
        setLoading(true);
        setResult(null);

        try {
            const res = await api.post("/planner/vacation/generate", {
                min_attendance: 75,
                query: query
                // backend will fetch attendance, subjects, calendar from DB
            });

            setResult(res.data);
        } catch (err) {
            alert("Failed to generate plan");
        } finally {
            setLoading(false);
        }
    };

    // Generate Study Plan
    const generateStudy = async () => {
        setLoading(true);
        setResult(null);
        try {
            const res = await api.post("/planner/study-plan/generate", { focus: "weak_areas", daily_hours: 4 });
            setResult(res.data);
        } catch (err) {
            alert("Failed to generate plan");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">AI Planner</h1>
                    <p className="text-muted">Use AI to optimize your schedule</p>
                </div>

                <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
                    <TabButton active={activeTab === "upload"} onClick={() => { setActiveTab("upload"); setResult(null); }} icon={Upload}>Upload Calendar</TabButton>
                    <TabButton active={activeTab === "vacation"} onClick={() => { setActiveTab("vacation"); setResult(null); }} icon={Plane}>Vacation</TabButton>
                    <TabButton active={activeTab === "study"} onClick={() => { setActiveTab("study"); setResult(null); }} icon={BookOpen}>Study Plan</TabButton>
                </div>
            </div>

            <Card className="min-h-[400px]">
                {loading && (
                    <div className="h-full flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                        <p className="text-muted">Crunching data with Groq AI...</p>
                    </div>
                )}

                {!loading && activeTab === "upload" && (
                    <div className="text-center py-12 space-y-4">
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 hover:border-primary/50 transition-colors">
                            <Upload className="w-12 h-12 mx-auto text-muted mb-4" />
                            <h3 className="text-lg font-medium text-slate-900">Upload Academic Calendar</h3>
                            <p className="text-muted text-sm mb-6">PDF or Image formats supported</p>
                            <label className="cursor-pointer bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                                Select File
                                <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,image/*" />
                            </label>
                        </div>
                        {result && (
                            <div className="grid md:grid-cols-2 gap-6 w-full text-left">
                                {/* Holidays Table */}
                                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-semibold text-slate-700 flex items-center gap-2">
                                        <Plane className="w-4 h-4" /> Holidays ({result.data?.holidays?.length || 0})
                                    </div>
                                    <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                                        {result.data?.holidays?.map((h: any, i: number) => (
                                            <div key={i} className="px-4 py-3 flex justify-between items-center hover:bg-slate-50">
                                                <span className="text-sm font-medium text-slate-800">{h.name}</span>
                                                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">{h.start_date}</span>
                                            </div>
                                        ))}
                                        {(!result.data?.holidays || result.data.holidays.length === 0) && (
                                            <p className="p-4 text-sm text-slate-400 text-center">No holidays found.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Exams Table */}
                                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-semibold text-slate-700 flex items-center gap-2">
                                        <BookOpen className="w-4 h-4" /> Exams ({result.data?.exams?.length || 0})
                                    </div>
                                    <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                                        {result.data?.exams?.map((e: any, i: number) => (
                                            <div key={i} className="px-4 py-3 flex justify-between items-center hover:bg-slate-50">
                                                <span className="text-sm font-medium text-slate-800">{e.subject}</span>
                                                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">{e.date}</span>
                                            </div>
                                        ))}
                                        {(!result.data?.exams || result.data.exams.length === 0) && (
                                            <p className="p-4 text-sm text-slate-400 text-center">No exams found.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {!loading && activeTab === "vacation" && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Plan Your Break</h2>
                            <p className="text-muted mb-6">We analyze your attendance trends to find the safest dates.</p>

                            <div className="max-w-md mx-auto flex gap-2 mb-4">
                                <Input
                                    placeholder="Ask AI: e.g. 'Can I take 4 days off in Dec?'"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                                <Button onClick={generateVacation} size="lg">Ask AI</Button>
                            </div>
                        </div>
                        {result && (
                            <div className="mt-8 space-y-4">
                                <h3 className="text-lg font-semibold text-slate-900">Recommended Windows</h3>
                                <div className="grid gap-4">
                                    {result.windows?.map((win: any, i: number) => (
                                        <div key={i} className="bg-slate-50 p-4 rounded-lg border-l-4 border-green-500">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-bold text-lg text-slate-900">{win.start_date} — {win.end_date}</span>
                                                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Safe</span>
                                            </div>
                                            <p className="text-sm text-muted">{win.reason}</p>
                                        </div>
                                    ))}
                                    {!result.windows && <p className="text-orange-400">No safe windows found based on current attendance.</p>}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {!loading && activeTab === "study" && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Personalized Study Plan</h2>
                            <p className="text-muted mb-6">Generate a 7-day schedule focused on your weak subjects.</p>
                            <Button onClick={generateStudy} size="lg">Generate Plan</Button>
                        </div>
                        {result && (
                            <div className="mt-8">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Plan</h3>
                                <p className="text-muted mb-6 italic">"{result.summary}"</p>
                                <div className="space-y-4">
                                    {result.daily_tasks?.map((day: any, i: number) => (
                                        <div key={i} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                            <h4 className="font-bold text-blue-400 mb-3">{day.date}</h4>
                                            <div className="space-y-2">
                                                {day.tasks.map((t: any, j: number) => (
                                                    <div key={j} className="flex justify-between text-sm border-b border-slate-200 pb-2 last:border-0 last:pb-0">
                                                        <span className="text-slate-900 font-medium">{t.subject}</span>
                                                        <span className="text-slate-400">{t.topic} ({t.duration_mins}m)</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Card>
        </div>
    )
}

function TabButton({ active, onClick, children, icon: Icon }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${active ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'}`}
        >
            <Icon className="w-4 h-4" />{children}
        </button>
    )
}
