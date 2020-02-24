//! WASI Preview 2 export surface for wordcloud.

wit_bindgen::generate!({
    world: "wordcloud",
    path: "wit",
});

use wordcloud::{LayoutEngine, tokenize_text};
use wordcloud_types::{LayoutConfig, SpiralLayout, WordCloudElement, WordFrequency};

use exports::doki::land::analyze::WordFrequency as WitWordFrequency;
use exports::doki::land::layout::{LayoutConfig as WitLayoutConfig, LayoutResult as WitLayoutResult, PlacedWord};

struct Wordcloud;

fn to_wit_frequency(word: &WordFrequency) -> WitWordFrequency {
    WitWordFrequency { word: word.word.clone(), frequency: word.frequency }
}

fn from_wit_config(config: WitLayoutConfig) -> LayoutConfig {
    LayoutConfig {
        width: config.width,
        height: config.height,
        padding: config.padding,
        rotations: vec![0, 90, -90],
        spiral: if config.archimedean { SpiralLayout::Archimedean } else { SpiralLayout::Rectangular },
        max_attempts: config.max_attempts,
        min_font_size: config.min_font_size,
        max_font_size: config.max_font_size,
    }
}

fn to_placed_word(element: &WordCloudElement) -> Option<PlacedWord> {
    match element {
        WordCloudElement::Text(text) => Some(PlacedWord {
            word: text.text.clone(),
            x: text.geometry.x,
            y: text.geometry.y,
            width: text.geometry.width,
            height: text.geometry.height,
            rotation: text.geometry.rotation,
            font_size: text.font_size,
            frequency: text.geometry.frequency,
        }),
        _ => None,
    }
}

impl exports::doki::land::analyze::Guest for Wordcloud {
    fn tokenize_text(text: String, min_length: u32, max_length: u32) -> Vec<WitWordFrequency> {
        tokenize_text(&text, min_length as usize, max_length as usize).iter().map(to_wit_frequency).collect()
    }
}

impl exports::doki::land::layout::Guest for Wordcloud {
    fn layout_words(config: WitLayoutConfig, words: Vec<WitWordFrequency>) -> WitLayoutResult {
        let input = words.into_iter().map(|word| WordFrequency::new(word.word, word.frequency)).collect::<Vec<_>>();

        let mut engine = LayoutEngine::new(from_wit_config(config));
        let result = engine.layout(&input);
        let placed = result.elements.iter().filter_map(to_placed_word).collect();

        WitLayoutResult { words: placed, success: result.success }
    }
}

export!(Wordcloud);
