"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { AuthGuard } from "@/components/AuthGuard";

import { usePlans } from "@/hooks/usePlans";
import { useEvents } from "@/hooks/useEvents";
import Link from "next/link";
import { formatDistanceToNow, addDays, isAfter, isBefore } from "date-fns";

function getTimestampDate(timestamp: any): Date | null {
    if (!timestamp) return null;
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        return timestamp.toDate();
    }
    if (timestamp._seconds !== undefined) {
        return new Date(timestamp._seconds * 1000);
    }
    if (timestamp.seconds !== undefined) {
        return new Date(timestamp.seconds * 1000);
    }
    if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        return new Date(timestamp);
    }
    return null;
}

export default function DashboardPage() {
    const { user, logout } = useAuth();
    const { plans, loading: plansLoading } = usePlans();
    const { events, loading: eventsLoading } = useEvents();

    const now = new Date();
    const sevenDaysFromNow = addDays(now, 7);

    const upcomingEvents = events
        .filter(event => {
            const eventDate = new Date(event.startTime);
            // event is in the future but less than 7 days from now
            return isAfter(eventDate, now) && isBefore(eventDate, sevenDaysFromNow);
        })
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        .slice(0, 5);

    return (
        <AuthGuard>
            <div className="min-h-screen bg-gray-50 pb-12">
                <main>
                    <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
                        <div className="px-4 sm:px-0 mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                Welcome back, Husky
                                <img src="/paw-print.svg" alt="Paw Print" className="w-8 h-8 opacity-80" />
                            </h1>
                            <p className="text-gray-500 mt-2">{user?.email}</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 sm:px-0">
                            <div className="lg:col-span-2 space-y-6">
                                <section className="bg-white shadow rounded-xl p-6 border border-gray-200">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-bold text-gray-900">My Degree Plans</h2>
                                        <Link href="/plans" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">View All</Link>
                                    </div>

                                    {plansLoading ? (
                                        <div className="animate-pulse space-y-4">
                                            {[1, 2].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>)}
                                        </div>
                                    ) : plans.length === 0 ? (
                                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                            <p className="text-gray-500">No active plans.</p>
                                            <Link href="/plans" className="mt-2 inline-block text-indigo-600 font-medium">Create your first plan &rarr;</Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {plans.map(plan => {
                                                const dateObj = getTimestampDate(plan.updatedAt || plan.createdAt);
                                                const timeString = dateObj ? formatDistanceToNow(dateObj, { addSuffix: true }) : '';

                                                return (
                                                    <Link key={plan.id} href={`/plans/${plan.id}`} className="block border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                                            <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                                                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                                                {timeString && <span className="bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-600">Updated {timeString}</span>}
                                                                <span>{plan.semesterCount || 0} Semesters</span>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </section>
                            </div>

                            <div className="lg:col-span-1">
                                <section className="bg-white shadow rounded-xl p-6 border border-gray-200 sticky top-24">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-bold text-gray-900">Upcoming Events</h2>
                                        <Link href="/calendar" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">Calendar</Link>
                                    </div>

                                    {eventsLoading ? (
                                        <div className="animate-pulse space-y-4">
                                            {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-lg"></div>)}
                                        </div>
                                    ) : upcomingEvents.length === 0 ? (
                                        <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                            <p className="text-gray-500 text-sm">No scheduled events.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {upcomingEvents.map(event => (
                                                <div key={event.id} className="flex gap-4 items-start border-l-2 pl-3" style={{ borderLeftColor: event.color === 'blue' ? '#3b82f6' : event.color === 'red' ? '#ef4444' : '#22c55e' }}>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-gray-900 truncate">{event.title}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {new Date(event.startTime).toLocaleDateString([], { weekday: 'short' })} • {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
