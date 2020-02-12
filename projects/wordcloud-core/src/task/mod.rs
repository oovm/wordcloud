use diagnostic_quick::QResult;
use image::{imageops::grayscale_alpha, LumaA, Rgb, Rgba, RgbaImage};
use imageproc::geometric_transformations::{rotate_about_center, Interpolation};

use crate::WordCloudTree;

pub mod rotate;

pub enum WordCloudItemKind {
    Text { text: String, color: Option<Rgb<u8>> },
    ImageObject { image: RgbaImage },
    ImageFile { path: String },
    ImageLink { url: String },
}

pub struct WordCloudItem {
    kind: WordCloudItemKind,
    area: WordCloudTree,
    rotate: f32,
}

impl WordCloudItemKind {
    pub fn new(kind: WordCloudItemKind) -> WordCloudItem {
        WordCloudItem { kind, area: WordCloudTree::new(1, 0, 0), rotate: 0.0 }
    }
}

pub struct WordCloudMask {
    image: RgbaImage,
    area: WordCloudTree,
    color: Rgba<u8>,
}
