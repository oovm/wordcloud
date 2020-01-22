mod canvas;
mod layout;

pub use canvas::{Canvas, QuadTree, Sprite};

mod errors;
mod fonts;

pub const FAST_SKIP_THRESHOLD: f32 = 0.8;
pub const MINIMUM_COLLISION_RESOLUTION: f32 = 2.0;

pub use errors::{Error, Result};
use image::{imageops::FilterType, DynamicImage, GenericImageView};
use rand::{rngs::StdRng, thread_rng, SeedableRng};

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
    sprites: Vec<Sprite>,
    font: String,
    font_size: f32,
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
            sprites: vec![],
            font: String::from(""),
            font_size: 10.0,
            shape_mask: None,
            color_mask: None,
            rng: StdRng::from_rng(thread_rng()).unwrap(),
            device: RenderDevice::Native,
        }
    }
}

impl WordCloud {
    pub fn append_text(&mut self, text: &str) {
        let s = Sprite::from_text(text, &self.font, self.font_size);
        self.sprites.push(s)
    }
    pub fn append_image(&mut self, img: &DynamicImage) {
        let s = Sprite::from_image(img);
        self.sprites.push(s)
    }

    pub fn append_sprite(&mut self, s: &Sprite) {
        self.sprites.push(s.clone())
    }

    pub fn set_canvas(&mut self, width: u32, height: u32) {
        self.width = width;
        self.height = height;
        if let Some(s) = &mut self.shape_mask {
            s.resize_exact(width, height, FilterType::Nearest)
        }
        if let Some(s) = &mut self.color_mask {
            s.resize_exact(width, height, FilterType::Nearest)
        }
    }

    pub fn set_shape_mask(&mut self, img: &DynamicImage) {
        self.width = img.width();
        self.height = img.height();
        self.shape_mask = Some(img.clone());
    }

    pub fn set_color_mask(&mut self, img: &DynamicImage) {
        let c = img.resize_exact(self.width, self.height, FilterType::Nearest);
        self.color_mask = Some(c)
    }

    pub fn set_font(&mut self, font: &str, font_size: f32) {
        self.font = String::from(font);
        self.font_size = font_size
    }

    pub fn new_rng(&mut self) {
        self.rng = StdRng::from_rng(thread_rng()).unwrap()
    }
}
