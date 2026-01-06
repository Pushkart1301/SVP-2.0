"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./auth.module.css";
import api from "@/lib/api";

export default function AuthPage() {
    const [isActive, setIsActive] = useState(false);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Login State
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    // Register State
    const [regUsername, setRegUsername] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const formData = new URLSearchParams();
            formData.append('username', loginEmail);
            formData.append('password', loginPassword);

            const res = await api.post("/auth/login", formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            // 📌 SEE WHAT BACKEND SENDS (Open browser console with F12)
            console.log("=== LOGIN SUCCESS ===");
            console.log("Full Response:", res);
            console.log("Response Data:", res.data);
            console.log("Access Token:", res.data.access_token);

            localStorage.setItem("token", res.data.access_token);
            router.push("/dashboard");
        } catch (err: any) {
            console.error(err);
            let errorMessage = "Login failed. Please check your credentials.";
            if (err.response?.data?.detail) {
                if (typeof err.response.data.detail === "string") {
                    errorMessage = err.response.data.detail;
                } else if (Array.isArray(err.response.data.detail)) {
                    errorMessage = err.response.data.detail.map((e: any) => e.msg).join(", ");
                } else if (typeof err.response.data.detail === "object") {
                    errorMessage = err.response.data.detail.msg || JSON.stringify(err.response.data.detail);
                }
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            await api.post("/auth/register", {
                email: regEmail,
                password: regPassword,
                full_name: regUsername
            });

            // Auto login or switch to login
            setIsActive(false); // Switch to login panel
            setLoginEmail(regEmail);
            setError(""); // Clear any errors
            alert("Registration successful! Please login.");
        } catch (err: any) {
            console.error(err);
            const errorMsg = err.response?.data?.detail
                ? JSON.stringify(err.response.data.detail)
                : (err.message || "Registration failed. Please try again.");
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.authWrapper}>
            <div className={`${styles.container} ${isActive ? styles.active : ""}`}>
                {/* Login Form */}
                <div className={`${styles["form-box"]} ${styles.login}`}>
                    <form className={styles.form} onSubmit={handleLogin}>
                        <h1>Login</h1>
                        {error && !isActive && <p className="text-red-500 text-sm mb-4">{error}</p>}

                        <div className={styles["input-box"]}>
                            <input
                                type="email"
                                placeholder="Email"
                                required
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                            />
                            <i className="bx bxs-user"></i>
                        </div>
                        <div className={styles["input-box"]}>
                            <input
                                type="password"
                                placeholder="Password"
                                required
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                            />
                            <i className="bx bxs-lock-alt"></i>
                        </div>
                        <div className={styles["forgot-link"]}>
                            <a href="#">Forgot password?</a>
                        </div>
                        <button type="submit" className={styles.btn} disabled={isLoading}>
                            {isLoading ? "Logging in..." : "Login"}
                        </button>
                    </form>
                </div>

                {/* Registration Form */}
                <div className={`${styles["form-box"]} ${styles.register}`}>
                    <form className={styles.form} onSubmit={handleRegister}>
                        <h1>Registration</h1>
                        {error && isActive && <p className="text-red-500 text-sm mb-4">{error}</p>}

                        <div className={styles["input-box"]}>
                            <input
                                type="text"
                                placeholder="Username"
                                required
                                value={regUsername}
                                onChange={(e) => setRegUsername(e.target.value)}
                            />
                            <i className="bx bxs-user"></i>
                        </div>
                        <div className={styles["input-box"]}>
                            <input
                                type="email"
                                placeholder="Email"
                                required
                                value={regEmail}
                                onChange={(e) => setRegEmail(e.target.value)}
                            />
                            <i className="bx bxs-envelope"></i>
                        </div>
                        <div className={styles["input-box"]}>
                            <input
                                type="password"
                                placeholder="Password"
                                required
                                value={regPassword}
                                onChange={(e) => setRegPassword(e.target.value)}
                            />
                            <i className="bx bxs-lock-alt"></i>
                        </div>
                        <button type="submit" className={styles.btn} disabled={isLoading}>
                            {isLoading ? "Creating Account..." : "Register"}
                        </button>


                    </form>
                </div>

                {/* Toggle Box */}
                <div className={styles["toggle-box"]}>
                    <div className={`${styles["toggle-panel"]} ${styles["toggle-left"]}`}>
                        <h1>Hello, Welcome!</h1>
                        <p>Don't have an account?</p>
                        <button
                            type="button"
                            className={`${styles.btn}`}
                            onClick={() => { setIsActive(true); setError(""); }}
                        >
                            Register
                        </button>
                    </div>
                    <div className={`${styles["toggle-panel"]} ${styles["toggle-right"]}`}>
                        <h1>Welcome Back!</h1>
                        <p>Already have an account?</p>
                        <button
                            type="button"
                            className={`${styles.btn}`}
                            onClick={() => { setIsActive(false); setError(""); }}
                        >
                            Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
