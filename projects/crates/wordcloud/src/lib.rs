//! Versatile word cloud generator.

mod analyze;
mod layout;
mod quadtree;

pub use analyze::tokenize_text;
pub use layout::{
    LayoutEngine, build_candidates, measure_text, normalize_frequencies, spiral_position, within_bounds,
};
pub use quadtree::{CollisionBox, QuadTree};

pub use wordcloud_types::{
    Color, ColorFunction, ElementGeometry, ElementKind, EmojiElement, FAST_SKIP_THRESHOLD,
    ImageElement, LayoutAlgorithm, LayoutBounds, LayoutConfig, LayoutResult, MINIMUM_COLLISION_RESOLUTION,
    RenderConfig, RenderDevice, RescaleWeight, SpiralLayout, TextElement, Theme, WordCloudElement,
    WordCloudError, WordCloudResult, WordFrequency,
};
