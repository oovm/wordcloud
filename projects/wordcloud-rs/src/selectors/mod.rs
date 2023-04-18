use std::ops::Range;
use image::Rgb;
use rand::distributions::WeightedIndex;
use rand::prelude::SmallRng;

use rand::distributions::Distribution;
use rand::Rng;
use rand::seq::SliceRandom;

mod colors;
mod texts;

pub struct ColorPicker {
    colors: Vec<Rgb<u8>>,
    weights: WeightedIndex<u32>,
}

pub struct RotatePicker {
    // always in range [0, 180]
    directions: Vec<f32>,
    word_margin: u32,
}

impl Default for RotatePicker {
    fn default() -> Self {
        RotatePicker {
            directions: vec![],
            word_margin: 0,
        }
    }
}

impl RotatePicker {
    pub fn horizontal() -> Self {
        Self {
            directions: vec![0.0],
            ..Default::default()
        }
    }
    /// Can only take `45°` and `-45°`
    pub fn cross() -> Self {
        Self {
            directions: vec![45.0, 135.0],
            ..Default::default()
        }
    }
    pub fn extend(&mut self, sector: &Range<f32>, samples: usize) {
        let step = (sector.end - sector.start) / samples as f32;
        for i in 0..samples {
            let value = sector.start + step * i as f32;
            self.directions.push(value % 180.0);
        }
    }
    pub fn custom<I>(directions: I) -> Self where I: Iterator<Item=f32> {
        Self {
            directions: directions.collect(),
            ..Default::default()
        }
    }
    pub fn next(&self, rng: &mut SmallRng) -> f32 {
        assert!(self.directions.len() > 0, "No direction is available");
        // SAFETY:
        unsafe {
            *self.directions.choose(rng).unwrap_unchecked()
        }
    }
}