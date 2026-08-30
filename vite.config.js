import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        babel({ presets: [reactCompilerPreset()] })
    ],
    resolve: {
        alias: {
            // 👈 Maps the "@config" keyword to your actual config folder
            '@config': path.resolve(__dirname, './config'),
        },
    },
});
// COMMENT-TO-REPLACE
