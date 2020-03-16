import { defaultTokenizer, loadFromCsv, WordCloudLoader } from "@doki-land/wordcloud-loader";
import { createNaturalTokenizer } from "./adapters/natural";
import { createNodejiebaTokenizer } from "./adapters/nodejieba";
import { loadFromCsvWithPapaparse } from "./adapters/papaparse";
import {
    CSV_PARSER_ENGINES,
    TOKENIZER_ENGINES,
    type CsvParserEngineId,
    type TokenizerEngineId,
} from "./loader-registry";

export { CSV_PARSER_ENGINES, TOKENIZER_ENGINES };
export type { CsvParserEngineId, TokenizerEngineId };

export interface LoaderRuntimeOptions {
    tokenizer: TokenizerEngineId;
    csv: CsvParserEngineId;
}

async function resolveTokenizer(engine: TokenizerEngineId) {
    switch (engine) {
        case "builtin":
            return defaultTokenizer;
        case "natural": {
            const natural = await import("natural");
            return createNaturalTokenizer(natural);
        }
        case "nodejieba": {
            const nodejieba = await import("nodejieba");
            return createNodejiebaTokenizer(nodejieba);
        }
        default:
            return defaultTokenizer;
    }
}

async function resolveCsvParser(engine: CsvParserEngineId) {
    if (engine === "papaparse") {
        const Papa = await import("papaparse");
        return (csvText: string, options?: Parameters<typeof loadFromCsvWithPapaparse>[2]) =>
            loadFromCsvWithPapaparse(csvText, Papa, options);
    }

    return loadFromCsv;
}

/** Create a `WordCloudLoader` wired to the selected tokenizer / CSV engines. */
export async function createLoaderRuntime(options: LoaderRuntimeOptions): Promise<WordCloudLoader> {
    const [tokenizer, csvParser] = await Promise.all([
        resolveTokenizer(options.tokenizer),
        resolveCsvParser(options.csv),
    ]);

    return new WordCloudLoader(tokenizer, csvParser);
}

export function isTokenizerAvailableInBrowser(engine: TokenizerEngineId): boolean {
    const meta = TOKENIZER_ENGINES.find((item) => item.id === engine);
    return meta?.runtime !== "node";
}
