use wordcloud::{LayoutEngine, tokenize_text};
use wordcloud_types::LayoutConfig;

#[test]
fn layout_places_high_frequency_words() {
    let words = tokenize_text("rust rust rust wasm layout", 2, 32);
    let mut engine = LayoutEngine::new(LayoutConfig { width: 400, height: 300, ..LayoutConfig::default() });
    let result = engine.layout(&words);
    assert!(result.success);
    assert!(!result.elements.is_empty());
}
