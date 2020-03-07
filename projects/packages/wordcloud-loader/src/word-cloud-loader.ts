import type { TokenizeOptions, WordFrequency } from "@doki-land/wordcloud-core";
import { type CsvLoadOptions, loadFromCsv } from "./load-csv";
import { type JsonLoadOptions, loadFromJson } from "./load-json";
import { loadFromText } from "./load-text";
import { defaultTokenizer, type Tokenizer } from "./tokenizer";

export type CsvParser = (csvText: string, options?: CsvLoadOptions) => WordFrequency[];

/** Load `WordFrequency[]` from CSV, JSON, or plain text. */
export class WordCloudLoader {
    private tokenizer: Tokenizer;
    private csvParser: CsvParser;

    constructor(tokenizer: Tokenizer = defaultTokenizer, csvParser: CsvParser = loadFromCsv) {
        this.tokenizer = tokenizer;
        this.csvParser = csvParser;
    }

    fromCsv(csvText: string, options?: CsvLoadOptions): WordFrequency[] {
        return this.csvParser(csvText, options);
    }

    fromJson(jsonText: string, options?: JsonLoadOptions): WordFrequency[] {
        return loadFromJson(jsonText, options);
    }

    /** Plain `.txt` — runs through the configured tokenizer. */
    fromText(text: string, options?: TokenizeOptions): WordFrequency[] {
        return loadFromText(text, options, this.tokenizer);
    }

    setTokenizer(tokenizer: Tokenizer): void {
        this.tokenizer = tokenizer;
    }

    setCsvParser(parser: CsvParser): void {
        this.csvParser = parser;
    }

    getTokenizer(): Tokenizer {
        return this.tokenizer;
    }

    getCsvParser(): CsvParser {
        return this.csvParser;
    }
}
