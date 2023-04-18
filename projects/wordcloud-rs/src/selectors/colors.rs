use super::*;


impl ColorPicker {
    pub fn new<I>(inputs: I) -> Self where I: Iterator<Item=(Rgb<u8>, u32)> {
        let mut colors = vec![];
        let mut weights = vec![];
        for (color, weight) in inputs {
            colors.push(color);
            weights.push(weight);
        }
        let dist = WeightedIndex::new(weights).expect("Failed to create weighted index");
        Self {
            colors,
            weights: dist,
        }
    }
    pub fn next(&self, rng: &mut SmallRng) -> Rgb<u8> {
        let index = self.weights.sample(rng);
        // SAFETY: index is always in range
        unsafe {
            *self.colors.get_unchecked(index)
        }
    }
}
