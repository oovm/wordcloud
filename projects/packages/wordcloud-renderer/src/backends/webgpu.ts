import type { RenderBackend, RenderConfig, WordCloudElement } from "@doki-land/wordcloud-core";
import { CpuCanvasRenderBackend } from "./cpu-canvas";

/**
 * WebGPU render backend (stub).
 * Delegates to CPU canvas until a GPU pipeline is wired.
 */
export class WebGpuRenderBackend implements RenderBackend {
    readonly id = "webgpu" as const;
    private fallback: CpuCanvasRenderBackend | undefined;
    private readonly canvas: HTMLCanvasElement | undefined;
    private readonly config: RenderConfig;
    private initialized = false;
    private gpuAvailable = false;

    constructor(surface: HTMLCanvasElement | SVGElement, config: RenderConfig) {
        this.config = config;
        if (surface instanceof HTMLCanvasElement) {
            this.canvas = surface;
        }
    }

    private ensureInit(): void {
        if (this.initialized) {
            return;
        }
        this.initialized = true;

        if (typeof navigator !== "undefined" && "gpu" in navigator && this.canvas) {
            this.gpuAvailable = true;
            this.fallback = new CpuCanvasRenderBackend(this.canvas, this.config);
            return;
        }

        if (this.canvas) {
            this.fallback = new CpuCanvasRenderBackend(this.canvas, this.config);
        }
    }

    clear(): void {
        this.ensureInit();
        this.fallback?.clear();
    }

    drawElement(element: WordCloudElement): void {
        this.ensureInit();
        if (!this.fallback) {
            throw new Error("webgpu backend requires an HTMLCanvasElement surface");
        }
        this.fallback.drawElement(element);
    }

    getOutput(): HTMLCanvasElement | SVGElement {
        this.ensureInit();
        if (!this.fallback) {
            throw new Error("webgpu backend requires an HTMLCanvasElement surface");
        }
        return this.fallback.getOutput();
    }

    getImageData(): ImageData | Promise<ImageData> {
        this.ensureInit();
        if (!this.fallback) {
            throw new Error("webgpu backend requires an HTMLCanvasElement surface");
        }
        return this.fallback.getImageData();
    }

    /** Whether WebGPU adapter is available (pipeline still uses CPU fallback). */
    isGpuAvailable(): boolean {
        this.ensureInit();
        return this.gpuAvailable;
    }
}
