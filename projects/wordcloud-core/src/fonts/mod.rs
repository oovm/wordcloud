use crate::{WordCloudTask, WordCloudTaskKind};
use diagnostic_quick::QResult;
use font_kit::{
    canvas::{Canvas, Format, RasterizationOptions},
    family_name::FamilyName,
    hinting::HintingOptions,
    properties::Properties,
    source::SystemSource,
};
use pathfinder_geometry::{
    transform2d::Transform2F,
    vector::{Vector2F, Vector2I},
};
use std::f32::consts::PI;

#[test]
fn test() {
    test_render();
}

fn test_render() -> QResult {
    let font = SystemSource::new().select_best_match(&[FamilyName::SansSerif], &Properties::new())?.load()?;
    let glyph_id = match font.glyph_for_char('A') {
        Some(s) => s,
        None => {
            panic!("no such char `{}` in font {}", 'A', font.family_name());
        }
    };
    let mut canvas = Canvas::new(Vector2I::splat(32), Format::A8);
    font.rasterize_glyph(
        &mut canvas,
        glyph_id,
        32.0,
        Transform2F::from_translation(Vector2F::new(0.0, 32.0)),
        HintingOptions::None,
        RasterizationOptions::GrayscaleAa,
    )?;
    Ok(())
}

use quadtree_cd::{BoundingBox, RotatedRect as Rect, Tree};

#[test]
fn main() {
    let mut tree: Tree<Rect> = Tree::new(1.0, 1.0);
    let rr1 = Rect { x: 0.5, y: 0.5, w: 0.5, h: 0.5, a: PI / 4.0 };
    let rr2 = Rect { x: 0.85, y: 0.85, w: 0.15, h: 0.15, a: PI / 8.0 };

    // These rectangles are non-intersecting.
    assert!(tree.insert_unless_intersecting(rr1, &(&rr1).into()));
    assert!(tree.insert_unless_intersecting(rr2, &(&rr2).into()));

    // But this one intersects at least one.
    let rr3 = Rect { x: 0.85, y: 0.85, w: 0.25, h: 0.25, a: PI / 8.0 };
    assert!(!tree.insert_unless_intersecting(rr3, &(&rr3).into()));
}

pub struct WordShape {}
