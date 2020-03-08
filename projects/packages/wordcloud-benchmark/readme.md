# wordcloud-benchmark

**Workspace-only** benchmarks for `@doki-land/wordcloud-loader` (tokenizers), `@doki-land/wordcloud-layout`, and `@doki-land/wordcloud-renderer`.  
This package is `private: true` and is **not** published to npm.

```bash
# from repo root
pnpm bench

# or inside this package
pnpm bench:tokenizer
pnpm bench:layout
pnpm bench:renderer
```

## Tokenizer benchmarks

Compares **builtin**, **natural**, and **nodejieba** tokenizers on Chinese / English / mixed corpora (8 KiB and 32 KiB).  
Unavailable engines are skipped with a warning (e.g. `nodejieba` when native build scripts were not approved).

```bash
BENCH_ITERATIONS=10 pnpm bench:tokenizer
```

## Layout benchmarks

Compares **archimedean** vs **rectangular** spiral placement and three rotation profiles (`rot-1` / `rot-3` / `rot-5`) at 50 / 100 / 200 words.

```bash
BENCH_ITERATIONS=10 pnpm bench:layout
```

## Renderer benchmarks

Compares **cpu-canvas**, **cpu-svg**, and **webgpu** backends at 50 / 100 / 200 placed elements.  
Canvas backends use the `canvas` npm package under jsdom. `webgpu` currently delegates to CPU canvas when no GPU adapter is available.

```bash
BENCH_ITERATIONS=10 pnpm bench:renderer
```

Outputs median milliseconds per iteration to stdout.
