mod sprite;
mod tree;

pub use sprite::Sprite;
use std::collections::BTreeSet;
pub use tree::QuadTree;

pub struct Canvas {
    size: f32,
    width: f32,
    height: f32,
    regions: Vec<Sprite>,
}

impl Default for Canvas {
    fn default() -> Self {
        Self { size: 50.0, width: 0.0, height: 0.0, regions: vec![] }
    }
}

impl Canvas {
    pub fn add_sprite(&self, sprite: Sprite, x: f32, y: f32) {
        let width = sprite.image;
        let height = sprite.image;
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
    pub fn check_sprite(&self, sprite: Sprite, x: f32, y: f32) {
        let width = sprite.image;
        let height = sprite.image;
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
}
