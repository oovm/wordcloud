use wordcloud::WordCloud;

mod custom_colors;

#[test]
fn ready() {
    println!("it works!")
}

fn test() {
    let mut renderer = WordCloud::default();
    renderer.append_text("ai", 1);
}
