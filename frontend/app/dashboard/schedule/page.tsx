"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, Button, Input } from "@/components/ui";
import { Calendar as CalendarIcon, Clock, Trash2, Plus, Save } from "lucide-react";
import clsx from "clsx";

interface Subject {
    _id: string;
    name: string;
    code: string;
}

interface ScheduleSlot {
    start_time: string;
    end_time: string;
    subject_id: string;
}

interface WeekdaySchedule {
    weekday: number;
    slots: ScheduleSlot[];
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Common time slots that can be quick-added
const COMMON_TIME_SLOTS = [
    { start: "08:00", end: "09:00" },
    { start: "09:00", end: "10:00" },
    { start: "10:00", end: "11:00" },
    { start: "11:00", end: "12:00" },
    { start: "12:00", end: "13:00" },
    { start: "13:00", end: "14:00" },
    { start: "14:00", end: "15:00" },
    { start: "15:00", end: "16:00" },
    { start: "16:00", end: "17:00" },
    { start: "17:00", end: "18:00" },
];

export default function SchedulePage() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [timeSlots, setTimeSlots] = useState<{ start: string; end: string }[]>([]);
    const [scheduleMatrix, setScheduleMatrix] = useState<string[][]>([]);
    const [customStart, setCustomStart] = useState("");
    const [customEnd, setCustomEnd] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [subRes, schedRes] = await Promise.all([
                api.get("/subjects"),
                api.get("/attendance/schedule")
            ]);

            setSubjects(subRes.data);

            // Extract unique time slots from existing schedules
            const schedules: WeekdaySchedule[] = schedRes.data;
            const uniqueSlots = new Map<string, { start: string; end: string }>();

            schedules.forEach(daySched => {
                daySched.slots.forEach(slot => {
                    const key = `${slot.start_time}-${slot.end_time}`;
                    if (!uniqueSlots.has(key)) {
                        uniqueSlots.set(key, { start: slot.start_time, end: slot.end_time });
                    }
                });
            });

            const slots = Array.from(uniqueSlots.values()).sort((a, b) => a.start.localeCompare(b.start));
            setTimeSlots(slots);

            // Build matrix
            const initialMatrix = slots.map(() => Array(DAYS.length).fill("no_lecture"));

            schedules.forEach(daySched => {
                daySched.slots.forEach(slot => {
                    const timeIndex = slots.findIndex(ts => ts.start === slot.start_time && ts.end === slot.end_time);
                    if (timeIndex !== -1) {
                        initialMatrix[timeIndex][daySched.weekday] = slot.subject_id;
                    }
                });
            });

            setScheduleMatrix(initialMatrix);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCellChange = (timeIndex: number, dayIndex: number, subjectId: string) => {
        const newMatrix = [...scheduleMatrix];
        newMatrix[timeIndex] = [...newMatrix[timeIndex]];
        newMatrix[timeIndex][dayIndex] = subjectId;
        setScheduleMatrix(newMatrix);
    };

    const quickAddTimeSlot = (slot: { start: string; end: string }) => {
        // Check if already exists
        const exists = timeSlots.some(ts => ts.start === slot.start && ts.end === slot.end);
        if (exists) {
            alert("This time slot is already added!");
            return;
        }

        const newSlots = [...timeSlots, slot].sort((a, b) => a.start.localeCompare(b.start));
        setTimeSlots(newSlots);

        // Insert new row in matrix at correct position
        const insertIndex = newSlots.findIndex(ts => ts.start === slot.start && ts.end === slot.end);
        const newMatrix = [...scheduleMatrix];
        newMatrix.splice(insertIndex, 0, Array(DAYS.length).fill("no_lecture"));
        setScheduleMatrix(newMatrix);
    };

    const addCustomTimeSlot = () => {
        if (!customStart || !customEnd) {
            alert("Please enter both start and end times.");
            return;
        }

        if (customStart >= customEnd) {
            alert("End time must be after start time.");
            return;
        }

        const exists = timeSlots.some(ts => ts.start === customStart && ts.end === customEnd);
        if (exists) {
            alert("This time slot is already added!");
            return;
        }

        const newSlot = { start: customStart, end: customEnd };
        const newSlots = [...timeSlots, newSlot].sort((a, b) => a.start.localeCompare(b.start));
        setTimeSlots(newSlots);

        const insertIndex = newSlots.findIndex(ts => ts.start === customStart && ts.end === customEnd);
        const newMatrix = [...scheduleMatrix];
        newMatrix.splice(insertIndex, 0, Array(DAYS.length).fill("no_lecture"));
        setScheduleMatrix(newMatrix);

        setCustomStart("");
        setCustomEnd("");
    };

    const deleteTimeSlot = (index: number) => {
        if (!confirm("Delete this time slot? All subject mappings for this time will be removed.")) return;

        const newSlots = timeSlots.filter((_, i) => i !== index);
        const newMatrix = scheduleMatrix.filter((_, i) => i !== index);

        setTimeSlots(newSlots);
        setScheduleMatrix(newMatrix);
    };

