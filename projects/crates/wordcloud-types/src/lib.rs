//! Shared types for the wordcloud Rust workspace.

mod element;
mod error;
mod layout;
mod render;
mod theme;
mod word;

pub use element::{
    ElementGeometry, ElementKind, EmojiElement, ImageElement, TextElement, WordCloudElement,
};
pub use error::{WordCloudError, WordCloudResult};
pub use layout::{
    LayoutAlgorithm, LayoutBounds, LayoutConfig, LayoutResult, SpiralLayout,
};
pub use render::{
    ColorFunction, RenderConfig, RenderDevice, RescaleWeight, FAST_SKIP_THRESHOLD,
    MINIMUM_COLLISION_RESOLUTION,
};
pub use theme::{Color, Theme};
pub use word::WordFrequency;
