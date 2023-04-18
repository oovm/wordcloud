use std::iter::from_generator;
use shape_core::{Point, Rectangle};


pub type AABB = Rectangle<u32>;

/// A node in the quadtree
///
/// Same as Option<[Box<PixelVolumeNode>; 4]>,
pub enum PixelVolumeTree {
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
        areas: Vec<PixelVolumeTree>,
    },
}

impl PixelVolumeTree {
    pub fn new(bound: AABB, value: bool) -> Option<Self> {
        if bound.width() == 0 || bound.height() == 0 {
            None
        } else if bound.width() == 1 && bound.height() == 1 {
            Some(PixelVolumeTree::Pixel {
                point: bound.origin(),
                value,
            })
        } else {
            Some(PixelVolumeTree::PureArea { bound, value })
        }
    }
    pub fn boundary(&self) -> AABB {
        match self {
            PixelVolumeTree::Pixel { point, .. } => AABB::new(point.x, point.y, 1, 1),
            PixelVolumeTree::PureArea { bound, .. } => *bound,
            PixelVolumeTree::SplitArea { bound, .. } => *bound,
        }
    }
    pub fn get_areas(&self) -> impl Iterator<Item=&PixelVolumeTree> {
        from_generator(move || {
            if let PixelVolumeTree::SplitArea { areas, .. } = self {
                for area in areas {
                    yield area;
                }
            }
        })
    }
    pub fn mut_areas(&mut self) -> impl Iterator<Item=&mut PixelVolumeTree> {
        from_generator(move || {
            if let PixelVolumeTree::SplitArea { areas, .. } = self {
                for area in areas {
                    yield area;
                }
            }
        })
    }
    pub fn get_boxes(&self, shift: Point<u32>) -> Vec<AABB> {
        let mut boxes = Vec::with_capacity(4);
        match self {
            PixelVolumeTree::Pixel { point, value } => {
                if *value {
                    boxes.push(AABB::new(point.x + shift.x, point.y + shift.y, 1, 1));
                }
            }
            PixelVolumeTree::PureArea { bound, value } => {
                if *value {
                    boxes.push(AABB::new(bound.min.x + shift.x, bound.min.y + shift.y, bound.width(), bound.height()));
                }
            }
            PixelVolumeTree::SplitArea { bound, areas } => {
                for area in areas {
                    let shift = Point::new(shift.x + bound.min.x, shift.y + bound.min.y);
                    boxes.extend(area.get_boxes(shift));
                }
            }
        }
        boxes
    }
    pub fn get_pixels(&self, shift: Point<u32>) -> Vec<Point<u32>> {
        let mut pixels = Vec::with_capacity(self.boundary().area() as usize);
        match self {
            PixelVolumeTree::Pixel { point, value } => {
                if *value {
                    pixels.push(Point::new(point.x + shift.x, point.y + shift.y))
                }
            }
            PixelVolumeTree::PureArea { bound, value } => {
                if *value {
                    for x in bound.min.x..=bound.max.x {
                        for y in bound.min.y..=bound.max.y {
                            pixels.push(Point::new(x + shift.x, y + shift.y));
                        }
                    }
                }
            }
            PixelVolumeTree::SplitArea { bound, areas } => {
                for area in areas {
                    let shift = Point::new(shift.x + bound.min.x, shift.y + bound.min.y);
                    pixels.extend(area.get_pixels(shift));
                }
            }
        }
        pixels
    }
    pub fn contains_pixel(&self, x: u32, y: u32) -> bool {
        match self {
            PixelVolumeTree::Pixel { point, value } => {
                point.x == x && point.y == y && *value
            }
            PixelVolumeTree::PureArea { bound, value } => {
                bound.contains(&Point::new(x, y)) && *value
            }
            PixelVolumeTree::SplitArea { bound, areas } => {
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
            PixelVolumeTree::Pixel { point, value } => {
                match value {
                    true => other.contains(point),
                    false => false,
                }
            }
            PixelVolumeTree::PureArea { bound, value } => {
                match value {
                    true => bound.overlaps(other),
                    false => false,
                }
            }
            PixelVolumeTree::SplitArea { bound, areas } => {
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
    pub fn contains_tree(&self, other: &PixelVolumeTree) -> bool {
        match self {
            PixelVolumeTree::Pixel { point, value } => {
                match value {
                    true => other.contains_pixel(point.x, point.y),
                    false => false,
                }
            }
            PixelVolumeTree::PureArea { bound, value } => {
                match value {
                    true => other.contains_box(bound),
                    false => false,
                }
            }
            PixelVolumeTree::SplitArea { bound, areas } => {
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

impl PixelVolumeTree {
    pub fn split(&mut self) {
        match self {
            // do nothing
            PixelVolumeTree::Pixel { .. } => {}
            // do nothing
            PixelVolumeTree::SplitArea { .. } => {}
            PixelVolumeTree::PureArea { bound, .. } => {
                let sx = bound.min.x;
                let sy = bound.min.y;
                let mx = bound.center().x;
                let my = bound.center().y;
                let ex = bound.max.x;
                let ey = bound.max.y;
                let mut areas = Vec::with_capacity(4);
                if let Some(s) = PixelVolumeTree::new(AABB::new(sx, sy, mx, my), false) {
                    areas.push(s);
                }
                if let Some(s) = PixelVolumeTree::new(AABB::new(mx + 1, sy, ex, my + 1), false) {
                    areas.push(s);
                }
                if let Some(s) = PixelVolumeTree::new(AABB::new(sx, my + 1, mx, ey), false) {
                    areas.push(s);
                }
                if let Some(s) = PixelVolumeTree::new(AABB::new(mx + 1, my + 1, ex, ey), false) {
                    areas.push(s);
                }
                *self = PixelVolumeTree::SplitArea {
                    bound: *bound,
                    areas,
                };
            }
        }
    }
    pub fn insert_pixel(&mut self, x: u32, y: u32) {
        match self {
            PixelVolumeTree::Pixel { point, value } => {
                if point.x != x || point.y != y {
                    return;
                }
                *value = true;
            }
            PixelVolumeTree::PureArea { bound, value } => {
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
            PixelVolumeTree::SplitArea { bound, areas } => {
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
    pub fn insert_tree(&mut self, other: &PixelVolumeTree) {
        for pixel in other.get_pixels(Point::default()) {
            self.insert_pixel(pixel.x, pixel.y);
        }
    }
    pub fn is_pure(&self) -> Option<bool> {
        match self {
            PixelVolumeTree::Pixel { value, .. } => Some(*value),
            PixelVolumeTree::PureArea { value, .. } => Some(*value),
            PixelVolumeTree::SplitArea { areas, .. } => {
                let mut value = None;
                for area in areas {
                    match area.is_pure() {
                        Some(v) => {
                            match value {
                                Some(v2) => {
                                    if v != v2 {
                                        return None;
                                    }
                                }
                                None => {
                                    value = Some(v);
                                }
                            }
                        }
                        None => {
                            return None;
                        }
                    }
                }
                value
            }
        }
    }
    pub fn refine(&mut self) {
        match self {
            PixelVolumeTree::Pixel { .. } => {}
            PixelVolumeTree::PureArea { .. } => {}
            PixelVolumeTree::SplitArea { bound, areas } => {
                match self.is_pure() {
                    Some(v) => {
                        *self = PixelVolumeTree::PureArea {
                            bound: *bound,
                            value: v,
                        };
                    }
                    None => {
                        for area in areas {
                            area.refine();
                        }
                    }
                }
            }
        }
    }
}