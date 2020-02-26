import type { RenderBackend, RenderBackendId, RenderConfig } from "@doki-land/wordcloud-core";
import { CpuCanvasRenderBackend } from "./backends/cpu-canvas";
import { CpuSvgRenderBackend } from "./backends/cpu-svg";
import { WebGpuRenderBackend } from "./backends/webgpu";

export type RenderBackendFactory = (surface: HTMLCanvasElement | SVGElement, config: RenderConfig) => RenderBackend;

const factories = new Map<RenderBackendId, RenderBackendFactory>([
    [
        "cpu-canvas",
        (surface, config) => {
            if (!(surface instanceof HTMLCanvasElement)) {
                throw new Error("cpu-canvas backend requires HTMLCanvasElement");
            }
            return new CpuCanvasRenderBackend(surface, config);
        },
    ],
    [
        "cpu-svg",
        (surface, config) => {
            if (surface instanceof HTMLCanvasElement) {
                throw new Error("cpu-svg backend requires SVGElement");
            }
            return new CpuSvgRenderBackend(surface, config);
        },
    ],
    ["webgpu", (surface, config) => new WebGpuRenderBackend(surface, config)],
]);

export function registerRenderBackend(id: RenderBackendId, factory: RenderBackendFactory): void {
    factories.set(id, factory);
}

export function resolveRenderBackendId(surface: HTMLCanvasElement | SVGElement, config: RenderConfig): RenderBackendId {
    if (config.backend) {
        return config.backend;
    }
    return surface instanceof HTMLCanvasElement ? "cpu-canvas" : "cpu-svg";
}

export function createRenderBackend(surface: HTMLCanvasElement | SVGElement, config: RenderConfig): RenderBackend {
    const id = resolveRenderBackendId(surface, config);
    const factory = factories.get(id);
    if (!factory) {
        throw new Error(`unknown render backend: ${id}`);
    }
    return factory(surface, config);
}
