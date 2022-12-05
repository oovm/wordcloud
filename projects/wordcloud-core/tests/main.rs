use wordcloud_core::WordCloudTree;

#[test]
fn ready() {
    println!("it works!")
}

// fn test() {
//     let mut renderer = WordCloud::default();
//     renderer.append_text("ai", 1);
// }

#[test]
fn test_2() {
    let mut area = WordCloudTree::new(6, 2, 2);
    assert_eq!(area.width(), 64);
    area.insert(0, 0, 2, 1).unwrap();
    area.insert(1, 0, 2, 2).unwrap();
    assert!(area.is_intersect_with_point(3, 3).unwrap());
}
