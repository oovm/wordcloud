// mod errors;

use palette::rgb::channels::Rgba;

mod datatype;
mod fonts;

pub struct WordCloud {}

pub struct WordCloudWriter {}

pub struct WordCloudTask {
    kind: WordCloudTaskKind,
}

pub enum WordCloudTaskKind {
    Text(String, Option<Rgba>),
    Image(String, usize),
}
