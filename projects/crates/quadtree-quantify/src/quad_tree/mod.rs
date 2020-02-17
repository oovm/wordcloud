use std::{collections::BTreeMap, mem::size_of, ops::Add};

pub struct QuadTree {
    max_depth: usize,
    anchor: [usize; 2],
    arena: BTreeMap<usize, QuadTreeNode>,
}

impl QuadTree {
    pub fn new(max_depth: usize, x: usize, y: usize, w: usize, h: usize) -> QuadTree {
        let root = QuadTreeNode { id: 0, parent: None, anchor: [0, 0], size: [w, h], child: None, depth: 0 };
        let mut arena = BTreeMap::new();
        arena.insert(root.id, root);
        QuadTree { max_depth, anchor: [x, y], arena }
    }
    pub fn insert(&mut self, node: QuadTreeNode) -> usize {
        let key = node.id;
        self.arena.insert(key, node);
        key
    }
    pub fn get_node(&self, id: usize) -> Option<&QuadTreeNode> {
        self.arena.get(&id)
    }
    pub fn get_root(&self) -> &QuadTreeNode {
        self.arena.get(&0).unwrap()
    }
    pub fn mut_root(&mut self) -> &mut QuadTreeNode {
        self.arena.get_mut(&0).unwrap()
    }
}

pub struct QuadTreeNode {
    id: usize,
    parent: Option<usize>,
    anchor: [usize; 2],
    size: [usize; 2],
    child: Option<[usize; 4]>,
    depth: usize,
}

impl QuadTreeNode {
    pub fn split_4(&mut self, arena: &mut QuadTree) -> Option<[usize; 4]> {
        if self.depth >= arena.max_depth {
            return None;
        }
        if self.size.0 == 1 || self.size.1 == 1 {
            return None;
        }
        let last = arena.arena.last_key_value()?.0;
        let w1 = self.size[0] / 2;
        let w2 = self.size[0] - w1;
        let h1 = self.size[1] / 2;
        let h2 = self.size[1] - h1;
        let l1 = QuadTreeNode {
            id: last.add(1),
            parent: Some(self.id),
            anchor: self.anchor,
            size: [w1, h1],
            child: None,
            depth: self.depth + 1,
        };
        let n1 = arena.insert(l1);
        let l2 = QuadTreeNode {
            id: last.add(2),
            parent: Some(self.id),
            anchor: [self.anchor[0] + w1, self.anchor[1]],
            size: [w2, h1],
            child: None,
            depth: self.depth + 1,
        };
        let n2 = arena.insert(l2);
        let l3 = QuadTreeNode {
            id: last.add(3),
            parent: Some(self.id),
            anchor: [self.anchor[0], self.anchor[1] + h1],
            size: [w1, h2],
            child: None,
            depth: self.depth + 1,
        };
        let n3 = arena.insert(l3);
        let l4 = QuadTreeNode {
            id: last.add(4),
            parent: Some(self.id),
            anchor: [self.anchor[0] + w1, self.anchor[1] + h1],
            size: [w2, h2],
            child: None,
            depth: self.depth + 1,
        };
        let n4 = arena.insert(l4);
        Some([n1, n2, n3, n4])
    }
}

#[test]
fn test_size() {
    assert_eq!(size_of::<QuadTreeNode>(), 72)
}
