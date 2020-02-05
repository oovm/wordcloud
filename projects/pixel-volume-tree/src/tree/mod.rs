/// A pixel-level quadtree
///
/// Points out of bounds are considered filled
pub struct PixelVolumeTree {
    pub bound: AABB,
    pub quad: PixelVolumeNode,
}

impl PixelVolumeTree {
    pub fn new(bound: AABB) -> Self {
        Self {
            bound,
            quad: PixelVolumeNode::PureArea,
        }
    }
    pub fn shift(&mut self, x: i32, y: i32) {
        let sx = (self.bound.min.x as i32 + x) as u32;
        let sy = (self.bound.min.y as i32 + y) as u32;
        let ex = (self.bound.max.x as i32 + x) as u32;
        let ey = (self.bound.max.y as i32 + y) as u32;
        self.bound = AABB::from_min_max((sx, sy), (ex, ey));
    }
    pub fn split(&mut self) {
        if let PixelVolumeNode::SplitArea { .. } = &self.quad {
            return;
        }
        let Point { x: sx, y: sy } = self.bound.min;
        let Point { x: ex, y: ey } = self.bound.max;
        let (mx, my) = self.bound.center();
        self.quad = PixelVolumeNode::SplitArea {
            a: box PixelVolumeTree::new(AABB::from_min_max((sx, sy), (mx, my))),
            b: box PixelVolumeTree::new(AABB::from_min_max((mx, sy), (ex, my))),
            c: box PixelVolumeTree::new(AABB::from_min_max((sx, my), (mx, ey))),
            d: box PixelVolumeTree::new(AABB::from_min_max((mx, my), (ex, ey))),
        };
    }
    pub fn get_children(&mut self) -> impl Iterator<Item=&mut PixelVolumeTree> {
        from_generator(move || {
            if let PixelVolumeNode::SplitArea { a, b, c, d } = &mut self.quad {
                yield a;
                yield b;
                yield c;
                yield d;
            }
        })
    }
    pub fn mut_children(&mut self) -> impl Iterator<Item=&mut PixelVolumeTree> {
        from_generator(move || {
            if let PixelVolumeNode::SplitArea { a, b, c, d } = &mut self.quad {
                yield a;
                yield b;
                yield c;
                yield d;
            }
        })
    }
    pub fn get_pixels(&self) -> impl Iterator<Item=Point<u32>> {
        from_generator(move || {
            for pixel in self.mut_children() {
                if self.contains(pixel.x, pixel.y) {
                    yield pixel;
                }
            }
        })
    }
    /// Check if a point is filled
    pub fn contains(&self, x: u32, y: u32) -> bool {
        if !self.bound.contains(&Point::new(x, y)) {
            return false;
        }
        match &self.quad {
            PixelVolumeNode::PureArea => {
                false
            }
            PixelVolumeNode::SplitArea { a, b, c, d } => {
                a.contains(x, y) || b.contains(x, y) || c.contains(x, y) || d.contains(x, y)
            }
        }
    }
    pub fn overlaps(&self, other: &PixelVolumeTree) -> bool {
        if !self.bound.overlaps(&other.bound) {
            return false;
        }
        match &self.quad {
            PixelVolumeNode::PureArea => {
                false
            }
            PixelVolumeNode::SplitArea { a, b, c, d } => {
                a.overlaps(other) || b.overlaps(other) || c.overlaps(other) || d.overlaps(other)
            }
        }
    }
    pub fn insert(&mut self, x: u32, y: u32) {
        if !self.bound.contains(&Point::new(x, y)) {
            return;
        }
        self.split();
        for child in self.mut_children() {
            if child.bound.contains(&Point::new(x, y)) {
                child.insert(x, y);
                break;
            }
        }
    }
    pub fn extend(&mut self, other: &PixelVolumeTree) {
        if !self.bound.overlaps(&other.bound) {
            return;
        }
        self.split();
        for child in self.mut_children() {
            if child.bound.overlaps(&other.bound) {
                child.extend(other);
            }
        }
    }
}

#[inline]
fn boundary_collide(a: &AABB, b: &AABB) -> bool {
    a.min.x < b.max.x && a.max.x > b.min.x && a.min.y < b.max.y && a.max.y > b.min.y
}