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

use diagnostic_quick::QResult;

#[test]
fn test() {
    test_render();
}

fn test_render() -> QResult {
    let font = SystemSource::new().select_best_match(&[FamilyName::SansSerif], &Properties::new()).unwrap().load().unwrap();
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
    )
    .unwrap();
    println!("{}", canvas.size.y());
    font.rasterize_glyph(
        &mut canvas,
        glyph_id,
        32.0,
        Transform2F::from_translation(Vector2F::new(0.0, 32.0)),
        HintingOptions::None,
        RasterizationOptions::GrayscaleAa,
    )
    .unwrap();
    println!("{}", canvas.size.y());

    Ok(())
}

pub struct WordShape {}
