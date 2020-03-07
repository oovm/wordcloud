import { describe, expect, it } from "vitest";
import {
    createNaturalTokenizer,
    createNodejiebaTokenizer,
    loadFromCsv,
    loadFromCsvWithPapaparse,
    loadFromJson,
    loadFromText,
    WordCloudLoader,
} from "../src/index";

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

    it("supports swappable csv parser", () => {
        const loader = new WordCloudLoader(undefined, (csv) =>
            loadFromCsvWithPapaparse(csv, {
                parse: (input) => ({
                    data: [{ word: "papaparse", frequency: 7 }],
                    errors: [],
                }),
            }),
        );

        expect(loader.fromCsv("ignored")).toEqual([{ word: "papaparse", frequency: 7 }]);
    });
});

describe("tokenizer adapters", () => {
    it("nodejieba adapter segments chinese", () => {
        const tokenizer = createNodejiebaTokenizer({
            cut: (text) => text.split(/\s+/).filter(Boolean),
        });
        const words = tokenizer("词云 词云 可视化", { minLength: 1 });
        expect(words).toEqual([
            { word: "词云", frequency: 2 },
            { word: "可视化", frequency: 1 },
        ]);
    });

    it("natural adapter tokenizes english", () => {
        const tokenizer = createNaturalTokenizer({
            WordTokenizer: class {
                tokenize(text: string) {
                    return text.split(/\s+/).filter(Boolean);
                }
            },
        });

        const words = tokenizer("hello world hello", { minLength: 2, language: "english" });
        expect(words).toEqual([
            { word: "hello", frequency: 2 },
            { word: "world", frequency: 1 },
        ]);
    });

    it("natural adapter accepts default export shape", () => {
        const tokenizer = createNaturalTokenizer({
            default: {
                WordTokenizer: class {
                    tokenize(text: string) {
                        return text.split(/\s+/).filter(Boolean);
                    }
                },
            },
        });

        const words = tokenizer("alpha beta alpha", { minLength: 2, language: "english" });
        expect(words).toEqual([
            { word: "alpha", frequency: 2 },
            { word: "beta", frequency: 1 },
        ]);
    });
});
