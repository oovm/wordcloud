<template>
    <div class="app">
        <div class="app-content">
            <div class="control-panel">
                <ControlPanel
                    :config="config"
                    @update:config="updateConfig"
                    @words-analyzed="handleWordsAnalyzed"
                    @generate="generateWordCloud"
                    @export="exportWordCloud"
                />
            </div>

            <div class="canvas-container">
                <WordCloudCanvas
                    ref="canvasRef"
                    :config="config"
                    :elements="elements"
                    :is-generating="isGenerating"
                    :progress="progress"
                    :render-time="lastRenderMs"
                    @export="exportWordCloud"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { reactive, ref } from "vue";
    import ControlPanel from "./components/ControlPanel.vue";
    import WordCloudCanvas from "./components/WordCloudCanvas.vue";
    import { layoutWordCloud, type AnalyzedWord } from "./lib/wordcloud-bridge";
    import type { WordCloudConfig, WordCloudElement } from "./types";

    const canvasRef = ref<InstanceType<typeof WordCloudCanvas>>();
    const isGenerating = ref(false);
    const progress = ref(0);
    const lastRenderMs = ref(0);
    const analyzedWords = ref<AnalyzedWord[]>([]);
    const elements = ref<WordCloudElement[]>([]);

    const config = reactive<WordCloudConfig>({
        width: 800,
        height: 600,
        fontFamily: "'Microsoft YaHei', sans-serif",
        fontSizeRange: [14, 56],
        rotationRange: [-45, 45],
        rotationMode: "range",
        backgroundColor: "#ffffff",
        colorScheme: "default",
        layoutAlgorithm: "spiral",
        padding: 12,
        spiral: "archimedean",
        enableAnimation: false,
        animationType: "fade",
        animationDuration: 1000,
        progressiveRendering: false,
    });

    function updateConfig(newConfig: WordCloudConfig) {
        Object.assign(config, newConfig);
    }

    function handleWordsAnalyzed(words: AnalyzedWord[]) {
        analyzedWords.value = words;
    }

    async function generateWordCloud() {
        if (analyzedWords.value.length === 0) {
            alert("请先在左侧输入文本并完成分析");
            return;
        }

        isGenerating.value = true;
        progress.value = 10;

        try {
            progress.value = 40;
            const result = await layoutWordCloud(analyzedWords.value, config);
            progress.value = 90;
            elements.value = result.elements;
            lastRenderMs.value = result.durationMs;
            progress.value = 100;

            if (result.placedCount === 0) {
                alert("未能放置任何词语，请缩小词数或调整画布尺寸");
            } else if (result.placedCount < result.totalCount) {
                console.warn(`已放置 ${result.placedCount}/${result.totalCount} 个词语`);
            }
        } catch (error) {
            console.error("词云生成失败:", error);
            alert(error instanceof Error ? error.message : "词云生成失败，请重试");
        } finally {
            isGenerating.value = false;
        }
    }

    function exportWordCloud(format: "png" | "svg") {
        canvasRef.value?.exportWordCloud({
            format,
            scale: 2,
            transparent: false,
            quality: 0.92,
        });
    }
</script>

<style>
    .app {
        height: 100vh;
        overflow: hidden;
        background: #f3f4f6;
    }

    .app-content {
        display: flex;
        height: 100%;
    }

    .control-panel {
        flex-shrink: 0;
        height: 100%;
        overflow: hidden;
    }

    .canvas-container {
        flex: 1;
        min-width: 0;
        height: 100%;
        padding: 1rem;
        overflow: auto;
    }
</style>
