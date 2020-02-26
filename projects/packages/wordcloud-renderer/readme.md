# @doki-land/wordcloud-renderer

Pluggable word cloud render backends.

| Backend | Id | Status |
|---------|-----|--------|
| Canvas 2D | `cpu-canvas` | implemented |
| SVG DOM | `cpu-svg` | implemented |
| WebGPU | `webgpu` | stub (falls back to CPU canvas when possible) |

```ts
import { createRenderBackend, WordCloudRenderer } from "@doki-land/wordcloud-renderer";

const backend = createRenderBackend(canvas, {
    theme,
    backend: "cpu-canvas",
    progressive: false,
    animationSpeed: 100,
});

const renderer = new WordCloudRenderer(canvas, config);
renderer.setElements(elements);
renderer.render();
```

Register custom backends via `registerRenderBackend`.
