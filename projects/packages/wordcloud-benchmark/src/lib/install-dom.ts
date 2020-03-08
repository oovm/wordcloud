import { createRequire } from "node:module";
import { JSDOM } from "jsdom";

const require = createRequire(import.meta.url);

type CanvasElementWithBacking = HTMLCanvasElement & {
    __nodeCanvas?: import("canvas").Canvas;
};

/** Install jsdom globals. Returns whether `canvas` native bindings are available. */
export function installDom(): boolean {
    const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
    const { window } = dom;

    globalThis.window = window as Window & typeof globalThis;
    globalThis.document = window.document;
    globalThis.HTMLCanvasElement = window.HTMLCanvasElement;
    globalThis.SVGElement = window.SVGElement;
    globalThis.Image = window.Image;
    globalThis.XMLSerializer = window.XMLSerializer;
    globalThis.btoa = window.btoa.bind(window);

    try {
        const { Canvas } = require("canvas") as typeof import("canvas");
        const canvasPrototype = window.HTMLCanvasElement.prototype as CanvasElementWithBacking;

        canvasPrototype.getContext = function (type: string) {
            if (type !== "2d") {
                return null;
            }

            const element = this as CanvasElementWithBacking;
            const width = element.width || 300;
            const height = element.height || 150;

            if (
                !element.__nodeCanvas ||
                element.__nodeCanvas.width !== width ||
                element.__nodeCanvas.height !== height
            ) {
                element.__nodeCanvas = new Canvas(width, height);
            }

            return element.__nodeCanvas.getContext("2d");
        };

        return true;
    } catch (error) {
        console.warn(
            "canvas native module unavailable:",
            error instanceof Error ? error.message : error,
            "(run `pnpm approve-builds` at repo root to enable cpu-canvas/webgpu benches)",
        );
        return false;
    }
}
