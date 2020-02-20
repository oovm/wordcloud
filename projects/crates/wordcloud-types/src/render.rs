use crate::theme::Theme;

/// Target runtime for rendering.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub enum RenderDevice {
    #[default]
    Native,
    Wasm,
    Gpu,
}

/// Weight rescaling strategy when mapping frequency to font size.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub enum RescaleWeight {
    #[default]
    Linear,
    Sqrt,
    Log,
}

/// Color selection strategy.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub enum ColorFunction {
    #[default]
    Random,
}

/// Renderer configuration shared across backends.
#[derive(Debug, Clone, PartialEq)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct RenderConfig {
    pub theme: Theme,
    pub progressive: bool,
    pub animation_speed_ms: u32,
}

/// Fast-skip threshold used by collision placement heuristics.
pub const FAST_SKIP_THRESHOLD: f32 = 0.8;

/// Minimum quad-tree resolution for sprite collision checks.
pub const MINIMUM_COLLISION_RESOLUTION: u32 = 2;
