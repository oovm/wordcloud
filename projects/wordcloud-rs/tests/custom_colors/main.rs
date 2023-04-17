use std::collections::HashSet;
use wordcloud::{WordCloudSize, Word};
use rand::Rng;
use rand::rngs::{SmallRng};
use image::{ImageFormat, Rgb};
use wordcloud::WordCloudCanvas;

#[test]
fn main() {
    let mut wordcloud = WordCloudCanvas::default()
        .with_word_margin(10)
        .with_rng_seed(1);

    let mask_buf = include_bytes!("stormtrooper_mask.png");
    let mask_image = image::load_from_memory_with_format(mask_buf, ImageFormat::Png)
        .expect("Unable to load mask from memory")
        .to_luma8();

    let mask = WordCloudSize::FromMask(mask_image);

    let wordcloud_image = wordcloud.generate_from_text_with_color_func(&"g", mask, 1.0);

    wordcloud_image.save("a_new_hope.png")
        .expect("Unable to save image a_new_hope.png");
}
