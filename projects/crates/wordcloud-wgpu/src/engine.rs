use bytemuck::{Pod, Zeroable};
use wgpu::util::DeviceExt;
use wordcloud::{build_candidates, normalize_frequencies};
use wordcloud_types::{
    LayoutBounds, LayoutConfig, LayoutResult, SpiralLayout, TextElement, WordCloudElement, WordCloudError, WordCloudResult,
    WordFrequency,
};

const SHADER: &str = include_str!("../shaders/placement.wgsl");
const MAX_PLACED: usize = 4096;

fn align_up(value: u64, alignment: u64) -> u64 {
    (value + alignment - 1) / alignment * alignment
}

#[repr(C)]
#[derive(Clone, Copy, Pod, Zeroable)]
struct GpuParams {
    canvas_width: f32,
    canvas_height: f32,
    padding: f32,
    center_x: f32,
    center_y: f32,
    word_width: f32,
    word_height: f32,
    max_attempts: u32,
    placed_count: u32,
    archimedean: u32,
}

#[repr(C)]
#[derive(Clone, Copy, Pod, Zeroable)]
struct GpuRect {
    x: f32,
    y: f32,
    width: f32,
    height: f32,
}

#[repr(C)]
#[derive(Clone, Copy, Pod, Zeroable)]
struct GpuVec2 {
    x: f32,
    y: f32,
}

struct GpuState {
    device: wgpu::Device,
    queue: wgpu::Queue,
    pipeline: wgpu::ComputePipeline,
    bind_layout: wgpu::BindGroupLayout,
    params_buffer: wgpu::Buffer,
    placed_buffer: wgpu::Buffer,
    valid_buffer: wgpu::Buffer,
    position_buffer: wgpu::Buffer,
    readback_buffer: wgpu::Buffer,
}

/// GPU layout engine — parallel spiral + collision via compute shader.
pub struct GpuLayoutEngine {
    config: LayoutConfig,
    gpu: GpuState,
}

impl GpuLayoutEngine {
    pub fn new(config: LayoutConfig) -> WordCloudResult<Self> {
        let gpu = init_gpu(config.max_attempts as usize)?;
        Ok(Self { config, gpu })
    }

    pub fn layout(&self, words: &[WordFrequency]) -> WordCloudResult<LayoutResult> {
        if words.is_empty() {
            return Ok(LayoutResult::failed(self.bounds()));
        }

        let normalized = normalize_frequencies(words);
        let mut candidates = build_candidates(&normalized, &self.config);
        candidates.sort_by(|a, b| b.geometry.frequency.partial_cmp(&a.geometry.frequency).unwrap_or(std::cmp::Ordering::Equal));

        let mut placed = Vec::new();
        let mut placed_rects = Vec::new();

        for candidate in candidates {
            if let Some(element) = self.try_place_gpu(&candidate, &placed_rects)? {
                placed_rects.push(GpuRect {
                    x: element.geometry.x,
                    y: element.geometry.y,
                    width: element.geometry.width,
                    height: element.geometry.height,
                });
                placed.push(WordCloudElement::Text(element));
            }
        }

        let success = !placed.is_empty();
        Ok(LayoutResult { elements: placed, bounds: self.bounds(), success })
    }

    fn bounds(&self) -> LayoutBounds {
        LayoutBounds { width: self.config.width, height: self.config.height }
    }

