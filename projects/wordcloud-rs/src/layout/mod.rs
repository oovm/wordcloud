use crate::{Canvas, Sprite};
use image::GenericImageView;

#[derive(Debug, Clone, Default)]
pub enum RenderDevice {
    Native = 0,
    Wasm = 1,
    GPU = 2,
}

#[derive(Debug, Clone, Default)]
pub enum Layout {
    Rectangular = 0,
    Archimedes = 1,
}

#[derive(Debug, Clone, Default)]
pub enum RescaleWeight {
    Linear = 0,
    Sqrt = 1,
    Log = 2,
}

#[derive(Debug, Clone, Default)]
pub enum ColorFunction {
    Random = 0,
}

impl Layout {
    pub fn get_spiral(&self, width: u32, height: u32, t: u32, offset: u32) -> (u32, u32, u32) {
        match self {
            Layout::Rectangular => {
                let (mut x, mut y) = (0, 0);
                let t = t + offset;
                let sign = if t < 0 { -1 } else { 1 };
                let num = ((1 * 4 * sign * t).sqrt() - sign) as u32 % 4;
                match num {
                    0 => x += dx,
                    1 => y += dy,
                    2 => x -= dx,
                    _ => y -= dy,
                }
                (x + width / 2, y + height / 2, t)
            }
            Layout::Archimedes => {
                let t = offset + t / 5;
                let x = t * t.cos() + width / 2;
                let y = t * t.sin() + width / 2;
                (x as u32, y as u32, t)
            }
        }
    }
    pub fn find_position(&self, sprite: &Sprite, bounds: &Canvas, offset: u32) -> Option<(u32, u32, u32)> {
        let mut dt = 0;
        loop {
            dt += 1;
            let (x, y, ret) = self.get_spiral(width, height, dt, offset);
            if x > width - sprite.image.width() || x < 0 || y > height - sprite.image.height() || y < 0 {
                break;
            }
            let placed = bounds.check_sprite(sprite, x, y);
            for p in placed.iter() {
                if sprite.tree.overlaps(&p.tree, x, y, p.x, p.y) {
                    break;
                }
            }
            return Some((x, y, ret));
        }
        return None;
    }
}
