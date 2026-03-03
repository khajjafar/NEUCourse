import Link from "next/link";
import React from "react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-extrabold text-red-600 tracking-tight sm:text-6xl mb-6">
          NEUCourse
        </h1>
        <p className="text-xl text-gray-600 mb-10">
          The all-in-one degree planning and scheduling tool for Northeastern students.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="w-full sm:w-auto flex justify-center py-3 px-8 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="w-full sm:w-auto flex justify-center py-3 px-8 border border-red-600 rounded-md shadow-sm text-base font-medium text-red-600 bg-white hover:bg-gray-50"
          >
            Sign Up
          </Link>
          <Link
            href="/courses"
            className="w-full sm:w-auto flex justify-center py-3 px-8 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Browse Courses
          </Link>
        </div>
      </div>
    </main>
  );
}
