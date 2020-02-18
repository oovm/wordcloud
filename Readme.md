WordCloud
=========

The most flexible and comprehensive word cloud generator — Rust crate and TypeScript package.

## Layout

```text
projects/
  crates/
    wordcloud/           # Rust crate (`wordcloud` on crates.io)
    quadtree-quantify/
    pixel-volume-tree/
  packages/
    wordcloud/           # npm `@doki-land/wordcloud` (algorithm + `<word-cloud>` CE)
    homepage/            # Vue playground site
```

## Build

```bash
pnpm install
pnpm build:rs    # Rust workspace
pnpm build:ts    # TypeScript library
pnpm dev:web     # Homepage dev server
pnpm fmt:js      # Biome format (JS/JSON, 4 spaces)
pnpm fmt         # rustfmt + Biome
```
