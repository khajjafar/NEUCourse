'use client';

import { useSingleCourse } from "@/hooks/useSingleCourse";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

interface CourseDetailClientProps {
    courseId: string;
    isModal?: boolean;
}

export default function CourseDetailClient({ courseId, isModal = false }: CourseDetailClientProps) {
    const { course, loading, error } = useSingleCourse(courseId);
    const router = useRouter();

    // Close the page/modal on Esc key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                router.back();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [router]);

    // Ensure scrolling is disabled on the body when the modal is open
    useEffect(() => {
        if (isModal) {
            document.body.style.overflow = "hidden";
            return () => {
                document.body.style.overflow = "unset";
            };
        }
    }, [isModal]);

    const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            router.back();
        }
    };

    const containerClasses = isModal
        ? "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        : "min-h-screen bg-gray-50 flex items-center justify-center p-4";

    const cardClasses = isModal
        ? "bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative"
        : "bg-white w-full max-w-3xl rounded-2xl shadow-xl mt-8 mb-8 relative";

    return (
        <div className={containerClasses} onClick={isModal ? handleBackgroundClick : undefined}>
            <div className={cardClasses}>

                {/* Header Actions */}
                <div className="sticky top-0 bg-white/95 backdrop-blur-md p-4 border-b z-10 hidden sm:flex justify-between items-center rounded-t-2xl">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Go back"
                    >
                        <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
                    </button>
                    <div className="font-semibold text-gray-900 border px-3 py-1 rounded-full text-sm bg-gray-50">
                        {courseId}
                    </div>
                </div>

                <div className="p-6 sm:p-8">
                    {/* Mobile Back Button */}
                    <button
                        onClick={() => router.back()}
                        className="mb-6 flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors sm:hidden"
                    >
                        <ArrowLeftIcon className="w-4 h-4 mr-2" /> Back
                    </button>

                    {loading ? (
                        <div className="space-y-6 animate-pulse mt-4">
                            <div className="h-10 bg-gray-200 rounded w-2/3"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="space-y-3 pt-6 border-t mt-6">
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6 border border-red-200 shadow-sm">
                                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">{error}</h2>
                            <p className="text-gray-500 mb-8 max-w-sm mx-auto">We couldn't find the requested course details.</p>
                            <button
                                onClick={() => router.back()}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm hover:shadow"
                            >
                                Go Back
                            </button>
                        </div>
                    ) : course ? (
                        <div className="space-y-8 animate-in mt-2">

                            <div>
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
                                    <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
                                        {course.name}
                                    </h1>
                                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap shadow-sm">
                                        {course.creditHours} {course.creditHours === 1 ? 'Credit' : 'Credits'}
                                    </span>
                                </div>
                                <p className="text-lg font-medium text-gray-500">{course.subject} {course.number}</p>
                            </div>

                            <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed bg-gray-50 p-5 rounded-xl border border-gray-100">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">Description</h3>
                                {course.description || "No description provided."}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center">
                                        <svg className="w-4 h-4 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                        Prerequisites
                                    </h3>
                                    {course.prereqs && course.prereqs.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {course.prereqs.map((prereq, index) => (
                                                <Link
                                                    key={`prereq-${index}`}
                                                    href={`/courses/${prereq.replace(/\s+/g, '')}`}
                                                    className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-sm font-medium transition-colors cursor-pointer shadow-sm hover:shadow"
                                                >
                                                    {prereq}
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-sm italic py-2">None required</p>
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center">
                                        <svg className="w-4 h-4 mr-2 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                        Co-requisites
                                    </h3>
                                    {course.coreqs && course.coreqs.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {course.coreqs.map((coreq, index) => (
                                                <Link
                                                    key={`coreq-${index}`}
                                                    href={`/courses/${coreq.replace(/\\s+/g, '')}`}
                                                    className="px-3 py-1.5 bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 rounded-lg text-sm font-medium transition-colors cursor-pointer shadow-sm hover:shadow"
                                                >
                                                    {coreq}
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-sm italic py-2">None required</p>
                                    )}
                                </div>
                            </div>

                            {/* Class Sections Table */}
                            {course.sections && course.sections.length > 0 && (
                                <div className="mt-8 pt-6 border-t border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Class Sections Found
                                    </h3>
                                    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                                        <table className="w-full text-sm text-left align-middle">
                                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-4 py-3 font-semibold text-gray-600">CRN</th>
                                                    <th className="px-4 py-3 font-semibold text-gray-600">Meeting Times</th>
                                                    <th className="px-4 py-3 font-semibold text-gray-600">Seats</th>
                                                    <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Professor</th>
                                                    <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Location</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 bg-white">
                                                {course.sections.map((section, idx) => (
                                                    <tr key={idx} className="hover:bg-blue-50/50 transition-colors group">
                                                        <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                                                            {section.crn}
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-700">
                                                            {section.meetingTimes}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${section.seats.startsWith('0') || section.seats.includes('Full')
                                                                    ? 'bg-red-100 text-red-800'
                                                                    : 'bg-green-100 text-green-800'
                                                                }`}>
                                                                {section.seats}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-600 hidden sm:table-cell line-clamp-1 truncate max-w-[150px]">
                                                            {section.professor}
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                                                            {section.rooms} {section.campus !== 'Boston' && `(${section.campus})`}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            </div>
        </div >
    );
}