    fn try_place_gpu(&self, element: &TextElement, placed_rects: &[GpuRect]) -> WordCloudResult<Option<TextElement>> {
        if placed_rects.len() >= MAX_PLACED {
            return Ok(None);
        }

        let params = GpuParams {
            canvas_width: self.config.width as f32,
            canvas_height: self.config.height as f32,
            padding: self.config.padding,
            center_x: self.config.width as f32 / 2.0,
            center_y: self.config.height as f32 / 2.0,
            word_width: element.geometry.width,
            word_height: element.geometry.height,
            max_attempts: self.config.max_attempts,
            placed_count: placed_rects.len() as u32,
            archimedean: if self.config.spiral == SpiralLayout::Archimedean { 1 } else { 0 },
        };

        self.gpu.queue.write_buffer(&self.gpu.params_buffer, 0, bytemuck::bytes_of(&params));

        if !placed_rects.is_empty() {
            self.gpu.queue.write_buffer(&self.gpu.placed_buffer, 0, bytemuck::cast_slice(placed_rects));
        }

        let bind_group = self.gpu.device.create_bind_group(&wgpu::BindGroupDescriptor {
            label: Some("wordcloud placement"),
            layout: &self.gpu.bind_layout,
            entries: &[
                wgpu::BindGroupEntry { binding: 0, resource: self.gpu.params_buffer.as_entire_binding() },
                wgpu::BindGroupEntry { binding: 1, resource: self.gpu.placed_buffer.as_entire_binding() },
                wgpu::BindGroupEntry { binding: 2, resource: self.gpu.valid_buffer.as_entire_binding() },
                wgpu::BindGroupEntry { binding: 3, resource: self.gpu.position_buffer.as_entire_binding() },
            ],
        });

        let mut encoder = self
            .gpu
            .device
            .create_command_encoder(&wgpu::CommandEncoderDescriptor { label: Some("wordcloud placement encoder") });

        {
            let mut pass = encoder.begin_compute_pass(&wgpu::ComputePassDescriptor {
                label: Some("wordcloud placement pass"),
                timestamp_writes: None,
            });
            pass.set_pipeline(&self.gpu.pipeline);
            pass.set_bind_group(0, &bind_group, &[]);
            let groups = (self.config.max_attempts + 63) / 64;
            pass.dispatch_workgroups(groups, 1, 1);
        }

        let valid_bytes = self.config.max_attempts as u64 * std::mem::size_of::<u32>() as u64;
        let position_bytes = self.config.max_attempts as u64 * std::mem::size_of::<GpuVec2>() as u64;
        let valid_copy = align_up(valid_bytes, wgpu::COPY_BUFFER_ALIGNMENT);
        let position_offset = align_up(valid_bytes, wgpu::COPY_BUFFER_ALIGNMENT);
        let position_copy = align_up(position_bytes, wgpu::COPY_BUFFER_ALIGNMENT);

        encoder.copy_buffer_to_buffer(&self.gpu.valid_buffer, 0, &self.gpu.readback_buffer, 0, valid_copy);
        encoder.copy_buffer_to_buffer(&self.gpu.position_buffer, 0, &self.gpu.readback_buffer, position_offset, position_copy);

        self.gpu.queue.submit(Some(encoder.finish()));

        let map_end = position_offset + position_copy;
        let slice = self.gpu.readback_buffer.slice(..map_end);
        let (sender, receiver) = std::sync::mpsc::sync_channel(1);
        slice.map_async(wgpu::MapMode::Read, move |result| {
            let _ = sender.send(result);
        });
        self.gpu.device.poll(wgpu::Maintain::Wait);
        receiver
            .recv()
            .map_err(|_| WordCloudError::Validation("GPU readback channel closed".into()))?
            .map_err(|err| WordCloudError::Validation(format!("GPU map failed: {err}")))?;

        let placed = {
            let data = slice.get_mapped_range();
            let valid = bytemuck::cast_slice::<u8, u32>(&data[..valid_bytes as usize]);
            let positions = bytemuck::cast_slice::<u8, GpuVec2>(
                &data[position_offset as usize..(position_offset + position_bytes) as usize],
            );

            let mut found = None;
            for (attempt, flag) in valid.iter().enumerate() {
                if *flag == 1 {
                    let mut placed = element.clone();
                    placed.geometry.x = positions[attempt].x;
                    placed.geometry.y = positions[attempt].y;
                    found = Some(placed);
                    break;
                }
            }
            found
        };

        self.gpu.readback_buffer.unmap();
        Ok(placed)
    }
}

