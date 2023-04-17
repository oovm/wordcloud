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

#[test]
fn test() {
    let a: ([f64; 2], usize) = ([0f64, 0f64], 0);
    let b: ([f64; 2], usize) = ([1f64, 1f64], 1);
    let c: ([f64; 2], usize) = ([2f64, 2f64], 2);
    let d: ([f64; 2], usize) = ([3f64, 3f64], 3);

    let dimensions = 2;
    let mut kdtree = KdTree::new(dimensions);

    kdtree.add(&a.0, a.1).unwrap();
    kdtree.add(&b.0, b.1).unwrap();
    kdtree.add(&c.0, c.1).unwrap();
    kdtree.add(&d.0, d.1).unwrap();

    assert_eq!(kdtree.size(), 4);
    assert_eq!(
        kdtree.nearest(&a.0, 0, &squared_euclidean).unwrap(),
        vec![]
    );
    assert_eq!(
        kdtree.nearest(&a.0, 1, &squared_euclidean).unwrap(),
        vec![(0f64, &0)]
    );
    assert_eq!(
        kdtree.nearest(&a.0, 2, &squared_euclidean).unwrap(),
        vec![(0f64, &0), (2f64, &1)]
    );
    assert_eq!(
        kdtree.nearest(&a.0, 3, &squared_euclidean).unwrap(),
        vec![(0f64, &0), (2f64, &1), (8f64, &2)]
    );
    assert_eq!(
        kdtree.nearest(&a.0, 4, &squared_euclidean).unwrap(),
        vec![(0f64, &0), (2f64, &1), (8f64, &2), (18f64, &3)]
    );
    assert_eq!(
        kdtree.nearest(&a.0, 5, &squared_euclidean).unwrap(),
        vec![(0f64, &0), (2f64, &1), (8f64, &2), (18f64, &3)]
    );
    assert_eq!(
        kdtree.nearest(&b.0, 4, &squared_euclidean).unwrap(),
        vec![(0f64, &1), (2f64, &0), (2f64, &2), (8f64, &3)]
    );
}