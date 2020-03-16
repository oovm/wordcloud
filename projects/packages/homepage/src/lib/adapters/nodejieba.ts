import type { TokenizeOptions } from "@doki-land/wordcloud-core";
import {
    countWordFrequencies,
    detectLanguage,
    splitBuiltinTokens,
    type Tokenizer,
} from "@doki-land/wordcloud-loader";

/** Minimal `nodejieba` surface — inject the real package or a wasm shim. */
export interface NodejiebaLike {
    cut(text: string, hmm?: boolean): string[];
}

/** Chinese segmenter adapter for `WordCloudLoader`. */
export function createNodejiebaTokenizer(jieba: NodejiebaLike): Tokenizer {
    return (text: string, options: TokenizeOptions = {}) => {
        const language = options.language ?? detectLanguage(text);

        if (language === "english") {
            const tokens = splitBuiltinTokens(text, "english", options.includeNumbers ?? false);
            return countWordFrequencies(tokens, options);
        }

        const tokens: string[] = [];

        try {
            tokens.push(...jieba.cut(text, true));
        } catch (error) {
            console.warn("nodejieba cut failed, falling back to built-in tokenizer", error);
            tokens.push(...splitBuiltinTokens(text, language, options.includeNumbers ?? false));
        }

        if (language === "mixed") {
            const latin = splitBuiltinTokens(text, "english", options.includeNumbers ?? false);
            tokens.push(...latin);
        }

        return countWordFrequencies(tokens, options);
    };
}
