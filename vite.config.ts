import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
    plugins: [
        svgr(),
        react(),
        VitePWA({
            registerType: "autoUpdate",
            strategies: "injectManifest",
            injectManifest: {
                globPatterns: ["**/*.{html,js,css,svg,png,ico,webp,woff2}"],
                maximumFileSizeToCacheInBytes: 8 * 1024 * 1024, // 8 MiB
            },
            srcDir: "src",
            filename: "sw.ts",
            injectRegister: "auto",
            devOptions: {
                enabled: true,
                type: "module",
            },
            manifest: {
                name: "Build - Kydas",
                short_name: "Build - Kydas",
                start_url: "/",
                display: "standalone",
                background_color: "#ffffff",
                theme_color: "#ffffff",
                icons: [],
            },
        }),
    ],
    define: {
        global: {},
    },
    server: {
        port: 3000,
        open: true,
    },
    build: {
        rollupOptions: {
            output: {},
        },
    },
    resolve: {
        alias: {
            src: "/src",
        },
    },
});
