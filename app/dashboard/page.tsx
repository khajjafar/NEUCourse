"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { AuthGuard } from "@/components/AuthGuard";

export default function DashboardPage() {
    const { user, logout } = useAuth();

    return (
        <AuthGuard>
            <div className="min-h-screen bg-gray-50">
                <header className="bg-white shadow">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">{user?.email}</span>
                            <button
                                onClick={logout}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Log Out
                            </button>
                        </div>
                    </div>
                </header>
                <main>
                    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                        <div className="px-4 py-6 sm:px-0">
                            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex flex-col items-center justify-center text-gray-500">
                                <p>Welcome to NEUCourse!</p>
                                <p className="text-sm mt-2">Your plans and calendar will appear here.</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
