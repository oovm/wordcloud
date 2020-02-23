# wordcloud-wgpu

GPU-accelerated word cloud layout using **wgpu compute**.

Each placement attempt is evaluated in parallel on the GPU (spiral search + AABB collision against already placed words). Types come from [`wordcloud-types`](../wordcloud-types), candidate sizing from [`wordcloud`](../wordcloud).

```rust
use wordcloud_wgpu::GpuLayoutEngine;
use wordcloud_types::{LayoutConfig, WordFrequency};

let engine = GpuLayoutEngine::new(LayoutConfig::default())?;
let words = vec![WordFrequency::new("gpu", 3.0), WordFrequency::new("rust", 2.0)];
let result = engine.layout(&words)?;
```

Requires a usable wgpu adapter (Vulkan / DX12 / Metal).
