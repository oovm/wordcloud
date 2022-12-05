use diagnostic_quick::QResult;
use image::{imageops::grayscale_alpha, GenericImageView, LumaA, Rgb, Rgba, RgbaImage};
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

impl WordCloudItem {
    pub fn reshape(&mut self) -> QResult {
        match self.kind {
            WordCloudItemKind::Text { .. } => {
                todo!()
            }
            WordCloudItemKind::ImageObject { image } => {
                let gray = grayscale_alpha(&image);
                rotate_about_center(&gray, self.rotate, Interpolation::Nearest, LumaA([0, 0]))
            }
            WordCloudItemKind::ImageFile { .. } => {
                todo!()
            }
            WordCloudItemKind::ImageLink { .. } => {
                todo!()
            }
        }
        Ok(())
    }
}

pub struct WordCloudMask {
    image: RgbaImage,
    area: WordCloudTree,
    color: Rgba<u8>,
}
