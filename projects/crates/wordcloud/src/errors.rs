#[derive(Debug, Clone)]
pub enum WordCloudError {}

pub type WorldCloudResult<T> = std::result::Result<T, WordCloudError>;
