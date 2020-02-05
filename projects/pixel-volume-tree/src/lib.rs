#![feature(box_syntax)]
#![feature(iter_from_generator)]
#![feature(generators)]

use std::iter::from_generator;
use shape_core::{Itertools, Point, Rectangle};
// mod tree;

pub type AABB = Rectangle<u32>;

/// A node in the quadtree
///
/// Same as Option<[Box<PixelVolumeNode>; 4]>,
pub enum PixelVolumeNode {
    /// A single pixel, true if it is filled
    Pixel {
        point: Point<u32>,
        value: bool,
    },
    PureArea {
        bound: AABB,
        value: bool,
    },
    SplitArea {
        bound: AABB,
        areas: Vec<PixelVolumeNode>,
    },
}

impl PixelVolumeNode {
    pub fn new(bound: AABB, value: bool) -> Self {
        if bound.width() == 1 && bound.height() == 1 {
            PixelVolumeNode::Pixel {
                point: bound.origin(),
                value,
            }
        } else {
            PixelVolumeNode::PureArea { bound, value }
        }
    }
    pub fn boundary(&self) -> AABB {
        match self {
            PixelVolumeNode::Pixel { point, .. } => AABB::new(point.x, point.y, 1, 1),
            PixelVolumeNode::PureArea { bound, .. } => *bound,
            PixelVolumeNode::SplitArea { bound, .. } => *bound,
        }
    }
    pub fn get_areas(&self) -> impl Iterator<Item=&PixelVolumeNode> {
        from_generator(move || {
            if let PixelVolumeNode::SplitArea { areas, .. } = self {
                for area in areas {
                    yield area;
                }
            }
        })
    }
    pub fn mut_areas(&mut self) -> impl Iterator<Item=&mut PixelVolumeNode> {
        from_generator(move || {
            if let PixelVolumeNode::SplitArea { areas, .. } = self {
                for area in areas {
                    yield area;
                }
            }
        })
    }
    pub fn contains_pixel(&self, x: u32, y: u32) -> bool {
        match self {
            PixelVolumeNode::Pixel { point, value } => {
                point.x == x && point.y == y && *value
            }
            PixelVolumeNode::PureArea { bound, value } => {
                bound.contains(&Point::new(x, y)) && *value
            }
            PixelVolumeNode::SplitArea { bound, areas } => {
                if bound.contains(&Point::new(x, y)) {
                    for area in areas {
                        if area.contains_pixel(x, y) {
                            return true;
                        }
                    }
                }
                false
            }
        }
    }
    pub fn contains_box(&self, other: &AABB) -> bool {
        match self {
            PixelVolumeNode::Pixel { point, value } => {
                match value {
                    true => other.contains(point),
                    false => false,
                }
            }
            PixelVolumeNode::PureArea { bound, value } => {
                match value {
                    true => bound.overlaps(other),
                    false => false,
                }
            }
            PixelVolumeNode::SplitArea { bound, areas } => {
                if bound.overlaps(other) {
                    for area in areas {
                        if area.contains_box(other) {
                            return true;
                        }
                    }
                }
                false
            }
        }
    }
    pub fn contains_tree(&self, other: &PixelVolumeNode) -> bool {
        match self {
            PixelVolumeNode::Pixel { point, value } => {
                match value {
                    true => other.contains_pixel(point.x, point.y),
                    false => false,
                }
            }
            PixelVolumeNode::PureArea { bound, value } => {
                match value {
                    true => other.contains_box(bound),
                    false => false,
                }
            }
            PixelVolumeNode::SplitArea { bound, areas } => {
                if bound.overlaps(&other.boundary()) {
                    for area in areas {
                        if area.contains_tree(other) {
                            return true;
                        }
                    }
                }
                false
            }
        }
    }
}

impl PixelVolumeNode {
    pub fn split(&mut self) {
        match self {
            // do nothing
            PixelVolumeNode::Pixel { .. } => {}
            // do nothing
            PixelVolumeNode::SplitArea { .. } => {}
            PixelVolumeNode::PureArea { bound, .. } => {
                let sx = bound.min.x;
                let sy = bound.min.y;
                let mx = bound.center().x;
                let my = bound.center().y;
                let ex = bound.max.x;
                let ey = bound.max.y;
                let areas = vec![
                    PixelVolumeNode::new(AABB::new(sx, sy, mx, my), false),
                    PixelVolumeNode::new(AABB::new(mx, sy, ex, my), false),
                    PixelVolumeNode::new(AABB::new(sx, my, mx, ey), false),
                    PixelVolumeNode::new(AABB::new(mx, my, ex, ey), false),
                ];
                *self = PixelVolumeNode::SplitArea {
                    bound: *bound,
                    areas,
                };
            }
        }
    }
    pub fn insert_pixel(&mut self, x: u32, y: u32) {
        match self {
            PixelVolumeNode::Pixel { point, value } => {
                if point.x != x || point.y != y {
                    return;
                }
                *value = true;
            }
            PixelVolumeNode::PureArea { bound, value } => {
                if *value || bound.contains(&Point::new(x, y)) {
                    return;
                }
                self.split();
                for area in self.mut_areas() {
                    if area.contains_pixel(x, y) {
                        area.insert_pixel(x, y);
                        break;
                    }
                }
            }
            PixelVolumeNode::SplitArea { bound, areas } => {
                if bound.contains(&Point::new(x, y)) {
                    for area in areas {
                        if area.contains_pixel(x, y) {
                            area.insert_pixel(x, y);
                            break;
                        }
                    }
                }
            }
        }
    }
    pub fn refine(&mut self) {
        todo!()
    }
}