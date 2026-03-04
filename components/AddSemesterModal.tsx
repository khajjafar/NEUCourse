import React, { useState, useEffect, FormEvent } from 'react';

interface AddSemesterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (name: string) => Promise<void>;
    isAdding: boolean;
}

export default function AddSemesterModal({ isOpen, onClose, onAdd, isAdding }: AddSemesterModalProps) {
    const [name, setName] = useState('');

    useEffect(() => {
        if (isOpen) {
            setName('');
        }
    }, [isOpen]);

    // Close on escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        await onAdd(name);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 p-4 sm:p-0">
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                    <h3 className="text-lg font-bold text-gray-900">
                        Add Semester
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="semesterName" className="block text-sm font-medium text-gray-700 mb-1">
                            Semester Name
                        </label>
                        <input
                            type="text"
                            id="semesterName"
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2 border"
                            placeholder="E.g. Fall 2026"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isAdding}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isAdding || !name.trim()}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:bg-indigo-400 transition"
                        >
                            {isAdding ? 'Adding...' : 'Add'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