fn init_gpu(max_attempts: usize) -> WordCloudResult<GpuState> {
    let instance_desc = wgpu::InstanceDescriptor { backends: wgpu::Backends::all(), ..Default::default() };
    let instance = wgpu::Instance::new(&instance_desc);

    let adapter = pollster::block_on(instance.request_adapter(&wgpu::RequestAdapterOptions {
        power_preference: wgpu::PowerPreference::HighPerformance,
        compatible_surface: None,
        force_fallback_adapter: false,
    }))
    .ok_or_else(|| WordCloudError::Validation("no compatible GPU adapter".into()))?;

    let (device, queue) = pollster::block_on(adapter.request_device(
        &wgpu::DeviceDescriptor {
            label: Some("wordcloud-wgpu"),
            required_features: wgpu::Features::empty(),
            required_limits: wgpu::Limits::default(),
            memory_hints: wgpu::MemoryHints::Performance,
        },
        None,
    ))
    .map_err(|err| WordCloudError::Validation(format!("GPU device init failed: {err}")))?;

    let shader = device.create_shader_module(wgpu::ShaderModuleDescriptor {
        label: Some("wordcloud placement shader"),
        source: wgpu::ShaderSource::Wgsl(SHADER.into()),
    });

    let bind_layout = device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
        label: Some("wordcloud placement layout"),
        entries: &[
            wgpu::BindGroupLayoutEntry {
                binding: 0,
                visibility: wgpu::ShaderStages::COMPUTE,
                ty: wgpu::BindingType::Buffer {
                    ty: wgpu::BufferBindingType::Uniform,
                    has_dynamic_offset: false,
                    min_binding_size: None,
                },
                count: None,
            },
            wgpu::BindGroupLayoutEntry {
                binding: 1,
                visibility: wgpu::ShaderStages::COMPUTE,
                ty: wgpu::BindingType::Buffer {
                    ty: wgpu::BufferBindingType::Storage { read_only: true },
                    has_dynamic_offset: false,
                    min_binding_size: None,
                },
                count: None,
            },
            wgpu::BindGroupLayoutEntry {
                binding: 2,
                visibility: wgpu::ShaderStages::COMPUTE,
                ty: wgpu::BindingType::Buffer {
                    ty: wgpu::BufferBindingType::Storage { read_only: false },
                    has_dynamic_offset: false,
                    min_binding_size: None,
                },
                count: None,
            },
            wgpu::BindGroupLayoutEntry {
                binding: 3,
                visibility: wgpu::ShaderStages::COMPUTE,
                ty: wgpu::BindingType::Buffer {
                    ty: wgpu::BufferBindingType::Storage { read_only: false },
                    has_dynamic_offset: false,
                    min_binding_size: None,
                },
                count: None,
            },
        ],
    });

    let pipeline_layout = device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
        label: Some("wordcloud placement pipeline layout"),
        bind_group_layouts: &[&bind_layout],
        push_constant_ranges: &[],
    });

    let pipeline = device.create_compute_pipeline(&wgpu::ComputePipelineDescriptor {
        label: Some("wordcloud placement pipeline"),
        layout: Some(&pipeline_layout),
        module: &shader,
        entry_point: Some("main"),
        compilation_options: wgpu::PipelineCompilationOptions::default(),
        cache: None,
    });

    let params_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
        label: Some("wordcloud params"),
        contents: bytemuck::bytes_of(&GpuParams {
            canvas_width: 0.0,
            canvas_height: 0.0,
            padding: 0.0,
            center_x: 0.0,
            center_y: 0.0,
            word_width: 0.0,
            word_height: 0.0,
            max_attempts: 0,
            placed_count: 0,
            archimedean: 1,
        }),
        usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
    });

    let placed_buffer = device.create_buffer(&wgpu::BufferDescriptor {
        label: Some("wordcloud placed rects"),
        size: (MAX_PLACED * std::mem::size_of::<GpuRect>()) as u64,
        usage: wgpu::BufferUsages::STORAGE | wgpu::BufferUsages::COPY_DST,
        mapped_at_creation: false,
    });

    let valid_buffer = device.create_buffer(&wgpu::BufferDescriptor {
        label: Some("wordcloud valid flags"),
        size: (max_attempts * std::mem::size_of::<u32>()) as u64,
        usage: wgpu::BufferUsages::STORAGE | wgpu::BufferUsages::COPY_SRC,
        mapped_at_creation: false,
    });

    let position_buffer = device.create_buffer(&wgpu::BufferDescriptor {
        label: Some("wordcloud positions"),
        size: (max_attempts * std::mem::size_of::<GpuVec2>()) as u64,
        usage: wgpu::BufferUsages::STORAGE | wgpu::BufferUsages::COPY_SRC,
        mapped_at_creation: false,
    });

    let valid_bytes = (max_attempts * std::mem::size_of::<u32>()) as u64;
    let position_bytes = (max_attempts * std::mem::size_of::<GpuVec2>()) as u64;
    let position_offset = align_up(valid_bytes, wgpu::COPY_BUFFER_ALIGNMENT);
    let readback_bytes =
        align_up(position_offset + align_up(position_bytes, wgpu::COPY_BUFFER_ALIGNMENT), wgpu::COPY_BUFFER_ALIGNMENT);
    let readback_buffer = device.create_buffer(&wgpu::BufferDescriptor {
        label: Some("wordcloud readback"),
        size: readback_bytes,
        usage: wgpu::BufferUsages::MAP_READ | wgpu::BufferUsages::COPY_DST,
        mapped_at_creation: false,
    });

    Ok(GpuState {
        device,
        queue,
        pipeline,
        bind_layout,
        params_buffer,
        placed_buffer,
        valid_buffer,
        position_buffer,
        readback_buffer,
    })
}
