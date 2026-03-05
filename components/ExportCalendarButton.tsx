import React, { useState, useRef, useEffect } from 'react';
import { CalendarEvent } from '@/hooks/useCalendarEvents';
import { generateICSFile, downloadICSFile } from '@/lib/ics-export';

interface ExportCalendarButtonProps {
    events: CalendarEvent[];
}

// Utility to get the next Monday's date for defaults
const getNextMonday = () => {
    const d = new Date();
    d.setDate(d.getDate() + ((1 + 7 - d.getDay()) % 7 || 7));
    return d.toISOString().split('T')[0];
};

export default function ExportCalendarButton({ events }: ExportCalendarButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [startDate, setStartDate] = useState(getNextMonday());
    const [weeks, setWeeks] = useState(15);
    const popoverRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    const handleConfirm = () => {
        setIsOpen(false);
        const start = new Date(startDate);

        // We use UTC dates for semester limits to avoid timezone offset shifts on boundaries
        // Convert the input YYYY-MM-DD local to a neutral Date object pointing to that exact day
        const neutralStart = new Date(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());

        const fileContent = generateICSFile(events, neutralStart, weeks);

        if (fileContent) {
            downloadICSFile(fileContent, 'calendar-export.ics');
        } else {
            console.error('Failed to generate ICS file content.');
            alert('Failed to generate export file. Ensure events have days and times configured.');
        }
    };

    const isDisabled = !events || events.length === 0;

    return (
        <div className="relative inline-block text-left" ref={popoverRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                disabled={isDisabled}
                className={`inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white transition-colors
                    ${isDisabled
                        ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm'
                    }`}
            >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export Calendar
            </button>

            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                    <div className="p-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Export Settings</h3>

                        <div className="mb-4">
                            <label htmlFor="semesterStartDate" className="block text-sm font-medium text-gray-700 mb-1">
                                Semester Start Date
                            </label>
                            <input
                                type="date"
                                id="semesterStartDate"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div className="mb-6">
                            <label htmlFor="weekCount" className="block text-sm font-medium text-gray-700 mb-1">
                                Number of Weeks
                            </label>
                            <input
                                type="number"
                                id="weekCount"
                                min="1"
                                max="52"
                                value={weeks}
                                onChange={(e) => setWeeks(parseInt(e.target.value, 10))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Confirm Export
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
