import { defaultTokenizer, type Tokenizer } from "@doki-land/wordcloud-loader";
import { createNaturalTokenizer } from "./adapters/natural";
import { createNodejiebaTokenizer } from "./adapters/nodejieba";

type TokenizerEngineId = "builtin" | "natural" | "nodejieba";
import { buildCorpus, type TextCorpusId } from "./lib/sample-text";
import { isDirectRun } from "./lib/is-direct-run";
import { bench, printResults, type BenchResult } from "./lib/timing";

const CORPUS_SIZES = [
    { label: "8kb", chars: 8 * 1024 },
    { label: "32kb", chars: 32 * 1024 },
] as const;

const CORPUS_KINDS: TextCorpusId[] = ["chinese", "english", "mixed"];

type TokenizerBenchCase = {
    engine: TokenizerEngineId;
    label: string;
    tokenizer: Tokenizer;
};

async function resolveTokenizerCases(): Promise<TokenizerBenchCase[]> {
    const cases: TokenizerBenchCase[] = [
        {
            engine: "builtin",
            label: "tokenizer/builtin",
            tokenizer: defaultTokenizer,
        },
    ];

    try {
        const natural = await import("natural");
        cases.push({
            engine: "natural",
            label: "tokenizer/natural",
            tokenizer: createNaturalTokenizer(natural),
        });
    } catch (error) {
        console.warn("tokenizer/natural skipped:", error instanceof Error ? error.message : error);
    }

    try {
        const nodejiebaModule = await import("nodejieba");
        const nodejieba = nodejiebaModule.default ?? nodejiebaModule;
        cases.push({
            engine: "nodejieba",
            label: "tokenizer/nodejieba",
            tokenizer: createNodejiebaTokenizer(nodejieba),
        });
    } catch (error) {
        console.warn(
            "tokenizer/nodejieba skipped:",
            error instanceof Error ? error.message : error,
            "(run `pnpm approve-builds` at repo root if native module was not built)",
        );
    }

    return cases;
}

function languageForCorpus(kind: TextCorpusId): "chinese" | "english" | "mixed" {
    return kind;
}

export async function runTokenizerBenchmarks(iterations = 5): Promise<BenchResult[]> {
    const tokenizerCases = await resolveTokenizerCases();
    const results: BenchResult[] = [];

    for (const tokenizerCase of tokenizerCases) {
        for (const kind of CORPUS_KINDS) {
            for (const size of CORPUS_SIZES) {
                const text = buildCorpus(kind, size.chars);
                const benchName = `${tokenizerCase.label}/${kind}-${size.label}`;

                results.push(
                    bench(benchName, iterations, () => {
                        tokenizerCase.tokenizer(text, {
                            language: languageForCorpus(kind),
                            minLength: 1,
                        });
                    }),
                );
            }
        }
    }

    printResults(results);
    return results;
}

if (isDirectRun(import.meta.url)) {
    const iterations = Number.parseInt(process.env.BENCH_ITERATIONS ?? "5", 10);
    void runTokenizerBenchmarks(iterations);
}
