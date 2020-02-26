import type { RenderConfig, WordCloudElement } from "@doki-land/wordcloud-core";
import { createRenderBackend } from "./registry";
import { CpuCanvasRenderBackend } from "./backends/cpu-canvas";
import { CpuSvgRenderBackend } from "./backends/cpu-svg";

/** @deprecated Use `RenderBackend` from `@doki-land/wordcloud-core`. */
export type CanvasRenderer = {
    getCanvas(): HTMLCanvasElement | SVGElement;
    clear(): void;
    drawElement(element: WordCloudElement): void;
    getImageData(): ImageData | Promise<ImageData>;
};

/** Canvas 2D backend (re-export for backward compatibility). */
export class CanvasWordCloudRenderer extends CpuCanvasRenderBackend {
    getCanvas(): HTMLCanvasElement {
        return this.getOutput();
    }
}

/** SVG DOM backend (re-export for backward compatibility). */
export class SVGWordCloudRenderer extends CpuSvgRenderBackend {
    getCanvas(): SVGElement {
        return this.getOutput();
    }
}

/**
 * Word cloud renderer — progressive or batch, backend-selectable.
 */
export class WordCloudRenderer<T extends HTMLCanvasElement | SVGElement = HTMLCanvasElement | SVGElement> {
    private backend: ReturnType<typeof createRenderBackend>;
    private elements: WordCloudElement[] = [];
    private currentIndex = 0;
    private readonly isProgressive: boolean;

    constructor(surface: T, config: RenderConfig) {
        this.isProgressive = config.progressive;
        this.backend = createRenderBackend(surface, config);
    }

    setElements(elements: WordCloudElement[]): void {
        this.elements = elements;
        this.currentIndex = 0;
    }

    getBackendId(): string {
        return this.backend.id;
    }

    render(): T {
        this.backend.clear();

        for (const element of this.elements) {
            this.backend.drawElement(element);
        }

        return this.backend.getOutput() as T;
    }

    nextFrame(): T | null {
        if (!this.isProgressive || this.currentIndex >= this.elements.length) {
            return null;
        }

        if (this.currentIndex === 0) {
            this.backend.clear();
        }

        this.backend.drawElement(this.elements[this.currentIndex]);
        this.currentIndex++;

        return this.backend.getOutput() as T;
    }

    reset(): void {
        this.currentIndex = 0;
    }

    isComplete(): boolean {
        return this.currentIndex >= this.elements.length;
    }

    getProgress(): number {
        if (this.elements.length === 0) return 1;
        return this.currentIndex / this.elements.length;
    }
}
