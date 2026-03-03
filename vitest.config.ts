import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './setupTests.ts',
        css: false,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'text-summary'],
            exclude: [
                'node_modules/**',
                '.next/**',
                '**/*.config.*',
                'app/layout.tsx',
                '**/*.css',
            ]
        }
    },
    resolve: {
        alias: [
            { find: '@', replacement: path.resolve(__dirname, './') }
        ]
    }
})
