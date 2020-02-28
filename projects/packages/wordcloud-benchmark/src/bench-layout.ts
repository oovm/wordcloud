import type { LayoutConfig, WordFrequency } from "@doki-land/wordcloud-core";
import { LayoutEngine } from "@doki-land/wordcloud-layout";
import { bench, printResults, type BenchResult } from "./lib/timing";

const LAYOUT_CONFIG: LayoutConfig = {
    width: 800,
    height: 600,
    padding: 20,
    rotations: [0, 90, -90],
    spiral: "archimedean",
    maxAttempts: 1000,
    minFontSize: 12,
    maxFontSize: 60,
};

function sampleWords(count: number): WordFrequency[] {
    return Array.from({ length: count }, (_, index) => ({
        word: `word-${index}`,
        frequency: count - index,
    }));
}

export function runLayoutBenchmarks(iterations = 5): BenchResult[] {
    const engine = new LayoutEngine(LAYOUT_CONFIG);
    const words50 = sampleWords(50);
    const words100 = sampleWords(100);

    const results = [
        bench("layout/50-words", iterations, () => {
            engine.layout(words50);
        }),
        bench("layout/100-words", iterations, () => {
            engine.layout(words100);
        }),
    ];

    printResults(results);
    return results;
}

if (import.meta.url === new URL(process.argv[1], "file:").href) {
    runLayoutBenchmarks();
}
