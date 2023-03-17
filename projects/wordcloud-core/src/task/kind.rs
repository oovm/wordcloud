use super::*;

pub enum WordCloudItemKind {
    Text { text: String },
    TextColored { text: String, color: Rgb<u8> },
    ImageObject { image: RgbaImage },
    ImageFile { path: PathBuf },
    ImageLink { url: String },
}

impl From<PathBuf> for WordCloudItemKind {
    fn from(path: PathBuf) -> Self {
        Self::ImageFile { path }
    }
}

impl From<String> for WordCloudItemKind {
    fn from(text: String) -> Self {
        Self::Text { text }
    }
}

impl WordCloudItemKind {
    pub fn new(kind: impl Into<WordCloudItemKind>) -> WordCloudItem {
        WordCloudItem { kind: kind.into(), area: WordCloudTree::new(1, 0, 0), rotate: 0.0 }
    }
}
