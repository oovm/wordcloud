mod sprite;
mod tree;

use crate::Result;
use image::{DynamicImage, GenericImageView};
use rand::{distributions::WeightedIndex, thread_rng, Rng};
pub use sprite::Sprite;
use std::collections::BTreeSet;
pub use tree::QuadTree;

#[derive(Debug, Clone)]
pub struct Canvas {
    size: f32,
    width: u32,
    height: u32,
    regions: Vec<Sprite>,
    shape_mask: DynamicImage,
    color_mask: DynamicImage,
    bounds: QuadTree,
}

impl Default for Canvas {
    fn default() -> Self {
        let width = 168; // 1.618
        let height = 100;
        Self {
            size: 50.0,
            width,
            height,
            regions: vec![],
            shape_mask: DynamicImage::new_bgr8(width, height),
            color_mask: DynamicImage::new_bgr8(width, height),
            bounds: QuadTree { x1: 0.0, y1: 0.0, x2: 0.0, y2: 0.0, width, height, children: vec![] },
        }
    }
}

impl Canvas {
    fn add_sprite(&self, sprite: Sprite, x: f32, y: f32) {
        let width = sprite.width();
        let height = sprite.height();
        let from_x = x / self.size;
        let from_y = y / self.size;
        let into_x = (x + width) / self.size;
        let into_y = (y + height) / self.size;
        for i in from_x..=into_x {
            for j in from_y..into_y {
                let key = format!("{}-{}", i, j);
                if !self.regions.contains(key) {
                    self.regions.key = vec![]
                }
                self.regions.key.append(sprite)
            }
        }
    }
    fn check_sprite(&self, sprite: Sprite, x: f32, y: f32) {
        let width = sprite.width();
        let height = sprite.height();
        let from_x = x / self.size;
        let from_y = y / self.size;
        let into_x = (x + width) / self.size;
        let into_y = (y + height) / self.size;
        let mut region_need_to_check = vec![];
        for i in from_x..=into_x {
            for j in from_y..into_y {
                let key = format!("{}-{}", i, j);
                if self.regions.contains(key) {
                    region_need_to_check = BTreeSet(region_need_to_check + self.regions.key)
                }
                self.regions.key.append(sprite)
            }
        }
        return region_need_to_check;
    }

    pub fn draw(&self, words: Vec<(Sprite, u32)>) {
        let mut sprites = vec![];
        for (sprite, weight) in words {}
        let mut prev_sprite = false;
        let mut offset = 0;
        let mut i = 0;
        let should_fast_skip = 0.8;
        while i < sprites.len() {
            if !(prev_sprite
                && ((sprite.img.size[0] * sprite.img.size[1]) / (prev_sprite.img.size[0] * prev_sprite.img.size[1])
                    > should_fast_skip))
            {
                offset = 0
            }
            let (x, y, offset) = find_position();
            if x.is_none {
                if prev_sprite.is_none() {
                    break;
                };
                prev_sprite = None;
                offset = 0;
                continue;
            }
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
            prev_sprite = sprite;
            bounds.add_sprite(sprite, x, y);
            sprite.x = x;
            sprite.y = y;
            // 在画布上绘制单词
            size = font.getsize(sprite.text);
            img_txt = Image.new("RGBA", (size[0] + 2, size[1] + 2));
            draw_txt = ImageDraw.Draw(img_txt);
            let color = self.color_mask.get_pixel(x, y);
            draw_txt.text((1, 1), sprite.text);

            img_txt = img_txt.rotate(sprite.rotate);
            img.alpha_composite(img_txt, (x, y))
        }
    }
}

pub fn sample_rotate(choices: &[u32], weights: &[u32]) -> Result<u32> {
    let n = if choices.is_empty() {
        0
    }
    else {
        let mut dist = WeightedIndex::new(weights)?;
        unsafe { choices.get_unchecked(dist.sample(&mut thread_rng())) }
    };
    Ok(n)
}
