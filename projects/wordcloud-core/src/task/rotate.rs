use image::io::Reader;
use rand::{seq::SliceRandom, Rng};

use super::*;

pub enum RotateMode {
    Nothing,
    Random { min: f32, max: f32 },
    Fixed { set: Vec<f32> },
}

impl RotateMode {
    fn choose<R>(self, rng: &mut R) -> Option<f32>
    where
        R: Rng + ?Sized,
    {
        match self {
            RotateMode::Nothing => Some(0.0),
            RotateMode::Random { min, max } => Some(rng.gen_range(min..max)),
            RotateMode::Fixed { set } => set.choose(rng).copied(),
        }
    }
}

impl WordCloudItem {
    pub fn reshape(&mut self, threshold: u8) -> QResult {
        let tree = match &self.kind {
            WordCloudItemKind::Text { .. } => {
                todo!()
            }
            WordCloudItemKind::TextColored { .. } => {
                todo!()
            }
            WordCloudItemKind::ImageObject { image } => image_area(image, self.rotate, threshold)?,
            WordCloudItemKind::ImageFile { path } => {
                let image = Reader::open(path)?.with_guessed_format()?.decode()?;
                image_area(&image.to_rgba8(), self.rotate, threshold)?
            }
            WordCloudItemKind::ImageLink { .. } => {
                todo!()
            }
        };
        self.area = tree;
        Ok(())
    }
}

pub fn image_area(image: &RgbaImage, rotate: f32, threshold: u8) -> QResult<WordCloudTree> {
    let gray = grayscale_alpha(image);
    let rotated = rotate_about_center(&gray, rotate, Interpolation::Nearest, LumaA([0, 0]));
    let mut area = WordCloudTree::new(1, 0, 0);
    for (y, pixels) in rotated.rows().enumerate() {
        let mut last_occupied = false;
        let mut start = 0;
        let mut end = 0;
        for (x, pixel) in pixels.enumerate() {
            let occupied = is_occupied(pixel, threshold);
            match (last_occupied, occupied) {
                (true, true) => end += 1,
                (true, false) => {
                    area.insert(start, y, end - start, 1)?;
                }
                (false, true) => {
                    start = x;
                    end = x;
                }
                (false, false) => {}
            }
        }
    }
    Ok(area)
}

fn is_occupied(pixel: &LumaA<u8>, threshold: u8) -> bool {
    if pixel.0[1] == 0 {
        return false;
    }
    pixel.0[0] > threshold
}
