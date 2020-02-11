// mod errors;

pub use self::{
    datatype::quad_tree::WordCloudTree,
    task::{rotate::RotateMode, WordCloudItem, WordCloudItemKind},
};

mod datatype;
mod fonts;
mod task;

pub struct WordCloud {}

pub struct WordCloudWriter {}
