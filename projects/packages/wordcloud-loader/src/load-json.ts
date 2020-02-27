import type { WordFrequency } from "@doki-land/wordcloud-core";

export interface JsonLoadOptions {
    /** Property name for the word. Default tries `word` then `text`. */
    wordKey?: string;
    /** Property name for frequency. Default tries `frequency` then `count`. */
    frequencyKey?: string;
    /** Dot path to the array when JSON is nested, e.g. `words`. */
    arrayPath?: string;
}

function resolveArray(data: unknown, arrayPath?: string): unknown[] {
    if (arrayPath) {
        const segments = arrayPath.split(".");
        let current: unknown = data;
        for (const segment of segments) {
            if (typeof current !== "object" || current === null) {
                return [];
            }
            current = (current as Record<string, unknown>)[segment];
        }
        return Array.isArray(current) ? current : [];
    }

    if (Array.isArray(data)) {
        return data;
    }

    if (typeof data === "object" && data !== null) {
        return Object.entries(data as Record<string, unknown>).map(([word, frequency]) => ({
            word,
            frequency,
        }));
    }

    return [];
}

function readWord(item: Record<string, unknown>, wordKey?: string): string | undefined {
    const candidates = wordKey ? [wordKey] : ["word", "text"];
    for (const key of candidates) {
        const value = item[key];
        if (value !== undefined && value !== null && String(value).length > 0) {
            return String(value);
        }
    }
    return undefined;
}

function readFrequency(item: Record<string, unknown>, frequencyKey?: string): number {
    const candidates = frequencyKey ? [frequencyKey] : ["frequency", "count"];
    for (const key of candidates) {
        const value = item[key];
        const parsed = Number(value);
        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }
    return 1;
}

export function loadFromJson(jsonText: string, options: JsonLoadOptions = {}): WordFrequency[] {
    const data = JSON.parse(jsonText) as unknown;
    const rows = resolveArray(data, options.arrayPath);
    const result: WordFrequency[] = [];

    for (const row of rows) {
        if (typeof row === "string") {
            result.push({ word: row, frequency: 1 });
            continue;
        }

        if (typeof row !== "object" || row === null) {
            continue;
        }

        const record = row as Record<string, unknown>;
        const word = readWord(record, options.wordKey);
        if (!word) {
            continue;
        }

        result.push({
            word,
            frequency: readFrequency(record, options.frequencyKey),
            type: record.type as WordFrequency["type"],
            metadata: record.metadata as WordFrequency["metadata"],
        });
    }

    return result;
}
