'use client';

/**
 * @fileoverview Modal for managing the user's graduation requirements (CRUD). Maintains a local
 * copy of requirements until saved to avoid partial writes.
 */

import React, { useState, useEffect } from 'react';
import { XMarkIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { GraduationRequirement } from '@/hooks/usePlans';

interface GraduationRequirementsModalProps {
    isOpen: boolean;
    onClose: () => void;
    requirements: GraduationRequirement[] | undefined;
    updateRequirements: (requirements: GraduationRequirement[]) => Promise<void>;
}

/**
 * Modal that lets users add and remove graduation requirement categories, then persists them
 * via updateRequirements.
 * @param props - Component props
 * @param props.isOpen - Whether the modal is visible
 * @param props.onClose - Callback to dismiss the modal
 * @param props.requirements - Current array of graduation requirements from the plan
 * @param props.updateRequirements - Async mutation to persist the updated requirements list
 * @returns The modal dialog, or null when closed
 */
export default function GraduationRequirementsModal({
    isOpen,
    onClose,
    requirements,
    updateRequirements
}: GraduationRequirementsModalProps) {
    const [localReqs, setLocalReqs] = useState<GraduationRequirement[]>([]);
    const [newName, setNewName] = useState('');
    const [newCount, setNewCount] = useState<number | ''>('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLocalReqs(requirements ? [...requirements] : []);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setNewName('');
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setNewCount('');
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setError(null);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsSaving(false);
        }
    }, [isOpen, requirements]);

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = newName.trim();
        if (!trimmedName || newCount === '' || newCount <= 0) return;

        const newReq: GraduationRequirement = {
            id: crypto.randomUUID(),
            name: trimmedName,
            count: Number(newCount)
        };

        setLocalReqs([...localReqs, newReq]);
        setNewName('');
        setNewCount('');
    };

    const handleRemove = (idToRemove: string) => {
        setLocalReqs(localReqs.filter(r => r.id !== idToRemove));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        try {
            await updateRequirements(localReqs);
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Unknown error occurred.');
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-in zoom-in-95 duration-200 text-left">
                <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                    <h3 className="text-lg font-bold text-gray-900">Graduation Requirements</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 rounded-md bg-red-50 p-3">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Current Requirements</h4>
                    {localReqs.length === 0 ? (
                        <p className="text-sm text-gray-500 italic px-2 py-4 border-2 border-dashed border-gray-200 rounded-md text-center">
                            No requirements added yet.
                        </p>
                    ) : (
                        <ul className="space-y-2 border border-gray-200 rounded-md p-3 max-h-48 overflow-y-auto bg-gray-50/50">
                            {localReqs.map((req) => (
                                <li key={req.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 last:pb-0">
                                    <div className="flex items-center">
                                        <span className="text-sm font-bold text-gray-900">{req.name}</span>
                                        <span className="ml-3 inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-600/20">
                                            {req.count} required
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemove(req.id)}
                                        className="text-gray-400 hover:text-red-600 bg-white p-1 rounded border border-transparent hover:border-red-200 transition-all"
                                        title="Remove requirement"
                                    >
                                        <TrashIcon className="h-4 w-4" aria-hidden="true" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <form onSubmit={handleAdd} className="mt-4 border-t border-gray-200 pt-5">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Add New Requirement</h4>
                    <div className="flex gap-2 items-start">
                        <div className="flex-1">
                            <label htmlFor="req-name" className="sr-only">Requirement Name</label>
                            <input
                                type="text"
                                id="req-name"
                                placeholder="e.g. Electives, GenEd"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                            />
                        </div>
                        <div className="w-24">
                            <label htmlFor="req-count" className="sr-only">Count</label>
                            <input
                                type="number"
                                id="req-count"
                                min="1"
                                placeholder="Count"
                                value={newCount}
                                onChange={(e) => setNewCount(e.target.value === '' ? '' : Number(e.target.value))}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!newName.trim() || newCount === '' || newCount <= 0}
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <PlusIcon className="h-4 w-4 mr-1 -ml-1" />
                            Add
                        </button>
                    </div>
                </form>

                <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        onClick={onClose}
                        disabled={isSaving}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}
