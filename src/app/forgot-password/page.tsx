"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Something went wrong");
                return;
            }

            setMessage(
                "If an account with that email exists, a password reset link has been sent."
            );
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <Link
                        href="/login"
                        className="text-2xl font-bold tracking-tight text-slate-900"
                    >
                        Attend<span className="text-blue-600">.</span>
                    </Link>

                    <h1 className="mt-8 text-2xl font-bold text-slate-900">
                        Forgot your password?
                    </h1>

                    <p className="mt-2 text-sm text-slate-600">
                        Enter your email and we'll send you a password reset
                        link.
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Email address
                            </label>

                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        {error && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? "Sending..." : "Send reset link"}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            href="/login"
                            className="text-sm text-slate-600 hover:text-blue-600"
                        >
                            ← Back to login
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}