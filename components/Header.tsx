"use client";

/**
 * @fileoverview Sticky top navigation header with site logo, nav links, and auth actions.
 * Hidden on landing, login, and register pages.
 */

import React from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";

/**
 * Renders the app navigation bar. Returns null on auth pages to keep forms clean.
 * @returns The sticky header element, or null when on the landing, login, or register page
 */
export default function Header() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    // Do not show header on landing, login, or register pages to keep forms clean
    if (pathname === '/' || pathname === '/login' || pathname === '/register') {
        return null;
    }

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex h-16">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/dashboard" className="text-2xl font-bold tracking-tight">
                                <span className="text-red-600">NEU</span><span className="text-gray-900">Course</span>
                            </Link>
                        </div>
                        <nav className="ml-6 flex space-x-8 h-full">
                            <Link
                                href="/dashboard"
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full ${pathname === '/dashboard' ? 'border-red-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/plans"
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full ${pathname.startsWith('/plans') ? 'border-red-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
                            >
                                Plans
                            </Link>
                            <Link
                                href="/courses"
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full ${pathname.startsWith('/courses') ? 'border-red-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
                            >
                                Courses
                            </Link>
                            <Link
                                href="/calendar"
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full ${pathname === '/calendar' ? 'border-red-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
                            >
                                Calendar
                            </Link>
                        </nav>
                    </div>
                    <div className="flex items-center">
                        {user ? (
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-500 hidden sm:block">{user.email}</span>
                                <button
                                    onClick={logout}
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                >
                                    Log Out
                                </button>
                            </div>
                        ) : (
                            <div className="flex space-x-4">
                                <Link
                                    href="/login"
                                    className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href="/register"
                                    className="bg-red-600 text-white hover:bg-red-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
