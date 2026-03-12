"use client";

/**
 * @fileoverview Firebase authentication context and hook.
 *
 * Provides the AuthProvider component (wrap the app root with this) and the
 * useAuth hook for accessing the current user, loading state, and logout helper.
 * The Firebase JWT is never stored outside React context — no localStorage/cookies.
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import {
    onAuthStateChanged,
    User,
    signOut as firebaseSignOut,
    setPersistence,
    browserLocalPersistence
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { useRouter } from "next/navigation";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    logout: async () => { },
});

/**
 * Provides Firebase auth state to the component tree.
 * Sets persistence to browserLocalPersistence and listens for auth state changes.
 *
 * @param children - React subtree that needs access to auth context
 * @returns Context provider with current user, loading state, and logout function
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Explicitly set persistence to fix multi-window issues
        setPersistence(auth, browserLocalPersistence).catch((error) => {
            console.error("Failed to set Firebase Auth persistence:", error);
        });

        // Unsubscribe from auth state changes when unmounting
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        try {
            await firebaseSignOut(auth);
            router.push("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Returns the current auth context: user, loading state, and logout function.
 * Must be used inside an AuthProvider.
 *
 * @returns AuthContextType with user (Firebase User or null), loading boolean, and logout function
 */
export const useAuth = () => useContext(AuthContext);
