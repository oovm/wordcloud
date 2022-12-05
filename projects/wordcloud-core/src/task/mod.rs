use crate::WordCloudTree;
use image::{Rgb, RgbaImage};

pub enum WordCloudTaskKind {
    Text { text: String, color: Option<Rgb<u8>> },
    ImageObject { image: RgbaImage },
    ImageFile { path: String },
    ImageLink { url: String },
}

pub struct WordCloudTask {
    kind: WordCloudTaskKind,
    area: WordCloudTree,
}

impl WordCloudTaskKind {
    pub fn new(kind: WordCloudTaskKind) -> WordCloudTask {
        WordCloudTask { kind, area: () }
    }
}
