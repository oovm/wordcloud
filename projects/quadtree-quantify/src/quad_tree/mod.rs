use std::mem::size_of;

pub struct QuadTree<T> {
    x: T,
    y: T,
    w: T,
    h: T,
    l1: Option<Box<QuadTree<T>>>,
    l2: Option<Box<QuadTree<T>>>,
    l3: Option<Box<QuadTree<T>>>,
    l4: Option<Box<QuadTree<T>>>,
}

#[test]
fn test_size() {
    assert_eq!(size_of::<QuadTree<f32>>(), 32)
}
