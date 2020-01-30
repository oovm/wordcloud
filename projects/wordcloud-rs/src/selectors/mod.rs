use image::Rgb;
use rand::distributions::WeightedIndex;
use rand::prelude::SmallRng;
use rand::{SeedableRng};
use rand::distributions::Distribution;

mod colors;
mod texts;

pub struct ColorPicker {
    rng: SmallRng,
    colors: Vec<Rgb<u8>>,
    weights: WeightedIndex<u32>,
}


pub struct TextPicker {
    rng: SmallRng,
    texts: Vec<String>,
    weights: WeightedIndex<u32>,
}