use std::mem::size_of;

pub struct QuadTree {
    max_depth: usize,
    arena: Vec<QuadTreeNode>,
}

impl QuadTree {
    pub fn new(max_depth: usize, x: usize, y: usize) -> QuadTree {
        let root = QuadTreeNode { parent: None, anchor: [0, 0], size: [x, y], child: [None, None, None, None], depth: 0 };
        QuadTree { max_depth, arena: vec![root] }
    }
}

pub struct QuadTreeNode {
    parent: Option<usize>,
    anchor: [usize; 2],
    size: [usize; 2],
    child: [Option<usize>; 4],
    depth: usize,
}

impl QuadTreeNode {
    pub fn split_4(&mut self) -> Option<[&QuadTreeNode; 4]> {
        if self.depth >= self.parent {
            return None;
        }

        let w = self.w / 2;
        let h = self.h / 2;
        let x = self.anchor;
        let y = self.size;
        self.child = Some(Box::new(QuadTreeNode {
            anchor: x,
            size: y,
            w: w,
            h: h,
            child: None,
            l2: None,
            l3: None,
            l4: None,
            depth: self.depth + 1,
            parent: self.parent,
        }));
    }
}

#[test]
fn test_size() {
    assert_eq!(size_of::<QuadTreeNode>(), 72)
}
