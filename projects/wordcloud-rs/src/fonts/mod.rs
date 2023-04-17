use image::{GrayImage, Rgb, RgbImage, Luma};
use ab_glyph::{PxScale, Point, point, FontVec};

mod text_render;

use text_render::GlyphData;

pub mod sat;
pub mod tokenizer;

pub use tokenizer::{Tokenizer, DEFAULT_EXCLUDE_WORDS_TEXT};

use rand::{Rng, SeedableRng};
use rand::rngs::{SmallRng};

pub struct Word<'a> {
    text: &'a str,
    font: &'a FontVec,
    font_size: PxScale,
    glyphs: GlyphData,
    rotated: bool,
    position: Point,
}

// TODO: Figure out a better way to structure this
pub enum WordCloudSize {
    FromDimensions { width: u32, height: u32 },
    FromMask(GrayImage),
}

pub struct WordCloud {
    background_color: Rgb<u8>,
    font: FontVec,
    min_font_size: f32,
    max_font_size: Option<f32>,
    font_step: f32,
    word_margin: u32,
    word_rotate_chance: f64,
    relative_font_scaling: f32,
    rng_seed: Option<u64>,
}

impl Default for WordCloud {
    fn default() -> Self {
        let font = FontVec::try_from_vec(include_bytes!("../../fonts/DroidSansMono.ttf").to_vec()).unwrap();

        WordCloud {
            background_color: Rgb([0, 0, 0]),
            font,
            min_font_size: 4.0,
            max_font_size: None,
            font_step: 1.0,
            word_margin: 2,
            word_rotate_chance: 0.10,
            relative_font_scaling: 0.5,
            rng_seed: None,
        }
    }
}

impl WordCloud {
    pub fn with_background_color(mut self, value: Rgb<u8>) -> Self {
        self.background_color = value;
        self
    }
    pub fn with_font(mut self, value: FontVec) -> Self {
        self.font = value;
        self
    }
    pub fn with_min_font_size(mut self, value: f32) -> Self {
        assert!(value >= 0.0, "The minimum font size for a word cloud cannot be less than 0");
        self.min_font_size = value;
        self
    }
    pub fn with_max_font_size(mut self, value: Option<f32>) -> Self {
        self.max_font_size = value;
        self
    }
    pub fn with_font_step(mut self, value: f32) -> Self {
        self.font_step = value;
        self
    }
    pub fn with_word_margin(mut self, value: u32) -> Self {
        self.word_margin = value;
        self
    }
    pub fn with_word_rotate_chance(mut self, value: f64) -> Self {
        self.word_rotate_chance = value;
        self
    }
    pub fn with_relative_font_scaling(mut self, value: f32) -> Self {
        assert!((0.0..=1.0).contains(&value), "Relative scaling must be between 0 and 1");
        self.relative_font_scaling = value;
        self
    }
    pub fn with_rng_seed(mut self, value: u64) -> Self {
        self.rng_seed.replace(value);
        self
    }
}

impl WordCloud {
    fn generate_from_word_positions(
        rng: &mut SmallRng,
        width: u32,
        height: u32,
        word_positions: Vec<Word>,
        scale: f32,
        background_color: Rgb<u8>,
        color_func: fn(&Word, &mut SmallRng) -> Rgb<u8>,
    ) -> RgbImage {
        // TODO: Refactor this so that we can fail earlier
        if !(0.0..=100.0).contains(&scale) {
            // TODO: Idk if this is good practice
            panic!("The scale must be between 0 and 100 (both exclusive)");

        }

        let mut final_image_buffer = RgbImage::from_pixel((width as f32 * scale) as u32, (height as f32 * scale) as u32, background_color);

        for mut word in word_positions.into_iter() {
            let col = color_func(&word, rng);

            if scale != 1.0 {
                word.font_size.x *= scale;
                word.font_size.y *= scale;

                word.position.x *= scale;
                word.position.y *= scale;

                word.glyphs = text_render::text_to_glyphs(word.text, word.font, word.font_size);
            }

            text_render::draw_glyphs_to_rgb_buffer(&mut final_image_buffer, word.glyphs, word.font, word.position, word.rotated, col);
        }

        final_image_buffer
    }

    fn check_font_size(font_size: &mut f32, font_step: f32, min_font_size: f32) -> bool {
        let next_font_size = *font_size - font_step;

        if next_font_size >= min_font_size && next_font_size > 0.0 {
            *font_size = next_font_size;
            true
        } else {
            false
        }
    }

    pub fn generate_from_text(&self, text: &str, size: WordCloudSize, scale: f32) -> RgbImage {
        self.generate_from_text_with_color_func(text, size, scale, random_color_rgb)
    }

