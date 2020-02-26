import { describe, expect, it } from "vitest";
import { LayoutEngine } from "../src/index";

describe("LayoutEngine", () => {
    it("places multiple words on canvas", () => {
        const engine = new LayoutEngine({
            width: 640,
            height: 480,
            padding: 20,
            rotations: [0],
            spiral: "archimedean",
            maxAttempts: 1000,
            minFontSize: 12,
            maxFontSize: 60,
        });

        const result = engine.layout([
            { word: "layout", frequency: 5 },
            { word: "quadtree", frequency: 3 },
        ]);

        expect(result.success).toBe(true);
        expect(result.elements.length).toBe(2);
    });
});
