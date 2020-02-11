use rand::{seq::IteratorRandom, Rng};

use super::*;

pub enum RotateMode {
    Nothing,
    Random { min: f32, max: f32 },
    Fixed { set: Vec<f32> },
}

impl RotateMode {
    pub fn new(mode: RotateMode) -> RotateMode {
        mode
    }
}

impl Iterator for RotateMode {
    type Item = f32;

    fn next(&mut self) -> Option<Self::Item> {
        unreachable!()
    }
}

impl IteratorRandom for RotateMode {
    fn choose<R>(self, rng: &mut R) -> Option<Self::Item>
    where
        R: Rng + ?Sized,
    {
        match self {
            RotateMode::Nothing => Some(0.0),
            RotateMode::Random { min, max } => rng.gen_range(min..max),
            RotateMode::Fixed { set } => set.choose(rng),
        }
    }
}

pub fn image_area(image: impl GenericImageView, rotate: f32) {
    let gray = grayscale_alpha(&image);
    let rotated = rotate_about_center(&gray, rotate, Interpolation::Nearest, LumaA([0, 0]));
}
