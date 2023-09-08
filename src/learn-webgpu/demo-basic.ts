import * as util from "./util";

await util.initContext()

const shader = /* wgsl */`
struct VertexOutput {
    @builtin(position) position : vec4f,
    @location(0) color : vec4f,
}

@group(0) @binding(0) var<uniform> offsetX : f32;

@vertex
fn vs_main(
    @builtin(vertex_index) vid: u32,
    @location(0) position: vec2<f32>,
    @location(1) color: vec3<f32>
) -> VertexOutput {
    var out: VertexOutput;
    out.position = vec4f(position.x + offsetX, position.y,0,1);
    out.color = vec4f(color,1.0);
    return out;
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4f {
    return input.color;
}
`


const {
    buffer:ubo,
    reWrite,
} = util.createBuffer({
    data: [0],
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
})

const {
    bindGroup: bgp,
    bindGroupLayout
} = util.createBindGroup({
    bindings: [{
        binding: 0,
        resource: {
            buffer: ubo
        }
    }]
})

const rpl = util.createRenderPipeline({
    shader,
    attrs: [2, 3],
    bindGroupLayouts: [bindGroupLayout]
})

const {
    buffer: vbo
}  = util.createBuffer({
    data: [
        0, 0.5, 1, 0, 0,
        0.5, -0.5, 0, 1, 0,
        -0.5, -0.5, 0, 0, 1,
    ],
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
})




function frame(t:number) {
    requestAnimationFrame(frame)

    reWrite([Math.sin(t)])
    util.createPassEncoder()
    util.draw({
        rpl,
        vertexBuffers: [vbo],
        bindGroups: [bgp],
        count: 3
    })
    util.submit()
}

frame(0)