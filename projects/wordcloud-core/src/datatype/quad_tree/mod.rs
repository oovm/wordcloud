use diagnostic_quick::{QError, QResult};
use quadtree_rs::{
    area::{Area, AreaBuilder},
    point::Point,
    Quadtree,
};

/// Mark an area as occupied
///
/// # Arguments
///
/// * `x`: The relative x-coordinate to upper left of the area
/// * `y`: The relative y-coordinate to upper left of the area
/// * `w`: The width of the area
/// * `h`: The height of the area
///
/// # Examples
///
/// ```
/// use diagnostic_quick::QResult;
/// ```
pub struct WordCloudTree {
    anchor_x: usize,
    anchor_y: usize,
    tree: Quadtree<usize, ()>,
}

impl WordCloudTree {
    /// Mark an area as occupied
    ///
    /// # Arguments
    ///
    /// * `x`: The relative x-coordinate to upper left of the area
    /// * `y`: The relative y-coordinate to upper left of the area
    /// * `w`: The width of the area
    /// * `h`: The height of the area
    ///
    /// # Examples
    ///
    /// ```
    /// use diagnostic_quick::QResult;
    /// ```
    pub fn new(depth: usize, x: usize, y: usize) -> Self {
        let tree = Quadtree::new(depth);
        WordCloudTree { anchor_x: x, anchor_y: y, tree }
    }
    /// Mark an area as occupied
    ///
    /// # Arguments
    ///
    /// * `x`: The relative x-coordinate to upper left of the area
    /// * `y`: The relative y-coordinate to upper left of the area
    /// * `w`: The width of the area
    /// * `h`: The height of the area
    ///
    /// # Examples
    ///
    /// ```
    /// use diagnostic_quick::QResult;
    /// ```
    pub fn get_anchor(&self) -> (usize, usize) {
        (self.anchor_x, self.anchor_y)
    }
    /// Mark an area as occupied
    ///
    /// # Arguments
    ///
    /// * `x`: The relative x-coordinate to upper left of the area
    /// * `y`: The relative y-coordinate to upper left of the area
    /// * `w`: The width of the area
    /// * `h`: The height of the area
    ///
    /// # Examples
    ///
    /// ```
    /// use diagnostic_quick::QResult;
    /// ```
    pub fn mut_anchor(&mut self) -> (&mut usize, &mut usize) {
        (&mut self.anchor_x, &mut self.anchor_y)
    }
    /// Mark an area as occupied
    ///
    /// # Arguments
    ///
    /// * `x`: The relative x-coordinate to upper left of the area
    /// * `y`: The relative y-coordinate to upper left of the area
    /// * `w`: The width of the area
    /// * `h`: The height of the area
    ///
    /// # Examples
    ///
    /// ```
    /// use diagnostic_quick::QResult;
    /// ```
    pub fn set_anchor(&mut self, x: usize, y: usize) {
        self.anchor_x = x;
        self.anchor_y = y;
    }
    /// Mark an area as occupied
    ///
    /// # Examples
    ///
    /// ```
    /// use diagnostic_quick::QResult;
    /// ```
    pub fn width(&self) -> usize {
        self.tree.width()
    }
    /// Mark an area as occupied
    ///
    /// # Examples
    ///
    /// ```
    /// use diagnostic_quick::QResult;
    /// ```
    pub fn height(&self) -> usize {
        self.tree.height()
    }
    /// Mark an area as occupied
    ///
    /// # Arguments
    ///
    /// * `x`: The relative x-coordinate to upper left of the area
    /// * `y`: The relative y-coordinate to upper left of the area
    /// * `w`: The width of the area
    /// * `h`: The height of the area
    ///
    /// # Examples
    ///
    /// ```
    /// use diagnostic_quick::QResult;
    /// ```
    pub fn insert(&mut self, x: usize, y: usize, w: usize, h: usize) -> QResult {
        let anchor = Point { x: x + self.anchor_x, y: y + self.anchor_y };
        let builder = AreaBuilder::default().anchor(anchor).dimensions((w, h)).build();
        match builder {
            Ok(o) => {
                self.tree.insert(o, ());
            }
            Err(e) => Err(QError::runtime_error(e))?,
        }
        Ok(())
    }
    /// Mark an area as occupied
    ///
    /// # Arguments
    ///
    /// * `x`: The relative x-coordinate to upper left of the area
    /// * `y`: The relative y-coordinate to upper left of the area
    /// * `w`: The width of the area
    /// * `h`: The height of the area
    ///
    /// # Examples
    ///
    /// ```
    /// use diagnostic_quick::QResult;
    /// ```
    pub fn is_intersect_with_point(&self, x: usize, y: usize) -> QResult<bool> {
        if x < self.anchor_x || y < self.anchor_y {
            return Ok(false);
        }
        Ok(self.tree.query(rect(x, y, 1, 1)?).next().is_some())
    }
    /// Mark an area as occupied
    ///
    /// # Arguments
    ///
    /// * `x`: The relative x-coordinate to upper left of the area
    /// * `y`: The relative y-coordinate to upper left of the area
    /// * `w`: The width of the area
    /// * `h`: The height of the area
    ///
    /// # Examples
    ///
    /// ```
    /// use diagnostic_quick::QResult;
    /// ```
    pub fn is_intersect_with_area(&self, x: usize, y: usize, w: usize, h: usize) -> QResult<bool> {
        Ok(self.tree.query(rect(x, y, w, h)?).next().is_some())
    }
    /// Mark an area as occupied
    ///
    /// # Arguments
    ///
    /// * `x`: The relative x-coordinate to upper left of the area
    /// * `y`: The relative y-coordinate to upper left of the area
    /// * `w`: The width of the area
    /// * `h`: The height of the area
    ///
    /// # Examples
    ///
    /// ```
    /// use diagnostic_quick::QResult;
    /// ```
    pub fn is_intersect_with_tree(&self, rhs: &WordCloudTree) -> QResult<bool> {
        for area in rhs.tree.iter() {
            if self.is_intersect_with_area(area.anchor().x, area.anchor().y, area.width(), area.height())? {
                return Ok(true);
            }
        }
        Ok(false)
    }
}

fn rect(x: usize, y: usize, w: usize, h: usize) -> Result<Area<usize>, QError> {
    let builder = AreaBuilder::default().anchor(Point { x, y }).dimensions((w, h)).build();
    builder.map_err(|e| QError::runtime_error(e))
}
