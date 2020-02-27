import type { TokenizeOptions, WordFrequency } from "@doki-land/wordcloud-core";
import { defaultTokenizer, type Tokenizer } from "./tokenizer";

export function loadFromText(
    text: string,
    options: TokenizeOptions = {},
    tokenizer: Tokenizer = defaultTokenizer,
): WordFrequency[] {
    return tokenizer(text, options);
}
