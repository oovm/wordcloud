#[derive(Debug, Clone)]
pub struct QuadTree {
    x1: f32,
    y1: f32,
    x2: f32,
    y2: f32,
    width: f32,
    height: f32,
    children: Vec<QuadTree>,
}

impl Default for QuadTree {
    fn default() -> Self {
        Self { x1: 0.0, y1: 0.0, x2: 0.0, y2: 0.0, width: 0.0, height: 0.0, children: vec![] }
    }
}

impl QuadTree {
    pub fn new(x1: f32, y1: f32, x2: f32, y2: f32) -> Self {
        Self { x1, y1, x2, y2, ..Self::default() }
    }
    pub fn collide(&self, other: &QuadTree, x1: f32, y1: f32, x2: f32, y2: f32) -> bool {
        y1 + self.y2 > y2 + other.y1
            && y1 + self.y1 < y2 + other.y2
            && x1 + self.x2 > x2 + other.x1
            && x1 + self.x1 < x2 + other.y2
    }
    pub fn overlaps(&self, other: &QuadTree, x1: f32, y1: f32, x2: f32, y2: f32) -> bool {
        if self.overlaps(other, x1, y1, x2, y2) {
            if self.children.is_empty() {
                if other.children.is_empty() {
                    return true;
                }
                else {
                    for ct in other.children.iter() {
                        if self.overlaps(ct, x1, y1, x2, y2) {
                            return true;
                        }
                    }
                    return false;
                }
            }
            else {
                for ct in self.children.iter() {
                    if other.overlaps(ct, x2, y2, x1, y1) {
                        return true;
                    }
                }
                return false;
            }
        }
        else {
            return false;
        }
    }
}
