"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, Button } from "@/components/ui";
import { ChevronLeft, ChevronRight, X, Clock } from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

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

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [schedule, setSchedule] = useState<WeekdaySchedule[]>([]);
    const [attendanceMap, setAttendanceMap] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);

    // Helper to format date key locally (YYYY-MM-DD)
    const getDateKey = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Get weekday index (0=Mon, 6=Sun) from Date
    const getWeekdayIndex = (date: Date) => {
        const day = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
        return day === 0 ? 6 : day - 1; // Convert to 0=Mon, 6=Sun
    };

    useEffect(() => {
        const fetchRefData = async () => {
            // Fetch Subjects
            try {
                const subRes = await api.get("/subjects");
                setSubjects(subRes.data);
            } catch (error) {
                console.error("Failed to fetch subjects", error);
            }

            // Fetch Schedule
            try {
                const schedRes = await api.get("/attendance/schedule");
                setSchedule(schedRes.data);
            } catch (error) {
                console.error("Failed to fetch schedule", error);
            }

            // Fetch Attendance History
            try {
                const attRes = await api.get("/attendance/history");
                console.log("Fetched Attendance:", attRes.data);

                const map: Record<string, any> = {};
                attRes.data.forEach((record: any) => {
                    let dKey = record.date;
                    if (typeof dKey === 'string' && dKey.includes('T')) {
                        dKey = dKey.split('T')[0];
                    }
                    map[dKey] = record;
                });
                setAttendanceMap(map);
            } catch (error) {
                console.error("Failed to fetch attendance history", error);
            }
        };
        fetchRefData();
    }, []);

    // Get scheduled subjects for a specific date
    const getScheduledSubjects = (date: Date) => {
        const weekdayIndex = getWeekdayIndex(date);
        const daySchedule = schedule.find(s => s.weekday === weekdayIndex);

        if (!daySchedule || daySchedule.slots.length === 0) {
            return [];
        }

        // Map subject IDs to full subject info with time slots
        // Add a unique index for each slot to handle same subject appearing multiple times
        return daySchedule.slots.map((slot, index) => {
            const subject = subjects.find(s => s._id === slot.subject_id);
            return subject ? {
                ...subject,
                timeSlot: `${slot.start_time} - ${slot.end_time}`,
                slotIndex: index  // Unique identifier for this specific slot
            } : null;
        }).filter(Boolean);
    };

    const handleMark = async (subjectId: string, status: "P" | "A", slotIndex?: number) => {
        if (!selectedDate) return;

        const dateKey = getDateKey(selectedDate);
        const currentEntries = attendanceMap[dateKey]?.entries || [];

        // If slotIndex is provided, create a unique identifier
        const uniqueId = slotIndex !== undefined ? `${subjectId}_slot${slotIndex}` : subjectId;

        // Remove existing entry for this subject/slot and add new one
        const newEntries = [
            ...currentEntries.filter((e: any) => {
                const entryId = e.slot_index !== undefined ? `${e.subject_id}_slot${e.slot_index}` : e.subject_id;
                return entryId !== uniqueId;
            }),
            {
                subject_id: subjectId,
                status,
                slot_index: slotIndex
            }
        ];

        // Optimistically update UI
        const updatedMap = {
            ...attendanceMap,
            [dateKey]: {
                date: dateKey,
                entries: newEntries
            }
        };
        setAttendanceMap(updatedMap);

        // Save to backend
        try {
            await api.post("/attendance", {
                date: dateKey,
                entries: newEntries
            });
            console.log("Attendance saved successfully");
        } catch (err) {
            console.error("Failed to save attendance", err);
            // Revert state on error
            setAttendanceMap(attendanceMap);
            alert("Failed to save attendance. Please try again.");
        }
    };

    const renderDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        // Empty cells for first week
        for (let i = 0; i < firstDay; i++) {
            days.push(
                <div
                    key={`empty-${i}`}
                    className="h-20 sm:h-24 border-2 border-slate-200 rounded-lg bg-slate-50/50"
                />
            );
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d);
            const dateKey = getDateKey(date);
            const hasData = attendanceMap[dateKey];

            const isToday = getDateKey(new Date()) === dateKey;
            const isSelected = selectedDate && getDateKey(selectedDate) === dateKey;

            days.push(
                <div
                    key={dateKey}
                    onClick={() => setSelectedDate(date)}
                    className={`
                        h-20 sm:h-24 border-2 rounded-lg p-2 sm:p-3 cursor-pointer 
                        transition-all duration-200 relative
                        ${isSelected
                            ? 'ring-4 ring-blue-500 ring-opacity-50 bg-blue-50 border-blue-500 shadow-lg transform scale-105'
                            : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
                        }
                        ${isToday
                            ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-400'
                            : 'bg-white hover:bg-slate-50'
                        }
                    `}
                >
                    <div className="flex justify-between items-start">
                        <span className={`
                            text-sm sm:text-base font-bold
                            ${isToday ? 'text-blue-600' : 'text-slate-700'}
                            ${isSelected ? 'text-blue-700' : ''}
                        `}>
                            {d}
                        </span>
                        {hasData && (
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs text-green-600 font-medium hidden sm:inline">
                                    {hasData.entries?.filter((e: any) => e.status === 'P').length}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Status indicators */}
                    <div className="mt-2 flex flex-wrap gap-1">
                        {hasData?.entries?.map((e: any, i: number) => (
                            <div
                                key={i}
                                className={`
                                    w-2 h-2 rounded-full transition-transform hover:scale-150
                                    ${e.status === 'P' ? 'bg-green-500' : 'bg-red-500'}
                                `}
                                title={`${e.status === 'P' ? 'Present' : 'Absent'}`}
                            />
                        ))}
                    </div>

                    {/* Today indicator */}
                    {isToday && (
                        <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2">
                            <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                                Today
                            </span>
                        </div>
                    )}
                </div>
            );
        }
        return days;
    };

    const changeMonth = (delta: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
    };

    const handleClearAttendance = async () => {
        if (!confirm("Are you sure you want to clear ALL attendance records? This action cannot be undone!")) {
            return;
        }

        setLoading(true);
        try {
            await api.delete("/attendance/clear");
            setAttendanceMap({});
            alert("All attendance records cleared successfully!");
        } catch (error) {
            console.error("Failed to clear attendance", error);
            alert("Failed to clear attendance records. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Get scheduled subjects when a date is selected
    const scheduledSubjects = selectedDate ? getScheduledSubjects(selectedDate) : [];
    const weekdayName = selectedDate ? WEEKDAY_NAMES[getWeekdayIndex(selectedDate)] : '';

    return (
        <div className="space-y-4 px-4 sm:px-6 ">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Attendance Calendar</h1>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <Button
                        onClick={handleClearAttendance}
                        disabled={loading}
                        variant="danger"
                        className="w-full sm:w-auto gap-2 text-sm"
                    >
                        <X size={16} />
                        {loading ? "Clearing..." : "Clear All"}
                    </Button>
                    <div className="flex items-center justify-center gap-3 sm:gap-4 bg-white rounded-xl p-2 shadow-sm border border-slate-200">
                        <Button
                            onClick={() => changeMonth(-1)}
                            variant="ghost"
                            className="hover:bg-blue-50 hover:text-blue-600"
                        >
                            <ChevronLeft />
                        </Button>
                        <span className="text-lg sm:text-xl font-semibold text-slate-900 min-w-[150px] sm:min-w-[180px] text-center">
                            {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                        </span>
                        <Button
                            onClick={() => changeMonth(1)}
                            variant="ghost"
                            className="hover:bg-blue-50 hover:text-blue-600"
                        >
                            <ChevronRight />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200 overflow-hidden">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-2 sm:gap-3 mb-3">
                    {DAYS.map(d => (
                        <div
                            key={d}
                            className="text-center font-bold text-slate-600 py-2 text-xs sm:text-sm uppercase tracking-wide"
                        >
                            {d}
                        </div>
                    ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-2 sm:gap-3">
                    {renderDays()}
                </div>
            </div>

            {selectedDate && (
                <div
                    className="fixed top-[10px] inset-x-0 bottom-0 bg-black/60 flex items-center justify-center z-40 p-4 transition-all duration-200"
                    onClick={() => setSelectedDate(null)}
                    style={{
                        animation: 'fadeIn 0.2s ease-out'
                    }}
                >
                    <Card
                        className="w-full max-w-lg bg-[#0F172A] border-white/20 max-h-[80vh] overflow-y-auto transition-all"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            animation: 'modalSlideIn 0.3s ease-out'
                        }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-white">Mark Attendance</h3>
                                <p className="text-sm text-slate-400 mt-1">{weekdayName}, {getDateKey(selectedDate)}</p>
                            </div>
                            <button onClick={() => setSelectedDate(null)} className="text-slate-400 hover:text-white"><X size={24} /></button>
                        </div>

                        {scheduledSubjects.length > 0 ? (
                            <div className="space-y-3">
                                {scheduledSubjects.map((sub: any) => {
                                    const dateKey = getDateKey(selectedDate);
                                    const uniqueId = `${sub._id}_slot${sub.slotIndex}`;

                                    // Find the attendance entry for this specific subject/slot
                                    const entry = attendanceMap[dateKey]?.entries?.find((e: any) => {
                                        const entryId = e.slot_index !== undefined ? `${e.subject_id}_slot${e.slot_index}` : e.subject_id;
                                        return entryId === uniqueId;
                                    });
                                    const status = entry?.status;

                                    // Debug logging
                                    console.log("Rendering subject:", sub.name, {
                                        dateKey,
                                        uniqueId,
                                        entry,
                                        status,
                                        allEntriesForDate: attendanceMap[dateKey]?.entries
                                    });

                                    return (
                                        <div key={`${sub._id}-${sub.slotIndex}`} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                                            <div className="flex-1">
                                                <div className="font-medium text-white">{sub.name}</div>
                                                <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                                    <Clock size={12} />
                                                    {sub.timeSlot}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleMark(sub._id, "P", sub.slotIndex)}
                                                    className={`px-4 py-2 rounded font-bold transition-all ${status === 'P' ? 'bg-green-500 text-white' : 'bg-white/10 text-slate-400 hover:bg-green-500/20'}`}
                                                >
                                                    P
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleMark(sub._id, "A", sub.slotIndex)}
                                                    className={`px-4 py-2 rounded font-bold transition-all ${status === 'A' ? 'bg-red-500 text-white' : 'bg-white/10 text-slate-400 hover:bg-red-500/20'}`}
                                                >
                                                    A
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12 px-4">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-700/50 flex items-center justify-center">
                                    <Clock size={32} className="text-slate-400" />
                                </div>
                                <h4 className="text-lg font-semibold text-white mb-2">No Lectures Scheduled</h4>
                                <p className="text-slate-400 text-sm">
                                    You don't have any lectures scheduled for {weekdayName}.<br />
                                    Set up your timetable to track attendance automatically.
                                </p>
                            </div>
                        )}
                    </Card>
                </div>
            )}
        </div>
    );
}
