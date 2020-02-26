# @doki-land/wordcloud-layout

Spiral placement + quad-tree collision layout for word clouds.

```ts
import { LayoutEngine } from "@doki-land/wordcloud-layout";
import type { WordFrequency } from "@doki-land/wordcloud-core";

const engine = new LayoutEngine({
    width: 800,
    height: 600,
    padding: 20,
    rotations: [0, 90, -90],
    spiral: "archimedean",
    maxAttempts: 1000,
    minFontSize: 12,
    maxFontSize: 60,
});

const result = engine.layout([
    { word: "layout", frequency: 5 },
    { word: "quadtree", frequency: 3 },
]);
```

Also exports `QuadTree` for custom collision indexing.
