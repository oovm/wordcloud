import { JSDOM } from "jsdom";
import type { RenderBackendId, RenderConfig, TextElement, Theme } from "@doki-land/wordcloud-core";
import { WordCloudRenderer } from "@doki-land/wordcloud-renderer";
import { bench, printResults, type BenchResult } from "./lib/timing";

const THEME: Theme = {
    name: "bench",
    colors: [
        { r: 51, g: 122, b: 183 },
        { r: 92, g: 184, b: 92 },
        { r: 240, g: 173, b: 78 },
    ],
    backgroundColor: { r: 255, g: 255, b: 255 },
    fontFamilies: ["Arial"],
    fontWeights: ["normal"],
};

function sampleElements(count: number): TextElement[] {
    return Array.from({ length: count }, (_, index) => ({
        id: `text-${index}`,
        type: "text",
        text: `word-${index}`,
        x: 40 + (index % 10) * 70,
        y: 40 + Math.floor(index / 10) * 50,
        width: 64,
        height: 20,
        rotation: 0,
        frequency: 1,
        fontSize: 16,
        fontFamily: "Arial",
        fontWeight: "normal",
        canColor: true,
    }));
}

function installDom(): void {
    const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
    const { window } = dom;

    globalThis.window = window as Window & typeof globalThis;
    globalThis.document = window.document;
    globalThis.HTMLCanvasElement = window.HTMLCanvasElement;
    globalThis.SVGElement = window.SVGElement;
    globalThis.Image = window.Image;
    globalThis.XMLSerializer = window.XMLSerializer;
    globalThis.btoa = window.btoa.bind(window);
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

function benchBackend(backend: RenderBackendId, elementCount: number, iterations: number): BenchResult {
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

    return bench(`renderer/${backend}/${elementCount}-elements`, iterations, () => {
        renderer.reset();
        renderer.setElements(elements);
        renderer.render();
    });
}

export function runRendererBenchmarks(iterations = 5): BenchResult[] {
    installDom();

    const results = [
        benchBackend("cpu-canvas", 50, iterations),
        benchBackend("cpu-canvas", 100, iterations),
        benchBackend("cpu-svg", 50, iterations),
    ];

    printResults(results);
    return results;
}

if (import.meta.url === new URL(process.argv[1], "file:").href) {
    runRendererBenchmarks();
}
