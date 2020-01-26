use std::sync::Arc;
use bvh_arena::{Bvh, volumes::Aabb};
use fontdue::Font;
use fontdue::layout::{CoordinateSystem, Layout, LayoutSettings, TextStyle};
use glam::Vec2;
use image::{Rgba, RgbaImage};


pub struct TextSprite {
    text: String,
    font: String,
    font_size: u32,
    rotate: u32,
    image: Arc<RgbaImage>,
    color: Rgba<u8>,
    x: u32,
    y: u32,
    width: u32,
    height: u32,
}

impl TextSprite {
    pub fn new(text: &str, font: &str) -> Self {
        Self {
            text: "".to_string(),
            font: "".to_string(),
            font_size: 0,
            rotate: 0,
            image: Arc::new(RgbaImage::new(0, 0)),
            color: Rgba::from([255, 255, 255, 255]),
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        }
    }
    pub fn rotate(&mut self, rotate: u32) -> &mut Self {
        self.rotate = rotate;
        return self;
    }
}

#[test]
fn main() {


// Create a bounding volume hierarchy
    let mut bvh: Bvh<usize, Aabb<2>> = Bvh::default();

// Insert a bounding volume
    let id = bvh.insert(1, Aabb::from_min_max(Vec2::ZERO, Vec2::new(1.0, 1.0)));

// Remove a bounding volume
//     bvh.remove(id);


// Iteration over overlaping pairs
    bvh.for_each_overlaping_pair(|a, b| println!("{a} overlaps {b}"));
}

#[test]
fn test_render() {
// Read the font data.
    let font = include_bytes!("Roboto-Regular.ttf") as &[u8];
// Parse it into the font type.
    let roboto_regular = Font::from_bytes(font, fontdue::FontSettings::default()).unwrap();
// The list of fonts that will be used during layout.
    let fonts = &[roboto_regular];
// Create a layout context. Laying out text needs some heap allocations; reusing this context
// reduces the need to reallocate space. We inform layout of which way the Y axis points here.
    let mut layout = Layout::new(CoordinateSystem::PositiveYUp);
// By default, layout is initialized with the default layout settings. This call is redundant, but
// demonstrates setting the value with your custom settings.
    layout.reset(&LayoutSettings {
        ..LayoutSettings::default()
    });
// The text that will be laid out, its size, and the index of the font in the font list to use for
// that section of text.
    layout.append(fonts, &TextStyle::new("Hello ", 35.0, 0));
    layout.append(fonts, &TextStyle::new("world!", 40.0, 0));
// Prints the layout for "Hello world!"
    println!("{:#?}", layout.glyphs());
}