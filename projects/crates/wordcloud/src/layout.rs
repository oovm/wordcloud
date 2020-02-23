//! Word-cloud layout engine (spiral placement + quad-tree collision).

use rand::{seq::SliceRandom, SeedableRng};
use rand::rngs::StdRng;
use wordcloud_types::{
    ElementGeometry, LayoutBounds, LayoutConfig, LayoutResult, SpiralLayout, TextElement,
    WordCloudElement, WordFrequency,
};

use crate::quadtree::{CollisionBox, QuadTree};

/// Layout words on a canvas using spiral search and quad-tree collision detection.
pub struct LayoutEngine {
    config: LayoutConfig,
    tree: QuadTree,
    placed: Vec<WordCloudElement>,
    rng: StdRng,
}

impl LayoutEngine {
    pub fn new(config: LayoutConfig) -> Self {
        let tree = QuadTree::new(0.0, 0.0, config.width as f32, config.height as f32);
        Self {
            config,
            tree,
            placed: Vec::new(),
            rng: StdRng::from_entropy(),
        }
    }

    pub fn layout(&mut self, words: &[WordFrequency]) -> LayoutResult {
        self.tree.clear();
        self.placed.clear();

        if words.is_empty() {
            return LayoutResult::failed(self.bounds());
        }

        let normalized = normalize_frequencies(words);
        let mut candidates = build_candidates(&normalized, &self.config);
        candidates.sort_by(|a, b| {
            b.geometry
                .frequency
                .partial_cmp(&a.geometry.frequency)
                .unwrap_or(std::cmp::Ordering::Equal)
        });

        for candidate in candidates {
            if let Some(placed) = self.try_place(&candidate) {
                let collision = CollisionBox {
                    id: placed.geometry.id.clone(),
                    x: placed.geometry.x,
                    y: placed.geometry.y,
                    width: placed.geometry.width,
                    height: placed.geometry.height,
                };
                self.tree.insert(collision);
                self.placed.push(WordCloudElement::Text(placed));
            }
        }

        LayoutResult {
            elements: self.placed.clone(),
            bounds: self.bounds(),
            success: !self.placed.is_empty(),
        }
    }

    fn bounds(&self) -> LayoutBounds {
        LayoutBounds {
            width: self.config.width,
            height: self.config.height,
        }
    }

    fn try_place(&mut self, element: &TextElement) -> Option<TextElement> {
        let center_x = self.config.width as f32 / 2.0;
        let center_y = self.config.height as f32 / 2.0;
        let rotation = random_rotation(&self.config.rotations, &mut self.rng);

        for attempt in 0..self.config.max_attempts {
            let (px, py) = spiral_position(&self.config.spiral, attempt, center_x, center_y);
            let x = px - element.geometry.width / 2.0;
            let y = py - element.geometry.height / 2.0;

            let candidate = CollisionBox {
                id: element.geometry.id.clone(),
                x,
                y,
                width: element.geometry.width,
                height: element.geometry.height,
            };

            if !within_bounds(&self.config, &candidate) {
                continue;
            }

            if !self.tree.has_collision(&candidate) {
                let mut placed = element.clone();
                placed.geometry.x = x;
                placed.geometry.y = y;
                placed.geometry.rotation = rotation;
                return Some(placed);
            }
        }

        None
    }
}

/// Normalize word frequencies to 0..1 for font sizing.
pub fn normalize_frequencies(words: &[WordFrequency]) -> Vec<WordFrequency> {
    let max = words
        .iter()
        .map(|word| word.frequency)
        .fold(0.0_f32, f32::max)
        .max(1.0);

    words
        .iter()
        .map(|word| WordFrequency {
            word: word.word.clone(),
            frequency: word.frequency / max,
            kind: word.kind,
        })
        .collect()
}

/// Build text elements from normalized word frequencies.
pub fn build_candidates(words: &[WordFrequency], config: &LayoutConfig) -> Vec<TextElement> {
    words
        .iter()
        .enumerate()
        .map(|(index, word)| {
            let font_size =
                config.min_font_size + (config.max_font_size - config.min_font_size) * word.frequency;
            let (width, height) = measure_text(&word.word, font_size);
            TextElement {
                geometry: ElementGeometry {
                    id: format!("word-{index}"),
                    x: 0.0,
                    y: 0.0,
                    width,
                    height,
                    rotation: 0.0,
                    frequency: word.frequency,
                },
                text: word.word.clone(),
                font_size,
                font_family: "sans-serif".to_string(),
                font_weight: "normal".to_string(),
                color: None,
            }
        })
        .collect()
}

/// Estimate text bounding box from glyph metrics heuristic.
pub fn measure_text(text: &str, font_size: f32) -> (f32, f32) {
    let width = text.len() as f32 * font_size * 0.6;
    let height = font_size * 1.2;
    (width, height)
}

fn random_rotation(rotations: &[i32], rng: &mut StdRng) -> f32 {
    rotations
        .choose(rng)
        .copied()
        .unwrap_or(0) as f32
}

/// Spiral search coordinate for a placement attempt.
pub fn spiral_position(spiral: &SpiralLayout, step: u32, center_x: f32, center_y: f32) -> (f32, f32) {
    match spiral {
        SpiralLayout::Archimedean => {
            let angle = step as f32 * 0.1;
            let radius = step as f32 * 2.0;
            (
                center_x + radius * angle.cos(),
                center_y + radius * angle.sin(),
            )
        }
        SpiralLayout::Rectangular => {
            let side = (step / 4) + 1;
            let pos = step % 4;
            let offset = side as f32 * 10.0;
            match pos {
                0 => (center_x + offset, center_y),
                1 => (center_x, center_y + offset),
                2 => (center_x - offset, center_y),
                _ => (center_x, center_y - offset),
            }
        }
    }
}

/// Whether a rectangle fits inside the padded canvas.
pub fn within_bounds(config: &LayoutConfig, item: &CollisionBox) -> bool {
    item.x >= config.padding
        && item.y >= config.padding
        && item.x + item.width <= config.width as f32 - config.padding
        && item.y + item.height <= config.height as f32 - config.padding
}
