//! Quad-tree collision index for layout placement.

/// Axis-aligned box tracked by the quad-tree.
#[derive(Debug, Clone, PartialEq)]
pub struct CollisionBox {
    pub id: String,
    pub x: f32,
    pub y: f32,
    pub width: f32,
    pub height: f32,
}

#[derive(Debug, Clone)]
struct Node {
    x: f32,
    y: f32,
    width: f32,
    height: f32,
    level: u32,
    items: Vec<CollisionBox>,
    children: Option<[Box<Node>; 4]>,
}

/// Spatial index for word placement collision checks.
pub struct QuadTree {
    root: Node,
    max_items: usize,
    max_level: u32,
}

impl QuadTree {
    pub fn new(x: f32, y: f32, width: f32, height: f32) -> Self {
        Self { root: Node::leaf(x, y, width, height, 0), max_items: 10, max_level: 5 }
    }

    pub fn clear(&mut self) {
        let bounds = (self.root.x, self.root.y, self.root.width, self.root.height);
        self.root = Node::leaf(bounds.0, bounds.1, bounds.2, bounds.3, 0);
    }

    pub fn insert(&mut self, item: CollisionBox) {
        Self::insert_into(&mut self.root, item, self.max_items, self.max_level);
    }

    pub fn has_collision(&self, item: &CollisionBox) -> bool {
        let candidates = self.query(item.x, item.y, item.width, item.height);
        candidates.iter().any(|other| other.id != item.id && boxes_overlap(item, other))
    }

    pub fn query(&self, x: f32, y: f32, width: f32, height: f32) -> Vec<CollisionBox> {
        let mut out = Vec::new();
        Self::query_node(&self.root, x, y, width, height, &mut out);
        out
    }

    fn insert_into(node: &mut Node, item: CollisionBox, max_items: usize, max_level: u32) {
        if !rect_intersects(node.x, node.y, node.width, node.height, &item) {
            return;
        }

        if node.children.is_none() && node.items.len() < max_items {
            node.items.push(item);
            return;
        }

        if node.children.is_none() {
            node.subdivide(max_items, max_level);
        }

        if let Some(children) = &mut node.children {
            for child in children.iter_mut() {
                Self::insert_into(child, item.clone(), max_items, max_level);
            }
        }
    }

    fn query_node(node: &Node, x: f32, y: f32, width: f32, height: f32, out: &mut Vec<CollisionBox>) {
        if !regions_overlap(node.x, node.y, node.width, node.height, x, y, width, height) {
            return;
        }

        for item in &node.items {
            if regions_overlap(item.x, item.y, item.width, item.height, x, y, width, height) {
                out.push(item.clone());
            }
        }

        if let Some(children) = &node.children {
            for child in children.iter() {
                Self::query_node(child, x, y, width, height, out);
            }
        }
    }
}

impl Node {
    fn leaf(x: f32, y: f32, width: f32, height: f32, level: u32) -> Self {
        Self { x, y, width, height, level, items: Vec::new(), children: None }
    }

    fn subdivide(&mut self, max_items: usize, max_level: u32) {
        if self.level >= max_level {
            return;
        }

        let existing = self.items.clone();
        let half_w = self.width / 2.0;
        let half_h = self.height / 2.0;
        let level = self.level + 1;

        self.children = Some([
            Box::new(Node::leaf(self.x, self.y, half_w, half_h, level)),
            Box::new(Node::leaf(self.x + half_w, self.y, half_w, half_h, level)),
            Box::new(Node::leaf(self.x, self.y + half_h, half_w, half_h, level)),
            Box::new(Node::leaf(self.x + half_w, self.y + half_h, half_w, half_h, level)),
        ]);
        self.items.clear();

        if let Some(children) = &mut self.children {
            for item in existing {
                for child in children.iter_mut() {
                    QuadTree::insert_into(child, item.clone(), max_items, max_level);
                }
            }
        }
    }
}

fn boxes_overlap(a: &CollisionBox, b: &CollisionBox) -> bool {
    regions_overlap(a.x, a.y, a.width, a.height, b.x, b.y, b.width, b.height)
}

fn rect_intersects(nx: f32, ny: f32, nw: f32, nh: f32, item: &CollisionBox) -> bool {
    regions_overlap(nx, ny, nw, nh, item.x, item.y, item.width, item.height)
}

fn regions_overlap(ax: f32, ay: f32, aw: f32, ah: f32, bx: f32, by: f32, bw: f32, bh: f32) -> bool {
    !(ax + aw < bx || bx + bw < ax || ay + ah < by || by + bh < ay)
}
