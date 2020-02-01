use shape_core::{Itertools, Rectangle};

pub type AABB = Rectangle<u32>;

/// A pixel-level quadtree
///
/// Points out of bounds are considered filled
pub struct PixelVolumeNode {
    pub bound: AABB,
    pub children: PixelVolume,
}

/// Same as Option<[Box<PixelVolumeNode>; 4]>,
pub enum PixelVolume {
    /// A single pixel, true if it is filled
    EmptyArea,
    FilledArea {
        a: Box<PixelVolumeNode>,
        b: Box<PixelVolumeNode>,
        c: Box<PixelVolumeNode>,
        d: Box<PixelVolumeNode>,
    },
}

impl PixelVolumeNode {
    pub fn new(width: u32, height: u32) -> Self {
        Self {
            bound: AABB::new(0, 0, width, height),
            children: PixelVolume::EmptyArea,
        }
    }
    pub fn collide(&mut self, other: &PixelVolumeNode) -> bool {

    }
}