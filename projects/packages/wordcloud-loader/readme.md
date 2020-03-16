# @doki-land/wordcloud-loader

Load `WordFrequency[]` from CSV, JSON, or plain text with **injectable tokenizers and CSV parsers**.

| Source | API |
|--------|-----|
| CSV | `loadFromCsv` / `loader.fromCsv` |
| JSON | `loadFromJson` / `loader.fromJson` |
| TXT | `loadFromText` + injectable `Tokenizer` |

## Quick start

```ts
import { WordCloudLoader, loadFromCsv, loadFromText } from "@doki-land/wordcloud-loader";

const fromCsv = loadFromCsv("word,frequency\nrust,5\nwgpu,3");
const fromTxt = new WordCloudLoader().fromText("hello world hello");
```

## Injectable tokenizers

`WordCloudLoader` accepts any `Tokenizer` function. Third-party engines (`nodejieba`, `natural`, `papaparse`) belong in the app layer — wire them yourself:

```ts
import { WordCloudLoader, type Tokenizer } from "@doki-land/wordcloud-loader";

const myTokenizer: Tokenizer = (text, options) => {
    // call nodejieba / natural / custom logic
    return [{ word: text.trim(), frequency: 1 }];
};

const loader = new WordCloudLoader(myTokenizer);
```

Shared helpers for custom adapters: `detectLanguage`, `splitBuiltinTokens`, `countWordFrequencies`.

## Injectable CSV parsers

```ts
import { WordCloudLoader, loadFromCsv, type CsvParser } from "@doki-land/wordcloud-loader";

const loader = new WordCloudLoader(undefined, myCsvParser);
loader.setCsvParser((csv) => loadFromCsv(csv));
```
