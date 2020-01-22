mod tree;

use tree::QuadTree;

#[derive(Debug, Clone)]
pub struct Sprite {
    text: String,
    rotate: f32,
    x: f32,
    y: f32,
    tree: QuadTree,
    font_sie: f32,
    img: f32,
}

impl Default for Sprite {
    fn default() -> Self {
        Self { text: String::new(), rotate: 0.0, x: 0.0, y: 0.0, tree: Default::default(), font_sie: 0.0, img: 0.0 }
    }
}

impl Sprite {
    pub fn from_font() -> Self {
        unimplemented!()
    }

    pub fn from_image() -> Self {
        unimplemented!()
    }
}
