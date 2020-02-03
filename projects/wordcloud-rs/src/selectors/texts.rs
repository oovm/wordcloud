// use super::*;
//
// impl TextPicker {
//     pub fn new<I>(inputs: I, seed: &SmallRng) -> Self where I: Iterator<Item=(String, u32)> {
//         let rng = SmallRng::from_rng(seed.clone()).expect("Failed to create rng");
//         let mut texts = vec![];
//         let mut weights = vec![];
//         for (text, weight) in inputs {
//             texts.push(text);
//             weights.push(weight);
//         }
//         let mut dist = WeightedIndex::new(weights).expect("Failed to create weighted index");
//         Self {
//             rng,
//             texts,
//             weights: dist,
//         }
//     }
// }
//
// impl Iterator for TextPicker {
//     type Item = String;
//
//     fn next(&mut self) -> Option<Self::Item> {
//
//
//         let index = self.weights.sample(&mut self.rng);
//         // SAFETY: index is always in range
//         Some(self.texts.remove(index))
//     }
// }