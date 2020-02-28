/**
 * Optional Rust/WASI bindings — import from `@doki-land/wordcloud/wasm` only.
 * The main entry does not re-export this module so bundlers can tree-shake wasm away.
 */
import type { LayoutConfig, WordFrequency } from "./types";

export type WasmWordFrequency = {
    word: string;
    frequency: number;
};

export type WasmPlacedWord = {
    word: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    fontSize: number;
    frequency: number;
};

export type WasmLayoutResult = {
    words: WasmPlacedWord[];
    success: boolean;
};

export type WordcloudWasm = {
    analyze: {
        tokenizeText(text: string, minLength: number, maxLength: number): WasmWordFrequency[];
    };
    layout: {
        layoutWords(
            config: {
                width: number;
                height: number;
                padding: number;
                maxAttempts: number;
                minFontSize: number;
                maxFontSize: number;
                archimedean: boolean;
            },
            words: WasmWordFrequency[],
        ): WasmLayoutResult;
    };
};

let cached: WordcloudWasm | undefined;

/** Load the WASI component from `lib/` (via `jco transpile`). */
export async function loadWordcloudWasm(): Promise<WordcloudWasm> {
    if (cached) {
        return cached;
    }
    const { default: instantiate } = await import("../lib/wordcloud.js");
    const { exports } = await instantiate();
    cached = exports as WordcloudWasm;
    return cached;
}

export function toWasmLayoutConfig(config: LayoutConfig) {
    return {
        width: config.width,
        height: config.height,
        padding: config.padding,
        maxAttempts: config.maxAttempts,
        minFontSize: config.minFontSize,
        maxFontSize: config.maxFontSize,
        archimedean: config.spiral !== "rectangular",
    };
}

export function toWasmFrequencies(words: WordFrequency[]): WasmWordFrequency[] {
    return words.map((word) => ({ word: word.word, frequency: word.frequency }));
}

export async function tokenizeTextWasm(text: string, minLength = 2, maxLength = 48): Promise<WordFrequency[]> {
    const wasm = await loadWordcloudWasm();
    return wasm.analyze.tokenizeText(text, minLength, maxLength).map((item) => ({
        word: item.word,
        frequency: item.frequency,
    }));
}

export async function layoutWordsWasm(config: LayoutConfig, words: WordFrequency[]): Promise<WasmLayoutResult> {
    const wasm = await loadWordcloudWasm();
    return wasm.layout.layoutWords(toWasmLayoutConfig(config), toWasmFrequencies(words));
}
