use crate::{RenderDevice, Result};

pub struct Text {
    font: String,
    font_size: u32,
    device: RenderDevice,
}

impl Text {
    pub fn render(&self) {
        match self.device {
            RenderDevice::Wasm => {}
            RenderDevice::Native => {}
            RenderDevice::GPU => {}
        }
    }

    fn render_wasm(&self) {}

    fn render_gpu(&self) {}
}
