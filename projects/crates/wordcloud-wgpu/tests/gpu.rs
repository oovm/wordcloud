use wordcloud_types::{LayoutConfig, WordFrequency};
use wordcloud_wgpu::GpuLayoutEngine;

#[test]
#[ignore = "requires a working GPU adapter"]
fn gpu_layout_places_words() {
    let engine = GpuLayoutEngine::new(LayoutConfig { width: 640, height: 480, max_attempts: 256, ..LayoutConfig::default() })
        .expect("gpu adapter");

    let words = vec![WordFrequency::new("gpu", 5.0), WordFrequency::new("wgpu", 4.0), WordFrequency::new("rust", 3.0)];

    let result = engine.layout(&words).expect("layout");
    assert!(result.success);
    assert!(!result.elements.is_empty());
}
