use wordcloud_types::{
    LayoutAlgorithm, LayoutBounds, LayoutConfig, SpiralLayout, WordCloudError, WordFrequency,
};

#[test]
fn layout_algorithm_maps_to_spiral_layout() {
    assert_eq!(SpiralLayout::from(LayoutAlgorithm::Archimedean), SpiralLayout::Archimedean);
    assert_eq!(SpiralLayout::from(LayoutAlgorithm::Rectangular), SpiralLayout::Rectangular);
}

#[test]
fn word_frequency_stores_normalized_input() {
    let word = WordFrequency::new("rust", 3.5);
    assert_eq!(word.word, "rust");
    assert_eq!(word.frequency, 3.5);
}

#[test]
fn layout_result_validate_requires_success() {
    let bounds = LayoutBounds { width: 100, height: 100 };
    let failed = wordcloud_types::LayoutResult::failed(bounds);
    assert_eq!(failed.validate(), Err(WordCloudError::LayoutFailed));
}

#[test]
fn default_layout_config_uses_archimedean_spiral() {
    let config = LayoutConfig::default();
    assert_eq!(config.spiral, SpiralLayout::Archimedean);
    assert_eq!(config.width, 800);
}
