use wordcloud::WordCloudCanvas;

mod custom_colors;

#[test]
fn ready() {
    println!("it works!")
}

fn test() {
    let mut renderer = WordCloudCanvas::default();
    renderer.append_text("ai", 1);
}
