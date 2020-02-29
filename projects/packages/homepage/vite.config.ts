import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import UnoCSS from "unocss/vite";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [
        vue(),
        UnoCSS(),
        AutoImport({
            imports: ["vue", "@vueuse/core", "vitest"],
            dts: true,
        }),
        Components({
            dts: true,
        }),
    ],
    resolve: {
        alias: {
            "@": resolve(__dirname, "src"),
            "@doki-land/wordcloud": resolve(__dirname, "../wordcloud/src"),
            "@doki-land/wordcloud-core": resolve(__dirname, "../wordcloud-core/src"),
            "@doki-land/wordcloud-loader": resolve(__dirname, "../wordcloud-loader/src"),
            "@doki-land/wordcloud-layout": resolve(__dirname, "../wordcloud-layout/src"),
            "@doki-land/wordcloud-renderer": resolve(__dirname, "../wordcloud-renderer/src"),
            "@doki-land/wordcloud-element": resolve(__dirname, "../wordcloud-element/src"),
        },
    },
    test: {
        globals: true,
        environment: "jsdom",
    },
    server: {
        port: 3000,
        open: true,
    },
    build: {
        outDir: "dist",
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    "element-plus": ["element-plus"],
                    "vue-vendor": ["vue", "@vueuse/core"],
                },
            },
        },
    },
});
