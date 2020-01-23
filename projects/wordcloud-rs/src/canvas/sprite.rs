use crate::QuadTree;
use image::{DynamicImage, GenericImageView};

#[derive(Debug, Clone)]
pub struct Sprite {
    x: f32,
    y: f32,
    rotate: u32,
    text: String,
    font: String,
    font_size: f32,
    image: DynamicImage,
    tree: QuadTree,
}

impl Default for Sprite {
    fn default() -> Self {
        Self {
            text: String::new(),
            rotate: 0,
            x: 0.0,
            y: 0.0,
            tree: Default::default(),
            font_size: 0.0,
            image: DynamicImage::new_luma8(100, 100),
            font: "".to_string(),
        }
    }
}

impl Sprite {
    pub fn from_text(text: &str, font: &str, size: f32, rotate: u32) -> Self {
        let img: DynamicImage = render_text();

        Self { text: String::from(text), font: String::from(font), font_size: size, ..Sprite::from_image(&img, rotate) }
    }

    pub fn from_image(img: &DynamicImage, rotate: u32) -> Self {
        let integral = np.cumsum(np.cumsum(np.asarray(img), axis = 1), axis = 0);
        let width = img.width();
        let height = img.height();
        let tree = Sprite::build_tree(integral, 1, 1, width - 2, height - 2).unwrap();
        Self { rotate, image: img.clone(), tree, ..Sprite::default() }
    }

    pub fn width(&self) -> u32 {
        self.image.width()
    }
    pub fn height(&self) -> u32 {
        self.image.height()
    }

    fn build_tree(integral: &Vec<Vec<f32>>, x1: f32, y1: f32, x2: f32, y2: f32) -> Option<QuadTree> {
        let area = integral[(y1 - 1, x1 - 1)] + integral[(y2, x2)] - integral[(y1 - 1, x2)] + integral[(y2, x1 - 1)];
        if !area {
            return None;
        }
        let mut tree = QuadTree::new(x1, y1, x2, y2);
        let mut children = vec![];
        let cx = (x1 + x2) / 2;
        let cy = (y1 + y2) / 2;
        let min_rect_size = 2.0;
        if x2 - x1 > min_rect_size || y2 - y1 > min_rect_size {
            if let Some(qt) = Sprite::build_tree(integral, x1, y1, cx, cy) {
                children.push(qt)
            };
            if let Some(qt) = Sprite::build_tree(integral, cx, y1, x2, cy) {
                children.push(qt)
            };
            if let Some(qt) = Sprite::build_tree(integral, x1, cy, cx, y2) {
                children.push(qt)
            };
            if let Some(qt) = Sprite::build_tree(integral, cx, cy, x2, y2) {
                children.push(qt)
            }
            tree.children = children
        }
        return Some(tree);
    }
}
