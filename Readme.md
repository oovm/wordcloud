WordCloud
=========

The most flexible and comprehensive word cloud generator — Rust crate and TypeScript package.

## Layout

```text
projects/
  crates/
    wordcloud/           # Rust crate (`wordcloud` on crates.io)
    wordcloud-types/     # shared Rust domain types
    quadtree-quantify/
    pixel-volume-tree/
  packages/
    wordcloud-core/       # npm `@doki-land/wordcloud-core` (shared TS types)
    wordcloud-loader/    # npm `@doki-land/wordcloud-loader` (CSV/JSON/TXT loader)
    wordcloud-layout/    # npm `@doki-land/wordcloud-layout` (layout engine)
    wordcloud-renderer/  # npm `@doki-land/wordcloud-renderer` (CPU / WebGPU backends)
    wordcloud-benchmark/ # local only — layout / renderer benchmarks (not published)
    wordcloud/           # npm `@doki-land/wordcloud` (facade)
    wordcloud-element/   # npm `@doki-land/wordcloud-element` (`<word-cloud>` CE)
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
pnpm bench       # layout + renderer benchmarks (local package)
```
