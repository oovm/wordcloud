/// Word cloud operation error.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum WordCloudError {
    /// No sprites or words were provided.
    EmptyInput,
    /// Layout could not place any element.
    LayoutFailed,
    /// Weighted sample set is empty or invalid.
    InvalidWeights,
    /// Generic validation failure with a message.
    Validation(String),
}

impl std::fmt::Display for WordCloudError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::EmptyInput => write!(f, "word cloud input is empty"),
            Self::LayoutFailed => write!(f, "word cloud layout failed"),
            Self::InvalidWeights => write!(f, "invalid weight sample set"),
            Self::Validation(message) => write!(f, "{message}"),
        }
    }
}

impl std::error::Error for WordCloudError {}

pub type WordCloudResult<T> = std::result::Result<T, WordCloudError>;
