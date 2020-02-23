//! GPU-accelerated word cloud layout (`wgpu` compute).

mod engine;

pub use engine::GpuLayoutEngine;
pub use wordcloud_types::{LayoutConfig, LayoutResult, WordCloudError, WordCloudResult, WordFrequency};
