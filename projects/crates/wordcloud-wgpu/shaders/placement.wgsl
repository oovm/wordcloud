struct Params {
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

struct Rect {
    x: f32,
    y: f32,
    width: f32,
    height: f32,
}

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var<storage, read> placed: array<Rect>;
@group(0) @binding(2) var<storage, read_write> valid: array<u32>;
@group(0) @binding(3) var<storage, read_write> positions: array<vec2<f32>>;

fn spiral_position(step: u32) -> vec2<f32> {
    if params.archimedean == 1u {
        let angle = f32(step) * 0.1;
        let radius = f32(step) * 2.0;
        return vec2<f32>(
            params.center_x + radius * cos(angle),
            params.center_y + radius * sin(angle),
        );
    }

    let side = (step / 4u) + 1u;
    let pos = step % 4u;
    let offset = f32(side) * 10.0;
    switch pos {
        case 0u: { return vec2<f32>(params.center_x + offset, params.center_y); }
        case 1u: { return vec2<f32>(params.center_x, params.center_y + offset); }
        case 2u: { return vec2<f32>(params.center_x - offset, params.center_y); }
        default: { return vec2<f32>(params.center_x, params.center_y - offset); }
    }
}

fn overlaps(ax: f32, ay: f32, aw: f32, ah: f32, bx: f32, by: f32, bw: f32, bh: f32) -> bool {
    return !(ax + aw < bx || bx + bw < ax || ay + ah < by || by + bh < ay);
}

fn within_bounds(x: f32, y: f32, width: f32, height: f32) -> bool {
    return x >= params.padding
        && y >= params.padding
        && x + width <= params.canvas_width - params.padding
        && y + height <= params.canvas_height - params.padding;
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
    let attempt = gid.x;
    if attempt >= params.max_attempts {
        return;
    }

    let center = spiral_position(attempt);
    let x = center.x - params.word_width * 0.5;
    let y = center.y - params.word_height * 0.5;

    if !within_bounds(x, y, params.word_width, params.word_height) {
        valid[attempt] = 0u;
        return;
    }

    var collides = false;
    for (var i = 0u; i < params.placed_count; i = i + 1u) {
        let other = placed[i];
        if overlaps(x, y, params.word_width, params.word_height, other.x, other.y, other.width, other.height) {
            collides = true;
            break;
        }
    }

    if collides {
        valid[attempt] = 0u;
        return;
    }

    valid[attempt] = 1u;
    positions[attempt] = vec2<f32>(x, y);
}
