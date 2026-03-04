"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { AuthGuard } from "@/components/AuthGuard";

export default function DashboardPage() {
    const { user, logout } = useAuth();

    return (
        <AuthGuard>
            <div className="min-h-screen bg-gray-50">
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
