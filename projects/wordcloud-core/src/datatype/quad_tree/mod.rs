use diagnostic_quick::{QError, QResult};
use quadtree_rs::{
    area::{Area, AreaBuilder},
    point::Point,
    Quadtree,
};

pub struct WordCloudTree {
    anchor_x: usize,
    anchor_y: usize,
    tree: Quadtree<usize, ()>,
}

impl WordCloudTree {
    pub fn new(depth: usize, x: usize, y: usize) -> Self {
        let tree = Quadtree::new(depth);
        WordCloudTree { anchor_x: x, anchor_y: y, tree }
    }
    pub fn width(&self) -> usize {
        self.tree.width()
    }
    pub fn height(&self) -> usize {
        self.tree.height()
    }
    /// # Arguments
    ///
    /// * `x`: The upper left x-coordinate of the area
    /// * `y`: The upper left y-coordinate of the area
    /// * `w`: The width of the area
    /// * `h`: The height of the area
    /// * `relative`:
    ///
    /// returns: Result<(), QError>
    ///
    /// # Examples
    ///
    /// ```
    /// use diagnostic_quick::QResult;
    /// ```
    pub fn insert(&mut self, x: usize, y: usize, w: usize, h: usize, relative: bool) -> QResult {
        let anchor = match relative {
            true => Point { x, y },
            false => Point { x, y },
        };
        let builder = AreaBuilder::default().anchor(anchor).dimensions((w, h)).build();
        match builder {
            Ok(o) => {
                self.tree.insert(o, ());
            }
            Err(e) => Err(QError::runtime_error(e))?,
        }
        Ok(())
    }
    pub fn is_intersect_with_point(&self, x: usize, y: usize) -> bool {
        let x = x.saturating_sub(self.anchor_x);
        let y = y.saturating_sub(self.anchor_y);
        let builder = AreaBuilder::default().anchor(Point { x, y }).dimensions((1, 1)).build();
        match builder {
            Ok(o) => self.tree.query(o).next().is_some(),
            Err(_) => false,
        }
    }
    pub fn is_intersect_with_area(&self, x: usize, y: usize, w: usize, h: usize) -> bool {
        let x = x.saturating_sub(self.anchor_x);
        let y = y.saturating_sub(self.anchor_y);
        let builder = AreaBuilder::default().anchor(Point { x, y }).dimensions((w, h)).build();
        match builder {
            Ok(o) => self.tree.query(o).next().is_some(),
            Err(_) => false,
        }
    }
    pub fn is_intersect_with_tree(&self, rhs: &WordCloudTree) -> bool {
        let mut result = false;
        for area in rhs.tree.iter() {
            let builder = AreaBuilder::default()
                .anchor(Point { x: rhs.anchor_x + area.anchor().x, y: rhs.anchor_y + area.anchor().y })
                .dimensions((area.width(), area.height()))
                .build();
            match builder {
                Ok(o) => {
                    if self.tree.query(o).next().is_some() {
                        result = true;
                        break;
                    }
                }
                Err(_) => (),
            }
        }
        result
    }
}

fn rect(x: usize, y: usize, w: usize, h: usize) -> Result<Area<usize>, QError> {
    let builder = AreaBuilder::default().anchor(Point { x, y }).dimensions((w, h)).build();
    builder.map_err(|e| QError::runtime_error(e))
}

#[test]
fn test_2() {
    let mut area = WordCloudTree::new(4, 0, 0);
    assert_eq!(area.width(), 16);
    area.insert(0, 0, 2, 1, true).unwrap();
    area.insert(1, 0, 2, 2, true).unwrap();
    assert!(area.is_intersect_with_point(2, 0));
}
