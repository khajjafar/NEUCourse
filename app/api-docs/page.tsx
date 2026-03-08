'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocsPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">NEUCourse API Docs</h1>
        <p className="text-gray-500 mb-6">
          Interactive REST API reference. Authenticated endpoints require a Firebase JWT —
          paste your token into the <strong>Authorize</strong> dialog.
        </p>
      </div>
      <SwaggerUI url="/api/swagger" />
    </main>
  );
}
