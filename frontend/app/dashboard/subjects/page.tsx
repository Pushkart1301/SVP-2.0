"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, Button, Input } from "@/components/ui";
import { Plus, Trash2, BookOpen } from "lucide-react";

export default function SubjectsPage() {
    const [subjects, setSubjects] = useState<any[]>([]);
    const [newSubject, setNewSubject] = useState({ name: "", code: "", target_attendance_percent: 75 });
    const [loading, setLoading] = useState(false);

    const fetchSubjects = async () => {
        try {
            const res = await api.get("/subjects");
            setSubjects(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => { fetchSubjects(); }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/subjects", newSubject);
            setNewSubject({ name: "", code: "", target_attendance_percent: 75 });
            fetchSubjects();
        } catch (err) {
            alert("Failed to add subject. Code might be duplicate.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will delete all attendance records for this subject.")) return;
        await api.delete(`/subjects/${id}`);
        fetchSubjects();
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-xl">
                    <BookOpen className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Subjects</h1>
                    <p className="text-slate-500">Manage your enrolled courses and attendance goals</p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* List */}
                <div className="md:col-span-2 grid gap-4 sm:grid-cols-2">
                    {subjects.map(sub => (
                        <Card key={sub._id} className="relative group hover:shadow-md transition-shadow">
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleDelete(sub._id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white mb-4 font-bold shadow-sm">
                                {sub.code.substring(0, 2).toUpperCase()}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">{sub.name}</h3>
                            <p className="text-slate-500 text-sm mb-4 font-medium">{sub.code}</p>
                            <div className="flex justify-between items-center text-sm pt-4 border-t border-slate-50">
                                <span className="text-slate-500">Target Attendance</span>
                                <span className="text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded-md">{sub.target_attendance_percent}%</span>
                            </div>
                        </Card>
                    ))}
                    {subjects.length === 0 && (
                        <div className="col-span-2 p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <p className="text-slate-500">No subjects added yet. Add one to get started!</p>
                        </div>
                    )}
                </div>

                {/* Add Form */}
                <div>
                    <Card className="sticky top-24 border-slate-200 shadow-md">
                        <div className="flex items-center gap-2 mb-6">
                            <Plus className="w-5 h-5 text-blue-600" />
                            <h3 className="text-lg font-bold text-slate-900">Add New Subject</h3>
                        </div>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-1.5">Subject Name</label>
                                <Input value={newSubject.name} onChange={e => setNewSubject({ ...newSubject, name: e.target.value })} required placeholder="e.g. Data Structures" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-1.5">Subject Code</label>
                                <Input value={newSubject.code} onChange={e => setNewSubject({ ...newSubject, code: e.target.value })} required placeholder="e.g. CS101" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-1.5">Target Attendance (%)</label>
                                <Input type="number" value={newSubject.target_attendance_percent} onChange={e => setNewSubject({ ...newSubject, target_attendance_percent: Number(e.target.value) })} required min="1" max="100" />
                            </div>
                            <Button type="submit" className="w-full mt-2" disabled={loading}>
                                {loading ? "Adding..." : "Add Subject"}
                            </Button>

                            <Button
                                type="button"
                                onClick={() => window.location.href = '/dashboard/schedule'}
                                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Map with Timetable
                            </Button>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
}
