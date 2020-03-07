# @doki-land/wordcloud-loader

Load `WordFrequency[]` from structured data or plain text with **pluggable tokenizers and CSV parsers**.

| Source | API | Engines |
|--------|-----|---------|
| CSV | `loadFromCsv` / `loader.fromCsv` | built-in columns, **Papa Parse** headers |
| JSON | `loadFromJson` / `loader.fromJson` | built-in |
| TXT | `loadFromText` + injectable `Tokenizer` | built-in, **nodejieba**, **natural** |

## Quick start

```ts
import { WordCloudLoader, defaultTokenizer, loadFromCsv } from "@doki-land/wordcloud-loader";

const fromCsv = loadFromCsv("word,frequency\nrust,5\nwgpu,3");
const fromTxt = new WordCloudLoader().fromText("hello world hello");
```

## Pluggable tokenizers

`WordCloudLoader` accepts any `Tokenizer` function. Optional adapters ship as factories — **bring your own npm package**:

```ts
import {
    WordCloudLoader,
    createNodejiebaTokenizer,
    createNaturalTokenizer,
} from "@doki-land/wordcloud-loader";
import nodejieba from "nodejieba";
import natural from "natural";

const jiebaLoader = new WordCloudLoader(createNodejiebaTokenizer(nodejieba));
const naturalLoader = new WordCloudLoader(createNaturalTokenizer(natural));

jiebaLoader.fromText("词云可视化");
naturalLoader.fromText("hello world hello");
```

Subpath imports are also available:

```ts
import { createNodejiebaTokenizer } from "@doki-land/wordcloud-loader/nodejieba";
```

## Pluggable CSV parsers

```ts
import Papa from "papaparse";
import { WordCloudLoader, loadFromCsv, loadFromCsvWithPapaparse } from "@doki-land/wordcloud-loader";

const loader = new WordCloudLoader(
    undefined,
    (csv) => loadFromCsvWithPapaparse(csv, Papa),
);

loader.fromCsv("word,frequency\nhello,3");
```

Or swap at runtime:

```ts
loader.setTokenizer(createNaturalTokenizer(natural));
loader.setCsvParser((csv) => loadFromCsvWithPapaparse(csv, Papa));
```

## Engine registry

Use `TOKENIZER_ENGINES` / `CSV_PARSER_ENGINES` to build UI selectors (labels, runtime hints).

Optional peer dependencies: `nodejieba`, `natural`, `papaparse`.
