import type { TokenizeOptions } from "@doki-land/wordcloud-core";
import type { Tokenizer } from "../tokenizer";
import { countWordFrequencies, detectLanguage, splitBuiltinTokens } from "../tokenize-utils";

/** Minimal `natural` WordTokenizer surface. */
export interface NaturalLike {
    WordTokenizer: new () => {
        tokenize(text: string): string[] | undefined;
    };
}

function resolveNaturalModule(naturalModule: NaturalLike | { default: NaturalLike }): NaturalLike {
    if ("default" in naturalModule && naturalModule.default) {
        return naturalModule.default;
    }

    return naturalModule;
}

/**
 * English-oriented tokenizer adapter using `natural.WordTokenizer`.
 * CJK segments still use built-in per-character splitting.
 */
export function createNaturalTokenizer(naturalModule: NaturalLike | { default: NaturalLike }): Tokenizer {
    const natural = resolveNaturalModule(naturalModule);
    const wordTokenizer = new natural.WordTokenizer();

    return (text: string, options: TokenizeOptions = {}) => {
        const language = options.language ?? detectLanguage(text);
        const tokens: string[] = [];

        if (language === "chinese" || language === "mixed" || language === "auto") {
            tokens.push(...splitBuiltinTokens(text, "chinese", options.includeNumbers ?? false));
        }

        if (language === "english" || language === "mixed" || language === "auto") {
            const englishText = text.replace(/[\u4e00-\u9fff]/g, " ");
            const englishTokens = wordTokenizer.tokenize(englishText) ?? [];
            tokens.push(...englishTokens);
        }

        return countWordFrequencies(tokens, options);
    };
}
