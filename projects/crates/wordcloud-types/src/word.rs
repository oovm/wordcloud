use crate::element::ElementKind;

/// Word frequency input for layout.
#[derive(Debug, Clone, PartialEq)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct WordFrequency {
    pub word: String,
    pub frequency: f32,
    pub kind: Option<ElementKind>,
}

impl WordFrequency {
    pub fn new(word: impl Into<String>, frequency: f32) -> Self {
        Self { word: word.into(), frequency, kind: None }
    }
}
