use image::Rgb;
use rand::distributions::WeightedIndex;
use rand::prelude::SmallRng;
use rand::{Rng, SeedableRng};
use rand::distributions::Distribution;

pub struct ColorPicker {
    rng: SmallRng,
    colors: Vec<Rgb<u8>>,
    weights: WeightedIndex<u32>,
}

impl ColorPicker {
    pub fn new<I>(inputs: I, seed: &SmallRng) -> Self where I: Iterator<Item=(Rgb<u8>, u32)> {
        let rng = SmallRng::from_rng(seed.clone()).expect("Failed to create rng");
        let mut colors = vec![];
        let mut weights = vec![];
        for (color, weight) in inputs {
            colors.push(color);
            weights.push(weight);
        }
        let mut dist = WeightedIndex::new(weights).expect("Failed to create weighted index");
        Self {
            rng,
            colors,
            weights: dist,
        }
    }
}

impl Iterator for ColorPicker {
    type Item = Rgb<u8>;

    fn next(&mut self) -> Option<Self::Item> {
        let index = self.weights.sample(&mut self.rng);
        // SAFETY: index is always in range
        unsafe {
            Some(*self.colors.get_unchecked(index))
        }
    }
}