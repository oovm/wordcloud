#![feature(box_syntax)]
#![feature(iter_from_generator)]
#![feature(generators)]

mod tree;

pub use crate::tree::{AABB, PixelVolumeTree};
