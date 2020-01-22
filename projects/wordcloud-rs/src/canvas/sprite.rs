use crate::QuadTree;

#[derive(Debug, Clone)]
pub struct Sprite {
    x: f32,
    y: f32,
    rotate: f32,
    text: String,
    font_sie: f32,
    pub image: f32,
    tree: QuadTree,
}

impl Default for Sprite {
    fn default() -> Self {
        Self { text: String::new(), rotate: 0.0, x: 0.0, y: 0.0, tree: Default::default(), font_sie: 0.0, image: 0.0 }
    }
}

impl Sprite {
    pub fn from_font() -> Self {
        unimplemented!()
    }

    pub fn from_image() -> Self {
        unimplemented!()
    }

    fn build_tree(&self, integral: &Vec<Vec<f32>>, x1: f32, y1: f32, x2: f32, y2: f32) -> Option<QuadTree> {
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
            let c0 = self.build_tree(integral, x1, y1, cx, cy);
            let c1 = self.build_tree(integral, cx, y1, x2, cy);
            let c2 = self.build_tree(integral, x1, cy, cx, y2);
            let c3 = self.build_tree(integral, cx, cy, x2, y2);
            if let Some(qt) = c0 {
                children.push(qt)
            };
            if let Some(qt) = c1 {
                children.push(qt)
            };
            if let Some(qt) = c2 {
                children.push(qt)
            };
            if let Some(qt) = c3 {
                children.push(qt)
            }
            tree.children = children
        }
        return Some(tree);
    }
}
