// mod renderer;
mod canvas;
mod layout;

pub use canvas::{Canvas, QuadTree, Sprite};

// pub type QrResult<T> = std::result::Result<T, QrError>;

#[derive(Debug, Clone)]
pub struct WordCloud {}

impl Default for QrImage {
    fn default() -> Self {
        Self {}
    }
}
