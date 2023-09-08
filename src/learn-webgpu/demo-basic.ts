import * as util from "./util";

await util.initContext()

const shader = /* wgsl */`
struct VertexOutput {
    @builtin(position) position : vec4<f32>,
    @location(0) color : vec4<f32>,
}

@vertex
fn vs_main(
    @builtin(vertex_index) vid: u32,
    @location(0) position: vec2<f32>,
    @location(1) color: vec3<f32>
) -> VertexOutput {
    var out: VertexOutput;
    out.position = vec4<f32>(position,0.0,1.0);
    out.color = vec4<f32>(color,1.0);
    return out;
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
    return input.color;
}
`

const rpl = util.createRenderPipeline({
    shader,
    attrs: [2, 3]
})

const vbo = util.craeteBuffer({
    data: [
        0, 0.5, 1, 0, 0,
        0.5, -0.5, 0, 1, 0,
        -0.5, -0.5, 0, 0, 1,
    ]
})

util.createPassEncoder()

util.draw({
    rpl,
    vertexBuffers: [vbo],
    count: 3
})

util.submit()