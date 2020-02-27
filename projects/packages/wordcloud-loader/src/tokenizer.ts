import type { TokenizeOptions, WordFrequency } from "@doki-land/wordcloud-core";

const DEFAULT_STOP_WORDS = new Set(["the", "a", "an", "and", "or", "的", "了", "和", "是", "在"]);

export type Tokenizer = (text: string, options?: TokenizeOptions) => WordFrequency[];

function splitTokens(text: string, language: TokenizeOptions["language"], includeNumbers: boolean): string[] {
    if (language === "chinese") {
        return [...text.matchAll(/[\u4e00-\u9fff]+/g)].map((match) => match[0]);
    }
    if (language === "english") {
        const pattern = includeNumbers ? /[a-z0-9]+/gi : /[a-z]+/gi;
        return text.match(pattern) ?? [];
    }

    const cjk = [...text.matchAll(/[\u4e00-\u9fff]+/g)].map((match) => match[0]);
    const latinPattern = includeNumbers ? /[a-z0-9]+/gi : /[a-z]+/gi;
    const latin = text.match(latinPattern) ?? [];
    return [...cjk, ...latin];
}

/** Built-in tokenizer: regex split + stop words + frequency count. */
export function defaultTokenizer(text: string, options: TokenizeOptions = {}): WordFrequency[] {
    const minLength = options.minLength ?? 2;
    const maxLength = options.maxLength ?? 48;
    const caseSensitive = options.caseSensitive ?? false;
    const stopWords = new Set([...DEFAULT_STOP_WORDS, ...(options.customStopWords ?? [])]);
    const normalized = caseSensitive ? text : text.toLowerCase();
    const tokens = splitTokens(normalized, options.language ?? "auto", options.includeNumbers ?? false);
    const frequencies = new Map<string, number>();

    for (const token of tokens) {
        if (token.length < minLength || token.length > maxLength) {
            continue;
        }
        if (stopWords.has(token)) {
            continue;
        }
        frequencies.set(token, (frequencies.get(token) ?? 0) + 1);
    }

    return [...frequencies.entries()].map(([word, frequency]) => ({ word, frequency }));
}
