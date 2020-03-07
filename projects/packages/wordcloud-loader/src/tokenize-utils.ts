import type { TokenizeOptions, WordFrequency } from "@doki-land/wordcloud-core";

export const DEFAULT_STOP_WORDS = new Set(["the", "a", "an", "and", "or", "的", "了", "和", "是", "在"]);

export function detectLanguage(text: string): "auto" | "chinese" | "english" | "mixed" {
    const chineseChars = text.match(/[\u4e00-\u9fff]/g)?.length ?? 0;
    const englishChars = text.match(/[a-zA-Z]/g)?.length ?? 0;

    if (chineseChars > englishChars * 2) {
        return "chinese";
    }
    if (englishChars > chineseChars * 2) {
        return "english";
    }
    if (chineseChars > 0 && englishChars > 0) {
        return "mixed";
    }
    return "auto";
}

export function buildStopWords(options: TokenizeOptions = {}): Set<string> {
    return new Set([...DEFAULT_STOP_WORDS, ...(options.customStopWords ?? [])]);
}

/** Count raw tokens into `WordFrequency[]` with shared filter rules. */
export function countWordFrequencies(tokens: Iterable<string>, options: TokenizeOptions = {}): WordFrequency[] {
    const minLength = options.minLength ?? 2;
    const maxLength = options.maxLength ?? 48;
    const caseSensitive = options.caseSensitive ?? false;
    const stopWords = buildStopWords(options);
    const frequencies = new Map<string, number>();

    for (const rawToken of tokens) {
        const token = caseSensitive ? rawToken.trim() : rawToken.toLowerCase().trim();
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

export function splitBuiltinTokens(
    text: string,
    language: TokenizeOptions["language"],
    includeNumbers: boolean,
): string[] {
    const resolvedLanguage = language === "auto" ? detectLanguage(text) : language;

    if (resolvedLanguage === "chinese") {
        return [...text.matchAll(/[\u4e00-\u9fff]/g)].map((match) => match[0]);
    }
    if (resolvedLanguage === "english") {
        const pattern = includeNumbers ? /[a-z0-9]+/gi : /[a-z]+/gi;
        return text.match(pattern) ?? [];
    }

    const cjk = [...text.matchAll(/[\u4e00-\u9fff]/g)].map((match) => match[0]);
    const latinPattern = includeNumbers ? /[a-z0-9]+/gi : /[a-z]+/gi;
    const latin = text.match(latinPattern) ?? [];
    return [...cjk, ...latin];
}
