use diagnostic_quick::{QError, QResult};
use font_kit::{
    canvas::{Canvas, Format, RasterizationOptions},
    family_name::FamilyName,
    font::Font,
    hinting::HintingOptions,
    loader::Loader,
    properties::Properties,
    source::SystemSource,
};
use pathfinder_geometry::{
    transform2d::Transform2F,
    vector::{Vector2F, Vector2I},
};

#[test]
fn test() {
    let font = SystemSource::new().select_best_match(&[FamilyName::Monospace], &Properties::new()).unwrap().load().unwrap();
    render_text("The quick brown fox jumps over the lazy dog", &font, 20.0);
}

fn render_text(text: &str, font: &Font, font_size: f32) -> QResult<Canvas> {
    let mut chars = vec![];
    for char in text.chars() {
        let glyph_id = match font.glyph_for_char(char) {
            Some(s) => s,
            None => Err(QError::runtime_error(format!("No such char `{char}` in font {}", font.family_name())))?,
        };
        let size = font.raster_bounds(
            glyph_id,
            font_size,
            Transform2F::from_translation(Vector2F::new(0.0, font_size)),
            HintingOptions::None,
            RasterizationOptions::SubpixelAa,
        )?;
        chars.push((glyph_id, size));
    }
    let mut x = 0.0;
    let mut canvas = Canvas::new(Vector2I::new(font_size as i32), Format::A8);
    for (glyph_id, rect) in chars {
        font.rasterize_glyph(
            &mut canvas,
            glyph_id,
            font_size,
            Transform2F::from_translation(Vector2F::new(x, font_size)),
            HintingOptions::None,
            RasterizationOptions::SubpixelAa,
        )?;
        x += rect.size().x() as f32;
    }
    Ok(canvas)
}

fn draw((base_x, mut base_y): (i32, i32), font: &Font, size_font: f64, text: &str) -> QResult {
    let em = (size_font / 1.24) as f32;
    let mut x = base_x as f32;
    let metrics = font.metrics();

    let canvas_size = size_font as usize;

    base_y -= (0.24 * em) as i32;

    let mut prev = None;
    let place_holder = font.glyph_for_char(PLACEHOLDER_CHAR);

    for c in text.chars() {
        if let Some(glyph_id) = font.glyph_for_char(c).or(place_holder) {
            if let Some(pc) = prev {
                x += font.query_kerning_table(pc, glyph_id) * em / metrics.units_per_em as f32;
            }
            let mut canvas = Canvas::new(Vector2I::splat(canvas_size as i32), Format::A8);
            result = font
                .rasterize_glyph(
                    &mut canvas,
                    glyph_id,
                    em as f32,
                    Transform2F::from_translation(Vector2F::new(0.0, em as f32)),
                    HintingOptions::None,
                    RasterizationOptions::GrayscaleAa,
                )
                .map_err(|e| FontError::GlyphError(Arc::new(e)))
                .and(result);
            let base_x = x as i32;

            for dy in 0..canvas_size {
                for dx in 0..canvas_size {
                    let alpha = canvas.pixels[dy * canvas_size + dx] as f32 / 255.0;
                    if let Err(e) = draw(base_x + dx as i32, base_y + dy as i32, alpha) {
                        return Ok(Err(e));
                    }
                }
            }
            x += font.advance(glyph_id).map(|size| size.x()).unwrap_or(0.0) * em / metrics.units_per_em as f32;
            prev = Some(glyph_id);
        }
    }
    result
}

pub struct WordShape {}
