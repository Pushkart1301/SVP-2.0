"use client";
import React, { useState } from "react";
import { X, Upload, Trash2, UserCircle } from "lucide-react";
import { Card, Input, Button } from "@/components/ui";
import api from "@/lib/api";

interface EditProfileModalProps {
    user: {
        full_name: string;
        email: string;
        branch?: string;
        semester?: string;
        profile_image?: string;
        [key: string]: any;
    };
    onClose: () => void;
    onUpdate: () => void;
}

export default function EditProfileModal({ user, onClose, onUpdate }: EditProfileModalProps) {
    const [formData, setFormData] = useState({
        full_name: user.full_name || "",
        email: user.email || "",
        password: "",
        branch: user.branch || "",
        semester: user.semester || "",
        profile_image: user.profile_image || ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (limit to 2MB)
            if (file.size > 2 * 1024 * 1024) {
                setError("Image size should be less than 2MB");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, profile_image: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setFormData(prev => ({ ...prev, profile_image: "" }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const payload: any = {
                full_name: formData.full_name,
                email: formData.email,
                branch: formData.branch,
                semester: formData.semester,
                profile_image: formData.profile_image
            };
            if (formData.password) payload.password = formData.password;

            await api.put("/auth/me", payload);
            onUpdate();
            onClose();
        } catch (err) {
            setError("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 animate-fade-in">
            <div className="absolute inset-0" onClick={onClose}></div>
            <Card className="w-full max-w-md bg-white relative max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-900">Edit Profile</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}

                    {/* Profile Image Section */}
                    <div className="flex flex-col items-center gap-3 pb-4 border-b">
                        <div className="relative w-24 h-24 rounded-full bg-slate-100 overflow-hidden border-2 border-slate-200">
                            {formData.profile_image ? (
                                <img src={formData.profile_image} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <UserCircle className="w-full h-full text-slate-300 p-2" />
                            )}
                        </div>
                        <div className="flex gap-2">
                            <label className="cursor-pointer bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors flex items-center gap-1">
                                <Upload size={14} /> Upload Photo
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                            {formData.profile_image && (
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors flex items-center gap-1"
                                >
                                    <Trash2 size={14} /> Remove
                                </button>
                            )}
                        </div>
                        <p className="text-xs text-slate-400">Max size: 2MB</p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1.5">Full Name</label>
                        <Input
                            value={formData.full_name}
                            onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1.5">Email</label>
                        <Input
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            required
                            type="email"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1.5">Branch</label>
                            <Input
                                value={formData.branch}
                                onChange={e => setFormData({ ...formData, branch: e.target.value })}
                                placeholder="e.g. CS"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1.5">Semester</label>
                            <Input
                                value={formData.semester}
                                onChange={e => setFormData({ ...formData, semester: e.target.value })}
                                placeholder="e.g. 6"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1.5">New Password (Optional)</label>
                        <Input
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Leave blank to keep current"
                            type="password"
                        />
                        <p className="text-xs text-slate-400 mt-1">Only enter if you want to change it.</p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="flex-1">
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