    const clearAllSlots = () => {
        if (!confirm("Clear all time slots and start fresh?")) return;
        setTimeSlots([]);
        setScheduleMatrix([]);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const promises = DAYS.map(async (_, dayIndex) => {
                const slots: ScheduleSlot[] = [];
                timeSlots.forEach((time, timeIndex) => {
                    const subjectId = scheduleMatrix[timeIndex][dayIndex];
                    if (subjectId && subjectId !== "no_lecture") {
                        slots.push({
                            start_time: time.start,
                            end_time: time.end,
                            subject_id: subjectId
                        });
                    }
                });

                return api.post("/attendance/schedule", {
                    weekday: dayIndex,
                    slots: slots
                });
            });

            await Promise.all(promises);
            alert("Schedule saved successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to save schedule.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-[1600px] mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 rounded-xl">
                        <CalendarIcon className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Lecture Timetable</h1>
                        <p className="text-slate-500">Map your weekly schedule for accurate attendance tracking</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <Button onClick={clearAllSlots} variant="outline" className="gap-2 text-red-500 border-red-200 hover:bg-red-500 hover:text-white mb-1">
                        <Trash2 size={16} /> Clear All
                    </Button>
                    <Button onClick={handleSave} disabled={saving} className="gap-2 bg-indigo-600 hover:bg-green-500 hover:text-white mb-1">
                        <Save size={16} /> {saving ? "Saving..." : "Save Schedule"}
                    </Button>
                </div>
            </div>

            {/* Quick Add Time Slots */}
            <Card className="p-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">📌 Quick add common time slots:</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                    {COMMON_TIME_SLOTS.map((slot, i) => (
                        <button
                            key={i}
                            onClick={() => quickAddTimeSlot(slot)}
                            className="px-3 py-1.5 text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium border border-indigo-100"
                        >
                            {slot.start} - {slot.end}
                        </button>
                    ))}
                </div>

                <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">🕐 Add custom time slot:</h3>
                    <div className="flex gap-3 items-end">
                        <div className="flex-1">
                            <label className="text-xs text-slate-600 block mb-1">Start Time</label>
                            <Input
                                type="time"
                                value={customStart}
                                onChange={(e) => setCustomStart(e.target.value)}
                                placeholder="e.g. 9:00 - 10:00"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs text-slate-600 block mb-1">End Time</label>
                            <Input
                                type="time"
                                value={customEnd}
                                onChange={(e) => setCustomEnd(e.target.value)}
                            />
                        </div>
                        <Button onClick={addCustomTimeSlot} className="gap-2 bg-indigo-600 hover:bg-indigo-700  mb-1">
                            <Plus size={16} /> Add Slot
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Instructions */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3 text-amber-800 text-sm">
                <div className="shrink-0 mt-0.5">📝</div>
                <div>
                    <h4 className="font-bold mb-1">How to create your schedule:</h4>
                    <ol className="list-decimal ml-4 space-y-1 text-amber-700/90">
                        <li>Click on the quick-add time slot buttons above, or type your own time slot</li>
                        <li>For each time slot, select the subject for each day of the week</li>
                        <li>Choose "No Lecture" if there's no class on that day/time</li>
                        <li>Click "Save Schedule" when you're done to apply changes</li>
                    </ol>
                </div>
            </div>

            {/* Schedule Table */}
            {timeSlots.length > 0 ? (
                <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px]">
                            <thead>
                                <tr className="bg-slate-50 border-b">
                                    <th className="p-4 text-left font-semibold text-slate-600 w-44 sticky left-0 bg-slate-50 z-10 border-r">
                                        Time
                                    </th>
                                    {DAYS.map((day) => (
                                        <th key={day} className="p-4 text-left font-semibold text-slate-600 min-w-[160px]">
                                            {day}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {timeSlots.map((slot, tIndex) => (
                                    <tr key={tIndex} className="hover:bg-slate-50/50 group">
                                        <td className="p-4 font-medium text-slate-700 whitespace-nowrap sticky left-0 bg-white border-r z-10">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <Clock size={16} className="text-slate-400" />
                                                    <span>{slot.start} - {slot.end}</span>
                                                </div>
                                                <button
                                                    onClick={() => deleteTimeSlot(tIndex)}
                                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded text-red-500 transition-all"
                                                    title="Delete this time slot"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                        {DAYS.map((_, dIndex) => (
                                            <td key={dIndex} className="p-2">
                                                <select
                                                    value={scheduleMatrix[tIndex]?.[dIndex] || "no_lecture"}
                                                    onChange={(e) => handleCellChange(tIndex, dIndex, e.target.value)}
                                                    className={clsx(
                                                        "w-full px-3 py-2 rounded-lg border text-sm transition-all outline-none focus:ring-2",
                                                        scheduleMatrix[tIndex]?.[dIndex] !== "no_lecture"
                                                            ? "bg-indigo-50 border-indigo-200 text-indigo-700 focus:ring-indigo-200 font-medium"
                                                            : "bg-white border-slate-200 text-slate-500 focus:ring-slate-200"
                                                    )}
                                                >
                                                    <option value="no_lecture">-- No Lecture --</option>
                                                    {subjects.map(sub => (
                                                        <option key={sub._id} value={sub._id}>
                                                            {sub.name} ({sub.code})
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center p-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <CalendarIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">No time slots added yet</h3>
                    <p className="text-slate-500 mb-4">Click on the quick-add buttons above to get started!</p>
                </div>
            )}
        </div>
    );
}
