"use client";

import { useState } from "react";
import { Mail, User, MessageSquare, Send, CheckCircle, AlertCircle } from "lucide-react";
import { Button, Card } from "@/components/ui";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    // Replace 'YOUR_FORMSPREE_ID' with your actual Formspree form ID
    const FORMSPREE_ENDPOINT = "https://formspree.io/f/xqezbvve";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setErrorMessage("");

        try {
            const response = await fetch(FORMSPREE_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setStatus("success");
                setFormData({ name: "", email: "", subject: "", message: "" });

                // Reset success message after 5 seconds
                setTimeout(() => setStatus("idle"), 5000);
            } else {
                throw new Error("Failed to send message");
            }
        } catch (error) {
            setStatus("error");
            setErrorMessage("Failed to send message. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4 sm:py-12">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8 sm:mb-12 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 mb-4 sm:mb-6 shadow-lg">
                        <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-3 sm:mb-4">
                        Get in <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Touch</span>
                    </h1>
                    <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto px-4">
                        Have questions or feedback? We'd love to hear from you! Send us a message and we'll respond as soon as possible.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Contact Info Cards */}
                    <div className="lg:col-span-1 space-y-4">
                        <Card className="p-4 sm:p-6 bg-white border-slate-200 hover:shadow-lg transition-all duration-300">
                            <div className="flex items-start gap-3 sm:gap-4">
                                <div className="p-2.5 sm:p-3 bg-blue-50 rounded-lg flex-shrink-0">
                                    <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-bold text-slate-900 mb-1 text-sm sm:text-base">Email</h3>
                                    <p className="text-xs sm:text-sm text-slate-600 break-all">toshniwal.pushkarx@gmail.com</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-4 sm:p-6 bg-white border-slate-200 hover:shadow-lg transition-all duration-300">
                            <div className="flex items-start gap-3 sm:gap-4">
                                <div className="p-2.5 sm:p-3 bg-green-50 rounded-lg flex-shrink-0">
                                    <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-bold text-slate-900 mb-1 text-sm sm:text-base">Response Time</h3>
                                    <p className="text-xs sm:text-sm text-slate-600">Within 24-48 hours</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                            <h3 className="font-bold text-slate-900 mb-2 text-sm sm:text-base">💡 Quick Tip</h3>
                            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                                Include your student ID or registered email for faster assistance with account-related queries.
                            </p>
                        </Card>
                    </div>

                    {/* Contact Form */}
                    <Card className="lg:col-span-2 p-6 sm:p-8 bg-white border-slate-200 shadow-xl">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">Send us a Message</h2>

                        {status === "success" && (
                            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2 sm:gap-3 animate-fade-in">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm sm:text-base text-green-800 font-medium">
                                    Message sent successfully! We'll get back to you soon.
                                </p>
                            </div>
                        )}

                        {status === "error" && (
                            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 sm:gap-3 animate-fade-in">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm sm:text-base text-red-800 font-medium break-words">{errorMessage}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Your Name *
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            placeholder="John Doe"
                                            className="w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Email Address *
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            placeholder="john@example.com"
                                            className="w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Subject *
                                </label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    placeholder="What is this regarding?"
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Message *
                                </label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows={6}
                                    placeholder="Tell us more about your query..."
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={status === "loading"}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 sm:py-6 text-base sm:text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                {status === "loading" ? (
                                    <>
                                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span className="text-sm sm:text-base">Sending...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span className="text-sm sm:text-base">Send Message</span>
                                    </>
                                )}
                            </Button>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
}
