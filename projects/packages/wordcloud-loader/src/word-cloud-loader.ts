import type { TokenizeOptions, WordFrequency } from "@doki-land/wordcloud-core";
import { type CsvLoadOptions, loadFromCsv } from "./load-csv";
import { type JsonLoadOptions, loadFromJson } from "./load-json";
import { loadFromText } from "./load-text";
import { defaultTokenizer, type Tokenizer } from "./tokenizer";

/** Load `WordFrequency[]` from CSV, JSON, or plain text. */
export class WordCloudLoader {
    private readonly tokenizer: Tokenizer;

    constructor(tokenizer: Tokenizer = defaultTokenizer) {
        this.tokenizer = tokenizer;
    }

    fromCsv(csvText: string, options?: CsvLoadOptions): WordFrequency[] {
        return loadFromCsv(csvText, options);
    }

    fromJson(jsonText: string, options?: JsonLoadOptions): WordFrequency[] {
        return loadFromJson(jsonText, options);
    }

    /** Plain `.txt` — runs through the configured tokenizer. */
    fromText(text: string, options?: TokenizeOptions): WordFrequency[] {
        return loadFromText(text, options, this.tokenizer);
    }

    getTokenizer(): Tokenizer {
        return this.tokenizer;
    }
}
