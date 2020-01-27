use image::Rgb;
use rand::prelude::SmallRng;
use rand::Rng;

pub struct ColorSelector {
    rng: SmallRng,
    colors: Vec<Rgb<u8>>,
    weights: Vec<u32>,
}

impl Iterator for ColorSelector {
    type Item = Rgb<u8>;

    fn next(&mut self) -> Option<Self::Item> {
        let mut sum = 0;
        let mut rng = self.rng.gen_range(0..self.weights.iter().sum::<u32>());
        for (i, w) in self.weights.iter().enumerate() {
            sum += w;
            if rng < sum {
                return Some(self.colors[i]);
            }
        }
        None
    }
}