    pub fn generate_from_text_with_color_func(
        &self,
        text: &str,
        size: WordCloudSize,
        scale: f32,
        color_func: fn(&Word, &mut SmallRng) -> Rgb<u8>,
    ) -> RgbImage {
        let words = vec![("double", 10.0), ("plus", 20.0), ("good", 30.0), ("bad", 40.0), ("ugly", 50.0)];

        let (mut summed_area_table, mut gray_buffer) = match size {
            WordCloudSize::FromDimensions { width, height } => {
                let buf = GrayImage::from_pixel(width, height, Luma([0]));
                let mut summed_area_table = vec![0; buf.len()];

                u8_to_u32_vec(&buf, &mut summed_area_table);
                (summed_area_table, buf)
            }
            WordCloudSize::FromMask(image) => {
                let mut table = vec![0; image.len()];

                u8_to_u32_vec(&image, &mut table);
                sat::to_summed_area_table(
                    &mut table, image.width() as usize, 0,
                );
                (table, image)
            }
        };

        let mut final_words = Vec::with_capacity(words.len());

        let mut last_freq = 1.0;

        let mut rng = match self.rng_seed {
            Some(seed) => SmallRng::seed_from_u64(seed),
            None => SmallRng::from_entropy()
        };

        let first_word = words.first()
            .expect("There are no words!");

        let mut font_size = {
            let glyphs = text_render::text_to_glyphs(first_word.0, &self.font, PxScale::from(gray_buffer.height() as f32 * 0.95));
            let rect = sat::Rect { width: glyphs.width + self.word_margin, height: glyphs.height + self.word_margin };

            let height_ratio = rect.height as f32 / rect.width as f32;


            let start_height = gray_buffer.width() as f32 * height_ratio;
            self.max_font_size.map_or_else(|| start_height, |max_font_size| start_height.min(max_font_size))
        };

        'outer: for (word, freq) in &words {
            if self.relative_font_scaling != 0.0 {
                font_size *= self.relative_font_scaling * (freq / last_freq) + (1.0 - self.relative_font_scaling);
            }

            if font_size < self.min_font_size {
                break;
            }

            let initial_font_size = font_size;

            let mut should_rotate = rng.gen_bool(self.word_rotate_chance);
            let mut tried_rotate = false;
            let mut glyphs;

            let pos = loop {
                glyphs = text_render::text_to_glyphs(word, &self.font, PxScale::from(font_size));
                let rect = if !should_rotate {
                    sat::Rect { width: glyphs.width + self.word_margin, height: glyphs.height + self.word_margin }
                } else {
                    sat::Rect { width: glyphs.height + self.word_margin, height: glyphs.width + self.word_margin }
                };

                if rect.width > gray_buffer.width() || rect.height > gray_buffer.height() {
                    if Self::check_font_size(&mut font_size, self.font_step, self.min_font_size) {
                        continue;
                    } else {
                        break 'outer;
                    };
                }

                match sat::find_space_for_rect(&summed_area_table, gray_buffer.width(), gray_buffer.height(), &rect, &mut rng) {
                    Some(pos) => {
                        let half_margin = self.word_margin as f32 / 2.0;
                        let x = pos.x as f32 + half_margin;
                        let y = pos.y as f32 + half_margin;

                        break point(x, y);
                    }
                    None => {
                        if !Self::check_font_size(&mut font_size, self.font_step, self.min_font_size) {
                            if !tried_rotate {
                                should_rotate = true;
                                tried_rotate = true;
                                font_size = initial_font_size;
                            } else {
                                break 'outer;
                            }
                        }
                    }
                };
            };
            text_render::draw_glyphs_to_gray_buffer(&mut gray_buffer, glyphs.clone(), &self.font, pos, should_rotate);

            final_words.push(Word {
                text: word,
                font: &self.font,
                font_size: PxScale::from(font_size),
                glyphs: glyphs.clone(),
                rotated: should_rotate,
                position: pos,
            });

            // TODO: Do a partial sat like the Python implementation
            u8_to_u32_vec(&gray_buffer, &mut summed_area_table);
            let start_row = (pos.y - 1.0).min(0.0) as usize;
            sat::to_summed_area_table(&mut summed_area_table, gray_buffer.width() as usize, start_row);

            last_freq = *freq;
        }

        WordCloud::generate_from_word_positions(
            &mut rng, gray_buffer.width(), gray_buffer.height(), final_words, scale, self.background_color, color_func,
        )
    }
}

fn random_color_rgb(_word: &Word, rng: &mut SmallRng) -> Rgb<u8> {
    let r = rng.gen_range(0..255);
    let g = rng.gen_range(0..255);
    let b = rng.gen_range(0..255);
    Rgb([r, g, b])
}

// TODO: This doesn't seem particularly efficient
fn u8_to_u32_vec(buffer: &GrayImage, dst: &mut [u32]) {
    for (i, el) in buffer.as_raw().iter().enumerate() {
        dst[i] = *el as u32;
    }
}
