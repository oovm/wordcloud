import { describe, expect, it } from "vitest";
import { loadFromCsv, loadFromJson, loadFromText, WordCloudLoader } from "../src/index";

describe("WordCloudLoader", () => {
    const loader = new WordCloudLoader();

    it("loads csv rows", () => {
        const words = loader.fromCsv("word,frequency\nrust,5\nwgpu,3");
        expect(words).toEqual([
            { word: "rust", frequency: 5 },
            { word: "wgpu", frequency: 3 },
        ]);
    });

    it("loads json array", () => {
        const words = loader.fromJson(
            JSON.stringify([{ word: "hello", frequency: 2 }, { text: "world", count: 1 }]),
        );
        expect(words).toHaveLength(2);
        expect(words[0]).toEqual({ word: "hello", frequency: 2 });
        expect(words[1]).toEqual({ word: "world", frequency: 1 });
    });

    it("loads plain text via tokenizer", () => {
        const words = loadFromText("hello world hello", { minLength: 2 });
        expect(words).toEqual([{ word: "hello", frequency: 2 }, { word: "world", frequency: 1 }]);
    });

    it("supports custom tokenizer", () => {
        const custom = (text: string) => [{ word: text.trim(), frequency: 1 }];
        const words = new WordCloudLoader(custom).fromText("single blob");
        expect(words).toEqual([{ word: "single blob", frequency: 1 }]);
    });

    it("loads nested json via arrayPath", () => {
        const words = loadFromJson(JSON.stringify({ words: [{ word: "a", frequency: 1 }] }), {
            arrayPath: "words",
        });
        expect(words).toEqual([{ word: "a", frequency: 1 }]);
    });

    it("skips invalid csv rows", () => {
        const words = loadFromCsv("word,frequency\nhello,10\n,5\nworld,\ntest,3");
        expect(words.map((item) => item.word)).toEqual(["hello", "test"]);
    });
});
