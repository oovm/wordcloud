import type { LayoutConfig, WordFrequency } from "@doki-land/wordcloud-core";
import { LayoutEngine } from "@doki-land/wordcloud-layout";
import { isDirectRun } from "./lib/is-direct-run";
import { bench, printResults, type BenchResult } from "./lib/timing";

const BASE_LAYOUT_CONFIG: Omit<LayoutConfig, "spiral" | "rotations"> = {
    width: 800,
    height: 600,
    padding: 20,
    maxAttempts: 1000,
    minFontSize: 12,
    maxFontSize: 60,
};

const SPIRAL_MODES: LayoutConfig["spiral"][] = ["archimedean", "rectangular"];

const ROTATION_PROFILES: Array<{ id: string; rotations: number[] }> = [
    { id: "rot-3", rotations: [0, 90, -90] },
    { id: "rot-1", rotations: [0] },
    { id: "rot-5", rotations: [0, 45, -45, 90, -90] },
];

const WORD_COUNTS = [50, 100, 200] as const;

const WORD_POOL = [
    "词云",
    "可视化",
    "layout",
    "spiral",
    "quadtree",
    "数据",
    "analysis",
    "wordcloud",
    "performance",
    "benchmark",
];

function sampleWords(count: number): WordFrequency[] {
    return Array.from({ length: count }, (_, index) => ({
        word: index < WORD_POOL.length ? WORD_POOL[index] : `${WORD_POOL[index % WORD_POOL.length]}-${index}`,
        frequency: count - index,
    }));
}

type LayoutProfile = {
    id: string;
    config: LayoutConfig;
};

function buildLayoutProfiles(): LayoutProfile[] {
    const profiles: LayoutProfile[] = [];

    for (const spiral of SPIRAL_MODES) {
        for (const rotationProfile of ROTATION_PROFILES) {
            profiles.push({
                id: `${spiral}/${rotationProfile.id}`,
                config: {
                    ...BASE_LAYOUT_CONFIG,
                    spiral,
                    rotations: rotationProfile.rotations,
                },
            });
        }
    }

    return profiles;
}

function benchLayoutProfile(
    profile: LayoutProfile,
    wordCount: number,
    iterations: number,
): BenchResult {
    const engine = new LayoutEngine(profile.config);
    const words = sampleWords(wordCount);

    // Warm-up placement outside timed samples.
    engine.layout(words);

    return bench(`layout/${profile.id}/${wordCount}-words`, iterations, () => {
        engine.layout(words);
    });
}

export function runLayoutBenchmarks(iterations = 5): BenchResult[] {
    const profiles = buildLayoutProfiles();
    const results: BenchResult[] = [];

    for (const profile of profiles) {
        for (const wordCount of WORD_COUNTS) {
            results.push(benchLayoutProfile(profile, wordCount, iterations));
        }
    }

    printResults(results);
    return results;
}

if (isDirectRun(import.meta.url)) {
    const iterations = Number.parseInt(process.env.BENCH_ITERATIONS ?? "5", 10);
    runLayoutBenchmarks(iterations);
}
