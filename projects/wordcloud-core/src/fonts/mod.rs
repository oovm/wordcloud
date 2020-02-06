


use font_kit::canvas::{Canvas, Format, RasterizationOptions};
use font_kit::family_name::FamilyName;
use font_kit::hinting::HintingOptions;
use font_kit::properties::Properties;
use font_kit::source::SystemSource;
use pathfinder_geometry::transform2d::Transform2F;
use pathfinder_geometry::vector::{Vector2F, Vector2I};

#[test]
fn test() {

    let font = SystemSource::new().select_best_match(&[FamilyName::SansSerif],
                                                     &Properties::new())
        .unwrap()
        .load()
        .unwrap();
    let glyph_id = font.glyph_for_char('A').unwrap();
    let mut canvas = Canvas::new(Vector2I::splat(32), Format::A8);
    font.rasterize_glyph(&mut canvas,
                         glyph_id,
                         32.0,
                         Transform2F::from_translation(Vector2F::new(0.0, 32.0)),
                         HintingOptions::None,
                         RasterizationOptions::GrayscaleAa)
        .unwrap();
}