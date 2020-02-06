#[derive(Debug, Clone)]
pub enum WError {}

pub type WResult<T> = Result<T, WError>;
