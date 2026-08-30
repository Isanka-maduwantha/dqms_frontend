import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        babel({ presets: [reactCompilerPreset()] })
    ],
    resolve: {
        alias: {
            // Maps the "@config" keyword to your actual config folder
            '@config': fileURLToPath(new URL('./config', import.meta.url)),
        },
    },
});
// COMMENT-TO-REPLACE
