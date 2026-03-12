"use client";

/**
 * @fileoverview Route protection wrapper component.
 *
 * Wraps authenticated pages to redirect unauthenticated users to /login.
 * Shows a loading spinner while auth state is being determined.
 */

import { useAuth } from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Protects child components from unauthenticated access.
 * Redirects to /login if no user is present after the auth check completes.
 *
 * @param children - Protected page content to render when authenticated
 * @returns Loading spinner, null (while redirecting), or the wrapped children
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    // Optionally show a loading spinner here while determining auth state
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
        );
    }

    // If not loading and no user, we will redirect, so return null
    if (!user) {
        return null;
    }

    return <>{children}</>;
}
