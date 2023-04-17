#[derive(Debug, Clone)]
pub struct QuadTree {
    pub x1: u32,
    pub y1: u32,
    pub x2: u32,
    pub y2: u32,
    pub width: u32,
    pub height: u32,
    pub children: Vec<QuadTree>,
}

impl Default for QuadTree {
    fn default() -> Self {
        Self { x1: 0, y1: 0, x2: 0, y2: 0, width: 0, height: 0, children: vec![] }
    }
}

impl QuadTree {
    pub fn new(x1: u32, y1: u32, x2: u32, y2: u32) -> Self {
        Self { x1, y1, x2, y2, ..Self::default() }
    }
    pub fn collide(&self, other: &QuadTree, x1: u32, y1: u32, x2: u32, y2: u32) -> bool {
        y1 + self.y2 > y2 + other.y1
            && y1 + self.y1 < y2 + other.y2
            && x1 + self.x2 > x2 + other.x1
            && x1 + self.x1 < x2 + other.y2
    }
    pub fn overlaps(&self, other: &QuadTree, x1: u32, y1: u32, x2: u32, y2: u32) -> bool {
        if self.overlaps(other, x1, y1, x2, y2) {
            if self.children.is_empty() {
                if other.children.is_empty() {
                    return true;
                } else {
                    other.children.iter().any(|ct| self.overlaps(ct, x1, y1, x2, y2))
                }
            } else {
                self.children.iter().any(|ct| other.overlaps(ct, x2, y2, x1, y1))
            }
        } else {
            return false;
        }
    }
}

use kdtree::KdTree;
use kdtree::ErrorKind;
use kdtree::distance::squared_euclidean;
