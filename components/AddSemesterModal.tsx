'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import { usePlanDetails } from '@/hooks/usePlanDetails';

interface AddSemesterModalProps {
    planId: string | null;
    isOpen: boolean;
    onClose: () => void;
    addSemester: (name: string, order: number) => Promise<void>;
    currentSemesterCount: number;
}

export default function AddSemesterModal({ planId, isOpen, onClose, addSemester, currentSemesterCount }: AddSemesterModalProps) {
    const [newSemesterName, setNewSemesterName] = useState('');
    const [isCreatingSem, setIsCreatingSem] = useState(false);

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    const handleAddSemester = async (e: FormEvent) => {
        e.preventDefault();
        if (!newSemesterName.trim()) return;

        try {
            setIsCreatingSem(true);
            const order = currentSemesterCount + 1;
            await addSemester(newSemesterName, order);
            setNewSemesterName('');
            onClose();
        } catch (err) {
            console.error('Failed to add semester:', err);
            alert('Failed to add semester.');
        } finally {
            setIsCreatingSem(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                    <h3 className="text-lg font-bold text-gray-900">Add Semester</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleAddSemester}>
                    <div className="mb-4">
                        <label htmlFor="semesterName" className="block text-sm font-medium text-gray-700 mb-1">
                            Semester Name
                        </label>
                        <input
                            type="text"
                            id="semesterName"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                            placeholder="E.g. Fall 2026"
                            value={newSemesterName}
                            onChange={(e) => setNewSemesterName(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isCreatingSem || !newSemesterName.trim()}
                            className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isCreatingSem ? 'Adding...' : 'Add Semester'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
