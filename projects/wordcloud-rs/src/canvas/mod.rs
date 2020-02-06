mod sprite;
mod tree;

use crate::{Layout, WResult, FAST_SKIP_THRESHOLD};
use image::{DynamicImage, GenericImageView};
use rand::{distributions::WeightedIndex, thread_rng, Rng};
pub use sprite::Sprite;
use std::collections::{hash_map::RandomState, BTreeSet, HashMap, HashSet};
pub use tree::QuadTree;

#[derive(Debug, Clone)]
pub struct Canvas {
    grid_size: u32,
    width: u32,
    height: u32,
    regions: HashMap<(u32, u32), Vec<Sprite>>,
    shape_mask: DynamicImage,
    color_mask: DynamicImage,
    bounds: QuadTree,
    layout: Layout,
}



impl Default for Canvas {
    fn default() -> Self {
        let width = 168; // 1.618
        let height = 100;
        Self {
            grid_size: 50,
            width,
            height,
            regions: HashMap::new(),
            shape_mask: DynamicImage::new_bgr8(width, height),
            color_mask: DynamicImage::new_bgr8(width, height),
            bounds: QuadTree { x1: 0, y1: 0, x2: 0, y2: 0, width, height, children: vec![] },
            layout: Layout::Archimedes,
        }
    }
}

impl Canvas {
    pub fn add_sprite(&mut self, sprite: &Sprite, x: u32, y: u32) {
        let width = sprite.width();
        let height = sprite.height();
        let from_x = x / self.grid_size;
        let from_y = y / self.grid_size;
        let into_x = (x + width) / self.grid_size;
        let into_y = (y + height) / self.grid_size;
        for i in from_x..=into_x {
            for j in from_y..into_y {
                self.regions.entry((i, j)).or_insert(vec![]).push(sprite.clone());
            }
        }
    }
    pub fn check_sprite(self, sprite: &Sprite, x: u32, y: u32) -> HashSet<Sprite> {
        let width = sprite.width();
        let height = sprite.height();
        let from_x = x / self.grid_size;
        let from_y = y / self.grid_size;
        let into_x = (x + width) / self.grid_size;
        let into_y = (y + height) / self.grid_size;
        let mut region_need_to_check = HashSet::new();
        for i in from_x..=into_x {
            for j in from_y..into_y {
                if let Some(key) = self.regions.get(&(i, j)) {
                    region_need_to_check.extend(key)
                }
            }
        }
        return region_need_to_check;
    }

    pub fn draw(&self, words: Vec<(Sprite, u32)>) {
        let mut sprites = vec![];
        let mut sprite = Sprite::from_text();
        let mut prev_sprite = Some(sprite);
        let mut offset = 0;
        let mut i = 0;
        let mut x = 0;
        let mut y = 0;
        while i < sprites.len() {
            if prev_sprite.is_none()
                || (sprite.width() * sprite.height()) as f32
                    / (prev_sprite.unwrap().width() * prev_sprite.unwrap().height()) as f32
                    <= FAST_SKIP_THRESHOLD
            {
                offset = 0
            }
            match self.find_position(&sprite, offset) {
                Some((a, b, c)) => {
                    x = a;
                    y = b;
                    offset = c;
                }
                None => {
                    if prev_sprite.is_none() {
                        break;
                    };
                    prev_sprite = None;
                    offset = 0;
                    continue;
                }
            };
            if x > width || x < 0 || y > height || y < 0 {
                if !prev_sprite.is_none() {
                    break;
                }
                prev_sprite = None;
                offset = 0;
                continue;
            };

            println!("放置第 {} 个词语: {} at {} {}", i, sprite.text, x, y);
            i += 1;
            prev_sprite = Some(sprite.clone());
            bounds.add_sprite(&sprite, x, y);
            sprite.x = x;
            sprite.y = y;
            // 在画布上绘制单词
            size = font.getsize(sprite.text);

            let color = self.color_mask.get_pixel(x, y);
            draw_txt = ImageDraw.Draw(img_txt);
        }
    }
}

impl Canvas {
    fn find_position(&self, s: &Sprite, offset: u32) -> Option<(u32, u32, u32)> {
        self.layout.find_position(s, self, offset)
    }
}

pub fn sample_rotate(choices: &[u32], weights: &[u32]) -> WResult<u32> {
    let n = if choices.is_empty() {
        0
    }
    else {
        let mut dist = WeightedIndex::new(weights)?;
        unsafe { choices.get_unchecked(dist.sample(&mut thread_rng())) }
    };
    Ok(n)
}
