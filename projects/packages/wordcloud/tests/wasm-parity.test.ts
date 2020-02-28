/**
 * @vitest-environment node
 */
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { LayoutEngine } from "@doki-land/wordcloud-layout";
import type { LayoutConfig, TextElement, WordFrequency } from "@doki-land/wordcloud-core";
import { layoutWordsWasm } from "../src/wasm";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const wasmBuilt = existsSync(join(packageRoot, "lib/wordcloud.js"));

const POSITION_EPSILON = 1e-3;

const parityConfig: LayoutConfig = {
    width: 640,
    height: 480,
    padding: 20,
    rotations: [0],
    spiral: "archimedean",
    maxAttempts: 1000,
    minFontSize: 12,
    maxFontSize: 60,
};

const parityWords: WordFrequency[] = [
    { word: "rust", frequency: 5 },
    { word: "gpu", frequency: 4 },
    { word: "wasm", frequency: 3 },
    { word: "cloud", frequency: 2 },
];

function textElements(result: { elements: { type: string; text?: string }[] }): TextElement[] {
    return result.elements.filter((element): element is TextElement => element.type === "text");
}

describe.skipIf(!wasmBuilt)("TS vs WASM layout parity", () => {
    it("places the same words with matching positions", async () => {
        const tsResult = new LayoutEngine(parityConfig).layout(parityWords);
        const wasmResult = await layoutWordsWasm(parityConfig, parityWords);

        expect(tsResult.success).toBe(wasmResult.success);
        expect(textElements(tsResult).length).toBe(wasmResult.words.length);

        const wasmByWord = new Map(wasmResult.words.map((word) => [word.word, word]));

        for (const element of textElements(tsResult)) {
            const wasmWord = wasmByWord.get(element.text);
            expect(wasmWord).toBeDefined();

            expect(Math.abs(element.x - wasmWord!.x)).toBeLessThanOrEqual(POSITION_EPSILON);
            expect(Math.abs(element.y - wasmWord!.y)).toBeLessThanOrEqual(POSITION_EPSILON);
            expect(Math.abs(element.width - wasmWord!.width)).toBeLessThanOrEqual(POSITION_EPSILON);
            expect(Math.abs(element.height - wasmWord!.height)).toBeLessThanOrEqual(POSITION_EPSILON);
        }
    });
});
