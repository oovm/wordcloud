mod canvas;
mod layout;

pub use canvas::{Canvas, QuadTree, Sprite};

mod errors;
mod fonts;

pub const FAST_SKIP_THRESHOLD: f32 = 0.8;
pub const MINIMUM_COLLISION_RESOLUTION: f32 = 2.0;

use crate::canvas::sample_rotate;
pub use errors::{Error, Result};
use image::{imageops::FilterType, DynamicImage, GenericImageView};
use rand::{rngs::StdRng, thread_rng, SeedableRng};
use std::collections::HashMap;

#[derive(Debug, Clone, Default)]
pub enum RenderDevice {
    Native = 0,
    Wasm = 1,
    GPU = 2,
}

#[derive(Debug, Clone)]
pub struct WordCloud {
    width: u32,
    height: u32,
    sprite: Vec<Sprite>,
    sprite_weights: Vec<u32>,
    font: String,
    font_size: f32,
    rotate: Vec<u32>,
    rotate_weights: Vec<u32>,
    shape_mask: Option<DynamicImage>,
    color_mask: Option<DynamicImage>,
    rng: StdRng,
    device: RenderDevice,
}

impl Default for WordCloud {
    fn default() -> Self {
        Self {
            width: 161,
            height: 100,
            sprite: vec![],
            sprite_weights: vec![],
            font: String::from("Helvetica"),
            font_size: 10.0,
            rotate: None,
            rotate_weights: vec![],
            shape_mask: None,
            color_mask: None,
            rng: StdRng::from_rng(thread_rng()).unwrap(),
            device: RenderDevice::Native,
        }
    }
}

impl WordCloud {
    pub fn append_text(&mut self, text: &str, weight: u32) -> Result<()> {
        let r = sample_rotate(&self.rotate, &self.rotate_weights)?;

        let s = Sprite::from_text(text, &self.font, self.font_size, r);
        self.sprite.push(s);
        self.sprite_weights.push(weight);
        return Ok(());
    }
    pub fn append_image(&mut self, img: &DynamicImage, weight: u32) -> Result<()> {
        let r = sample_rotate(&self.rotate, &self.rotate_weights)?;
        let s = Sprite::from_image(img, r);
        self.sprite.push(s);
        self.sprite_weights.push(weight);
        return Ok(());
    }

    pub fn append_sprite(&mut self, s: &Sprite, weight: u32) -> Result<()> {
        self.sprite.push(s.clone());
        self.sprite_weights.push(weight);
        return Ok(());
    }
    pub fn clean_sprites(&mut self) -> Result<()> {
        self.sprite = vec![];
        self.sprite_weights = vec![];
        return Ok(());
    }

    pub fn set_canvas(&mut self, width: u32, height: u32) -> Result<()> {
        self.width = width;
        self.height = height;
        if let Some(s) = &mut self.shape_mask {
            s.resize_exact(width, height, FilterType::Nearest)
        }
        if let Some(s) = &mut self.color_mask {
            s.resize_exact(width, height, FilterType::Nearest)
        };
        return Ok(());
    }

    pub fn set_shape_mask(&mut self, img: &DynamicImage) -> Result<()> {
        self.width = img.width();
        self.height = img.height();
        self.shape_mask = Some(img.clone());
        return Ok(());
    }

    pub fn set_color_mask(&mut self, img: &DynamicImage) -> Result<()> {
        let c = img.resize_exact(self.width, self.height, FilterType::Nearest);
        self.color_mask = Some(c);
        return Ok(());
    }

    pub fn set_rotate_set(&mut self, set: &HashMap<u32, u32>) -> Result<()> {
        let mut rotate = vec![];
        for (r, w) in set {
            rotate.push((*r, *w))
        }
        self.rotate = Some(rotate);
        return Ok(());
    }

    pub fn set_font(&mut self, font: &str, font_size: f32) -> Result<()> {
        self.font = String::from(font);
        self.font_size = font_size;
        return Ok(());
    }

    pub fn new_rng(&mut self) -> Result<()> {
        self.rng = StdRng::from_rng(thread_rng())?;
        return Ok(());
    }
}
