import type { RenderBackendId, RenderConfig, TextElement, Theme } from "@doki-land/wordcloud-core";
import { WordCloudRenderer } from "@doki-land/wordcloud-renderer";
import { installDom } from "./lib/install-dom";
import { isDirectRun } from "./lib/is-direct-run";
import { bench, printResults, type BenchResult } from "./lib/timing";

const THEME: Theme = {
    name: "bench",
    colors: [
        { r: 51, g: 122, b: 183 },
        { r: 92, g: 184, b: 92 },
        { r: 240, g: 173, b: 78 },
        { r: 217, g: 83, b: 79 },
    ],
    backgroundColor: { r: 255, g: 255, b: 255 },
    fontFamilies: ["Arial"],
    fontWeights: ["normal", "bold"],
};

const RENDER_BACKENDS: RenderBackendId[] = ["cpu-canvas", "cpu-svg", "webgpu"];
const ELEMENT_COUNTS = [50, 100, 200] as const;

function sampleElements(count: number): TextElement[] {
    const rotations = [0, 45, -45, 90];

    return Array.from({ length: count }, (_, index) => ({
        id: `text-${index}`,
        type: "text",
        text: `word-${index}`,
        x: 40 + (index % 12) * 60,
        y: 40 + Math.floor(index / 12) * 44,
        width: 64,
        height: 20,
        rotation: rotations[index % rotations.length],
        frequency: 1 - index / count,
        fontSize: 12 + (index % 5) * 4,
        fontFamily: "Arial",
        fontWeight: index % 3 === 0 ? "bold" : "normal",
        canColor: true,
    }));
}

function createSurface(backend: RenderBackendId): HTMLCanvasElement | SVGElement {
    if (backend === "cpu-svg") {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "800");
        svg.setAttribute("height", "600");
        return svg;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    return canvas;
}

function tryBenchBackend(backend: RenderBackendId, elementCount: number, iterations: number): BenchResult | null {
    try {
        const surface = createSurface(backend);
        const config: RenderConfig = {
            theme: THEME,
            backend,
            progressive: false,
            animationSpeed: 100,
        };

        const elements = sampleElements(elementCount);
        const renderer = new WordCloudRenderer(surface, config);
        renderer.setElements(elements);

        // Warm-up: allocate backend + first paint outside timed samples.
        renderer.render();

        return bench(`renderer/${backend}/${elementCount}-elements`, iterations, () => {
            renderer.reset();
            renderer.setElements(elements);
            renderer.render();
        });
    } catch (error) {
        console.warn(
            `renderer/${backend}/${elementCount}-elements skipped:`,
            error instanceof Error ? error.message : error,
        );
        return null;
    }
}

export function runRendererBenchmarks(iterations = 5): BenchResult[] {
    const canvasAvailable = installDom();

    const results: BenchResult[] = [];

    for (const backend of RENDER_BACKENDS) {
        if ((backend === "cpu-canvas" || backend === "webgpu") && !canvasAvailable) {
            console.warn(`renderer/${backend} skipped: canvas native module not built`);
            continue;
        }

        for (const elementCount of ELEMENT_COUNTS) {
            const result = tryBenchBackend(backend, elementCount, iterations);
            if (result) {
                results.push(result);
            }
        }
    }

    printResults(results);
    return results;
}

if (isDirectRun(import.meta.url)) {
    const iterations = Number.parseInt(process.env.BENCH_ITERATIONS ?? "5", 10);
    runRendererBenchmarks(iterations);
}
