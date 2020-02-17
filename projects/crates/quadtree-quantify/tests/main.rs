use wordcloud::WordCloud;

#[test]
fn ready() {
    println!("it works!")
}

fn test() {
    let mut renderer = WordCloud::default();
    renderer.append_text("ai", 1);
}
