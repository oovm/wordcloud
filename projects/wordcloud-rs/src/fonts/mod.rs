use crate::{RenderDevice, Result};
use image::DynamicImage;

pub struct Text {
    font: String,
    font_size: u32,
    device: RenderDevice,
}

impl Text {
    pub fn render(&self) -> DynamicImage {
        match self.device {
            RenderDevice::Native => self.render_native(),
            RenderDevice::Wasm => self.render_wasm(),
            RenderDevice::GPU => self.render_gpu(),
        }
    }

    fn render_wasm(&self) -> DynamicImage {
        unimplemented!()
    }

    fn render_gpu(&self) -> DynamicImage {
        unimplemented!()
    }

    fn render_native(&self) -> DynamicImage {
        unimplemented!()
    }
}
