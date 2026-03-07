"use client";

import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            router.push("/dashboard");
        } catch (err: unknown) {
            if ((err as { code?: string }).code === "auth/email-already-in-use") {
                setError("This email is already registered. Please log in.");
            } else {
                setError("An error occurred during registration. Please try again.");
            }
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 sm:p-10 space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight">
                        <span className="text-red-600">NEU</span><span className="text-gray-900">Course</span>
                    </h1>
                    <p className="text-gray-400 text-sm font-medium">Plan your degree. Own your schedule.</p>
                </div>

                <div className="flex border-b border-gray-100">
                    <Link href="/login" className="flex-1 pb-3 text-gray-400 font-medium hover:text-gray-600 transition-colors text-center">
                        Log In
                    </Link>
                    <div className="flex-1 pb-3 text-gray-900 font-semibold border-b-4 border-red-600 text-center">
                        Register
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="husky@northeastern.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-none transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-600/20 focus:border-red-600 outline-none transition-all"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-red-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-red-700 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
                    >
                        Sign Up
                    </button>

                    <div className="text-center pt-2">
                        <Link href="/courses" className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
                            View courses as a guest
                        </Link>
                    </div>
                </form>
            </div>
        </main>
    );
}
