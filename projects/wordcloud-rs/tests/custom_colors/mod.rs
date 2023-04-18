
use wordcloud::{WordCloudSize, };


use image::{ImageFormat};
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
    let words = vec![("double", 10.0), ("plus", 20.0), ("good", 30.0), ("bad", 40.0), ("ugly", 50.0)];
    let wordcloud_image = wordcloud.generate_from_text_with_color_func(&words, mask, 1.0);

    wordcloud_image.save("a_new_hope.png")
        .expect("Unable to save image a_new_hope.png");
}
