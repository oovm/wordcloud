use crate::word::WordFrequency;

/// Placed word-cloud element kind.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub enum ElementKind {
    Text,
    Emoji,
    Image,
}

/// Shared geometry for a placed element.
#[derive(Debug, Clone, PartialEq)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct ElementGeometry {
    pub id: String,
    pub x: f32,
    pub y: f32,
    pub width: f32,
    pub height: f32,
    pub rotation: f32,
    pub frequency: f32,
}

/// Text element placed on the canvas.
#[derive(Debug, Clone, PartialEq)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct TextElement {
    pub geometry: ElementGeometry,
    pub text: String,
    pub font_size: f32,
    pub font_family: String,
    pub font_weight: String,
    pub color: Option<String>,
}

/// Emoji element placed on the canvas.
#[derive(Debug, Clone, PartialEq)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct EmojiElement {
    pub geometry: ElementGeometry,
    pub emoji: String,
}

/// Image element placed on the canvas.
#[derive(Debug, Clone, PartialEq)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct ImageElement {
    pub geometry: ElementGeometry,
    pub src: String,
}

/// A fully placed word-cloud element.
#[derive(Debug, Clone, PartialEq)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub enum WordCloudElement {
    Text(TextElement),
    Emoji(EmojiElement),
    Image(ImageElement),
}

impl WordCloudElement {
    pub fn geometry(&self) -> &ElementGeometry {
        match self {
            Self::Text(element) => &element.geometry,
            Self::Emoji(element) => &element.geometry,
            Self::Image(element) => &element.geometry,
        }
    }
}

impl ElementGeometry {
    pub fn from_frequency(word: &WordFrequency, id: String) -> Self {
        Self { id, x: 0.0, y: 0.0, width: 0.0, height: 0.0, rotation: 0.0, frequency: word.frequency }
    }
}
