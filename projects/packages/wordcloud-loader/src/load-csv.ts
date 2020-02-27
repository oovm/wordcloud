import type { WordFrequency } from "@doki-land/wordcloud-core";

export interface CsvLoadOptions {
    /** Zero-based word column index. Default `0`. */
    wordColumn?: number;
    /** Zero-based frequency column index. Default `1`. */
    frequencyColumn?: number;
    /** Skip the first row when it looks like a header. Default `true`. */
    skipHeader?: boolean;
}

export function loadFromCsv(csvText: string, options: CsvLoadOptions = {}): WordFrequency[] {
    const wordColumn = options.wordColumn ?? 0;
    const frequencyColumn = options.frequencyColumn ?? 1;
    const skipHeader = options.skipHeader ?? true;

    const lines = csvText.split(/\r?\n/).filter((line) => line.trim());
    const start = skipHeader && lines.length > 0 ? 1 : 0;
    const result: WordFrequency[] = [];

    for (let i = start; i < lines.length; i++) {
        const columns = lines[i].split(",").map((col) => col.trim().replace(/^"|"$/g, ""));
        if (columns.length <= Math.max(wordColumn, frequencyColumn)) {
            continue;
        }

        const word = columns[wordColumn];
        const frequency = Number.parseFloat(columns[frequencyColumn]);

        if (!word) {
            continue;
        }

        result.push({
            word,
            frequency: Number.isFinite(frequency) ? frequency : 1,
        });
    }

    return result;
}
