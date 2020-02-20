use crate::element::WordCloudElement;
use crate::error::{WordCloudError, WordCloudResult};

/// Spiral strategy used by the layout engine.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub enum SpiralLayout {
    #[default]
    Archimedean,
    Rectangular,
}

/// Layout algorithm selector (legacy name used by older `wordcloud` code).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub enum LayoutAlgorithm {
    #[default]
    Archimedean,
    Rectangular,
}

impl From<LayoutAlgorithm> for SpiralLayout {
    fn from(value: LayoutAlgorithm) -> Self {
        match value {
            LayoutAlgorithm::Archimedean => Self::Archimedean,
            LayoutAlgorithm::Rectangular => Self::Rectangular,
        }
    }
}

/// Canvas layout configuration.
#[derive(Debug, Clone, PartialEq)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct LayoutConfig {
    pub width: u32,
    pub height: u32,
    pub padding: f32,
    pub rotations: Vec<i32>,
    pub spiral: SpiralLayout,
    pub max_attempts: u32,
    pub min_font_size: f32,
    pub max_font_size: f32,
}

impl Default for LayoutConfig {
    fn default() -> Self {
        Self {
            width: 800,
            height: 600,
            padding: 20.0,
            rotations: vec![0, 90, -90],
            spiral: SpiralLayout::Archimedean,
            max_attempts: 1_000,
            min_font_size: 12.0,
            max_font_size: 60.0,
        }
    }
}

/// Output bounds after layout.
#[derive(Debug, Clone, Copy, PartialEq)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct LayoutBounds {
    pub width: u32,
    pub height: u32,
}

/// Layout pass result.
#[derive(Debug, Clone, PartialEq)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct LayoutResult {
    pub elements: Vec<WordCloudElement>,
    pub bounds: LayoutBounds,
    pub success: bool,
}

impl LayoutResult {
    pub fn failed(bounds: LayoutBounds) -> Self {
        Self {
            elements: Vec::new(),
            bounds,
            success: false,
        }
    }

    pub fn validate(&self) -> WordCloudResult<()> {
        if self.success && !self.elements.is_empty() {
            Ok(())
        } else {
            Err(WordCloudError::LayoutFailed)
        }
    }
}
