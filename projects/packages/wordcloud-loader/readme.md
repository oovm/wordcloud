# @doki-land/wordcloud-loader

Load `WordFrequency[]` from structured data or plain text.

| Source | API |
|--------|-----|
| CSV | `loadFromCsv` / `loader.fromCsv` |
| JSON | `loadFromJson` / `loader.fromJson` |
| TXT | `loadFromText` + injectable `Tokenizer` |

```ts
import { WordCloudLoader, defaultTokenizer, loadFromCsv } from "@doki-land/wordcloud-loader";

const fromCsv = loadFromCsv("word,frequency\nrust,5\nwgpu,3");
const fromTxt = new WordCloudLoader().fromText("hello world hello");

// custom tokenizer (e.g. nodejieba, wasm tokenize)
const loader = new WordCloudLoader(myTokenizer);
loader.fromText(document.body.innerText);
```
