#[derive(Debug, Clone)]
pub struct QuadTree {
    x1: f32,
    y1: f32,
    x2: f32,
    y2: f32,
    width: f32,
    height: f32,
    children: Option<f32>,
}


impl Default for QuadTree {
    fn default() -> Self {
        Self {
            x1: 0.0,
            y1: 0.0,
            x2: 0.0,
            y2: 0.0,
            width: 0.0,
            height: 0.0,
            children: None,
        }
    }
}

impl QuadTree {
    pub fn new(x1: f32, y1: f32, x2: f32, y2: f32) -> Self {
        Self {
            x1,
            y1,
            x2,
            y2,
            ..Self::default()
        }
    }
}
