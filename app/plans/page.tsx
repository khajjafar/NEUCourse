'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePlans } from '@/hooks/usePlans';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PlansPage() {
    const { user, loading: authLoading } = useAuth();
    const { plans, loading: plansLoading, error, createPlan, deletePlan, renamePlan } = usePlans();
    const router = useRouter();

    const [newPlanName, setNewPlanName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');
    const [isRenaming, setIsRenaming] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const handleCreatePlan = async (e: FormEvent) => {
        e.preventDefault();
        if (!newPlanName.trim()) return;

        try {
            setIsCreating(true);
            await createPlan(newPlanName);
            setNewPlanName('');
        } catch (err) {
            console.error('Failed to create plan:', err);
            alert('Failed to create plan.');
        } finally {
            setIsCreating(false);
        }
    };

    const handleRename = async (planId: string) => {
        if (!renameValue.trim()) return;
        try {
            setIsRenaming(true);
            await renamePlan(planId, renameValue.trim());
            setRenamingId(null);
        } catch (err: unknown) {
            console.error('Failed to rename plan:', err);
            if (err instanceof Error) {
                alert(err.message);
            } else {
                alert('Failed to rename plan.');
            }
        } finally {
            setIsRenaming(false);
        }
    };

    if (authLoading || (!user && !authLoading)) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
                <div className="animate-pulse flex items-center space-x-4">
                    <div className="h-6 w-6 bg-indigo-500 rounded-full"></div>
                    <div className="text-lg font-medium text-gray-500">Loading your plans...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="md:flex md:items-center md:justify-between mb-8">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                            My Degree Plans
                        </h2>
                    </div>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-4 mb-6">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error loading plans</h3>
                                <div className="mt-2 text-sm text-red-700">{error}</div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white shadow sm:rounded-lg overflow-hidden mb-8 border border-gray-200">
                    <div className="px-4 py-5 sm:p-6 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Create a new plan
                        </h3>
                        <div className="mt-2 max-w-xl text-sm text-gray-500">
                            <p>Give your degree tracking plan a distinct name (e.g. Master CS Track).</p>
                        </div>
                        <form className="mt-5 sm:flex sm:items-center" onSubmit={handleCreatePlan}>
                            <div className="w-full sm:max-w-xs">
                                <label htmlFor="planName" className="sr-only">Plan name</label>
                                <input
                                    type="text"
                                    name="planName"
                                    id="planName"
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                                    placeholder="E.g. Full Stack Engineering"
                                    value={newPlanName}
                                    onChange={(e) => setNewPlanName(e.target.value)}
                                    disabled={isCreating}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isCreating}
                                className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                            >
                                {isCreating ? 'Creating...' : 'Create Plan'}
                            </button>
                        </form>
                    </div>

                    {plansLoading ? (
                        <div className="p-8 flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : plans.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            You haven't created any degree plans yet.
                        </div>
                    ) : (
                        <ul role="list" className="divide-y divide-gray-200">
                            {plans.map((plan) => (
                                <li key={plan.id}>
                                    <div className="px-4 py-4 flex items-center sm:px-6 hover:bg-gray-50 transition-colors">
                                        <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                                            <div className="truncate">
                                                <div className="flex text-sm w-full">
                                                    {renamingId === plan.id ? (
                                                        <div className="flex items-center space-x-2 w-full">
                                                            <input
                                                                type="text"
                                                                autoFocus
                                                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-1 px-2 border"
                                                                value={renameValue}
                                                                onChange={(e) => setRenameValue(e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') handleRename(plan.id);
                                                                    if (e.key === 'Escape') setRenamingId(null);
                                                                }}
                                                                disabled={isRenaming}
                                                            />
                                                            <button
                                                                onClick={() => handleRename(plan.id)}
                                                                disabled={isRenaming}
                                                                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                onClick={() => setRenamingId(null)}
                                                                disabled={isRenaming}
                                                                className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <p className="font-semibold text-indigo-600 hover:text-indigo-800 truncate">
                                                            <Link href={`/plans/${plan.id}`}>
                                                                {plan.name}
                                                            </Link>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ml-5 flex-shrink-0 flex items-center space-x-4">
                                            {renamingId !== plan.id && (
                                                <button
                                                    onClick={() => {
                                                        setRenamingId(plan.id);
                                                        setRenameValue(plan.name);
                                                    }}
                                                    className="text-gray-500 hover:text-indigo-600 text-sm font-medium"
                                                    aria-label={`Rename ${plan.name}`}
                                                >
                                                    Rename
                                                </button>
                                            )}
                                            <Link
                                                href={`/plans/${plan.id}`}
                                                className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                            >
                                                View
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm(`Are you sure you want to delete "${plan.name}"?`)) {
                                                        deletePlan(plan.id).catch(err => alert(err.message));
                                                    }
                                                }}
                                                className="text-red-500 hover:text-red-700"
                                                aria-label={`Delete ${plan.name}`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
