import type { WordFrequency } from "@doki-land/wordcloud-core";

/** Minimal Papa Parse surface — inject `papaparse` from npm. */
export interface PapaparseLike {
    parse<T>(input: string, config?: { header?: boolean; skipEmptyLines?: boolean | "greedy" }): {
        data: T[];
        errors: unknown[];
    };
}

export interface PapaparseCsvOptions {
    wordColumn?: number | string;
    frequencyColumn?: number | string;
    skipHeader?: boolean;
}

function readWord(row: Record<string, unknown>, wordColumn?: number | string): string | undefined {
    if (typeof wordColumn === "number") {
        const values = Object.values(row);
        const value = values[wordColumn];
        return value !== undefined && value !== null ? String(value).trim() : undefined;
    }

    const candidates = wordColumn ? [wordColumn] : ["word", "text"];
    for (const key of candidates) {
        const value = row[key];
        if (value !== undefined && value !== null && String(value).trim().length > 0) {
            return String(value).trim();
        }
    }

    return undefined;
}

function readFrequency(row: Record<string, unknown>, frequencyColumn?: number | string): number | undefined {
    if (typeof frequencyColumn === "number") {
        const values = Object.values(row);
        const value = values[frequencyColumn];
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
    }

    const candidates = frequencyColumn ? [frequencyColumn] : ["frequency", "count"];
    for (const key of candidates) {
        const value = row[key];
        const parsed = Number(value);
        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }

    return undefined;
}

/** CSV loader backed by Papa Parse — supports named header columns. */
export function loadFromCsvWithPapaparse(
    csvText: string,
    papa: PapaparseLike,
    options: PapaparseCsvOptions = {},
): WordFrequency[] {
    const skipHeader = options.skipHeader ?? true;
    const parsed = papa.parse<Record<string, unknown>>(csvText, {
        header: skipHeader,
        skipEmptyLines: "greedy",
    });

    const result: WordFrequency[] = [];

    for (const row of parsed.data) {
        if (!row || typeof row !== "object") {
            continue;
        }

        const word = readWord(row, options.wordColumn);
        const frequency = readFrequency(row, options.frequencyColumn);

        if (!word || frequency === undefined) {
            continue;
        }

        result.push({ word, frequency });
    }

    return result;
}
