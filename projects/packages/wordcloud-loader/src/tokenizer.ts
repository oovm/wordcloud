import type { TokenizeOptions, WordFrequency } from "@doki-land/wordcloud-core";
import { countWordFrequencies, splitBuiltinTokens } from "./tokenize-utils";

export type Tokenizer = (text: string, options?: TokenizeOptions) => WordFrequency[];

/** Built-in tokenizer: regex split + stop words + frequency count. */
export function defaultTokenizer(text: string, options: TokenizeOptions = {}): WordFrequency[] {
    const tokens = splitBuiltinTokens(text, options.language ?? "auto", options.includeNumbers ?? false);
    return countWordFrequencies(tokens, options);
}
