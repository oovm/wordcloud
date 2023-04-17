

// mod canvas;
// mod errors;
mod fonts;
// mod layout;
//
// use crate::canvas::sample_rotate;
// use image::{imageops::FilterType, DynamicImage, GenericImageView};
// use rand::{rngs::StdRng, thread_rng, SeedableRng};
// use std::collections::HashMap;
//
// pub use crate::{
//     canvas::{Canvas, QuadTree, Sprite},
//     errors::{Error, Result},
//     layout::{ColorFunction, Layout, RenderDevice, RescaleWeight},
// };
//
// pub const FAST_SKIP_THRESHOLD: f32 = 0.8;
// pub const MINIMUM_COLLISION_RESOLUTION: u32 = 2;
//
// #[derive(Debug, Clone)]
// pub struct WordCloud {
//     width: u32,
//     height: u32,
//     grid_size: u32,
//     sprite: Vec<Sprite>,
//     sprite_weights: Vec<u32>,
//     font: String,
//     font_size: u32,
//     rotate: Vec<u32>,
//     rotate_weights: Vec<u32>,
//     shape_mask: Option<DynamicImage>,
//     /// this will disable `color_function`
//     color_mask: Option<DynamicImage>,
//     color_bg: Option<Rgb8>,
//     color_function: ColorFunction,
//     rescale: RescaleWeight,
//     layout: Layout,
//     rng: StdRng,
//     device: RenderDevice,
// }
//
// impl Default for WordCloud {
//     fn default() -> Self {
//         Self {
//             width: 640,
//             height: 480,
//             grid_size: 80,
//             sprite: vec![],
//             sprite_weights: vec![],
//             font: String::from("Helvetica"),
//             font_size: 10,
//             rotate: vec![],
//             rotate_weights: vec![],
//             shape_mask: None,
//             color_mask: None,
//             color_bg: None,
//             color_function: ColorFunction::Random,
//             rescale: RescaleWeight::Linear,
//             layout: Layout::Archimedes,
//             rng: StdRng::from_rng(thread_rng()).unwrap(),
//             device: RenderDevice::Native,
//         }
//     }
// }
//
// impl WordCloud {
//     pub fn set_canvas(&mut self, width: u32, height: u32) -> &mut Self {
//         self.width = width;
//         self.height = height;
//         if let Some(s) = &mut self.shape_mask {
//             s.resize_exact(width, height, FilterType::Nearest)
//         }
//         if let Some(s) = &mut self.color_mask {
//             s.resize_exact(width, height, FilterType::Nearest)
//         };
//         return self;
//     }
//
//     pub fn set_shape_mask(&mut self, img: &DynamicImage) -> &mut Self {
//         self.width = img.width();
//         self.height = img.height();
//         self.shape_mask = Some(img.clone());
//         return self;
//     }
//
//     pub fn set_color_mask(&mut self, img: &DynamicImage) -> &mut Self {
//         let c = img.resize_exact(self.width, self.height, FilterType::Nearest);
//         self.color_mask = Some(c);
//         return self;
//     }
//
//     pub fn set_rotate_set(&mut self, set: &HashMap<u32, u32>) -> &mut Self {
//         self.rotate.clear();
//         self.rotate_weights.clear();
//         for (r, w) in set {
//             self.rotate.push(*r);
//             self.rotate_weights.push(*w)
//         }
//         return self;
//     }
//
//     pub fn set_font(&mut self, font: &str, font_size: u32) -> &mut Self {
//         self.font = String::from(font);
//         self.font_size = font_size;
//         return self;
//     }
// }
//
// impl WordCloud {
//     pub fn append_text(&mut self, text: &str, weight: u32) -> Result<()> {
//         let r = sample_rotate(&self.rotate, &self.rotate_weights)?;
//         let s = Sprite::from_text(text, &self.font, self.font_size, r);
//         self.sprite.push(s);
//         self.sprite_weights.push(weight);
//         return Ok(());
//     }
//     pub fn append_image(&mut self, img: &DynamicImage, weight: u32) -> Result<()> {
//         let r = sample_rotate(&self.rotate, &self.rotate_weights)?;
//         let s = Sprite::from_image(img, r);
//         self.sprite.push(s);
//         self.sprite_weights.push(weight);
//         return Ok(());
//     }
//
//     pub fn append_sprite(&mut self, s: &Sprite, weight: u32) -> Result<()> {
//         self.sprite.push(s.clone());
//         self.sprite_weights.push(weight);
//         return Ok(());
//     }
//     pub fn clean_sprites(&mut self) -> Result<()> {
//         self.sprite.clear();
//         self.sprite_weights.clear();
//         return Ok(());
//     }
//
//     pub fn new_rng(&mut self) -> Result<()> {
//         self.rng = StdRng::from_rng(thread_rng())?;
//         return Ok(());
//     }
// }
//
// impl WordCloud {
//     pub fn render_svg(&self) {
//         unimplemented!()
//     }
//     pub fn render_canvas(&self) {
//         unimplemented!()
//     }
//
//     pub fn render_image(&self) {
//         unimplemented!()
//     }
// }
