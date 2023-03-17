use std::path::PathBuf;

use diagnostic_quick::QResult;
use image::{imageops::grayscale_alpha, LumaA, Rgb, Rgba, RgbaImage};
use imageproc::geometric_transformations::{rotate_about_center, Interpolation};

use crate::{WordCloudItemKind, WordCloudTree};

pub mod kind;
pub mod rotate;

pub struct WordCloudItem {
    kind: WordCloudItemKind,
    area: WordCloudTree,
    rotate: f32,
}

pub struct WordCloudMask {
    image: RgbaImage,
    area: WordCloudTree,
    color: Rgba<u8>,
}
