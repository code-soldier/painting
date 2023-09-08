let canvas: HTMLCanvasElement
let device: GPUDevice
let context: GPUCanvasContext
let format: GPUTextureFormat
let depthView: GPUTextureView
let MSAAView: GPUTextureView

let commandEncoder: GPUCommandEncoder
let passEncoder: GPURenderPassEncoder


export function createPassEncoder() {
    commandEncoder = device.createCommandEncoder()
    const renderPassDescriptor: GPURenderPassDescriptor = {
        colorAttachments: [{
            view: MSAAView,
            clearValue: { r: 0, g: 0, b: 0, a: 1 },
            loadOp: 'clear',
            storeOp: 'store',
            resolveTarget: context.getCurrentTexture().createView(),
        }],
        // depthStencilAttachment: {
        //     view: depthView,
        //     depthClearValue: 1.0,
        //     depthLoadOp: 'clear',
        //     depthStoreOp: 'store'
        // }
    }
    passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor)
}

export function submit() {
    passEncoder.end()
    device.queue.submit([commandEncoder.finish()])
}

export function draw({
    rpl,
    vertexBuffers,
    bindGroups,
    count
}: {
    rpl: GPURenderPipeline,
    vertexBuffers: GPUBuffer[],
    bindGroups?: GPUBindGroup[],
    count: number,
}) {
    passEncoder.setPipeline(rpl)
    vertexBuffers.forEach((buffer, i) => passEncoder.setVertexBuffer(i, buffer))
    bindGroups?.forEach((bindGroup, i) => passEncoder.setBindGroup(i, bindGroup))
    passEncoder.draw(count)
}

export async function initContext() {
    if (!navigator.gpu)
        throw new Error('Not Support WebGPU')
    const adapter = await navigator.gpu.requestAdapter({
        powerPreference: 'high-performance'
    })
    if (!adapter)
        throw new Error('No Adapter Found')
    canvas = document.createElement('canvas')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    canvas.style.display = 'block'
    document.body.appendChild(canvas)
    device = await adapter.requestDevice()
    context = canvas.getContext('webgpu') as GPUCanvasContext
    format = navigator.gpu.getPreferredCanvasFormat()
    context.configure({
        device: device, format: format,
        alphaMode: 'opaque'
    })
    depthView = device.createTexture({
        size: { width: canvas.width, height: canvas.height },
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
        format: 'depth24plus',
        sampleCount: 4,
    }).createView()
    MSAAView = device.createTexture({
        size: { width: canvas.width, height: canvas.height },
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
        format: format,
        sampleCount: 4,
    }).createView()
}

export function createRenderPipeline({
    attrs,
    shader
}: {
    attrs: number[], // [2,3] -> 前两个数代表坐标，后三个代表颜色
    shader: string,
}) {
    const arrayStride = attrs.reduce((p, c) => p + c) * Float32Array.BYTES_PER_ELEMENT
    let lastOffset = 0
    let attributes = attrs.map((v, i) => {
        let obj = {
            shaderLocation: i,
            offset: lastOffset,
            format: 'float32x' + v,
        }
        lastOffset += v * Float32Array.BYTES_PER_ELEMENT
        return obj as GPUVertexAttribute
    })


    const rpl = device.createRenderPipeline({
        layout: 'auto',
        vertex: {
            module: device.createShaderModule({ code: shader }),
            entryPoint: 'vs_main',
            buffers: [{
                arrayStride,
                attributes,
            }]
        },
        fragment: {
            module: device.createShaderModule({ code: shader }),
            entryPoint: 'fs_main',
            targets: [{ format }]
        },
        primitive: {
            topology: 'triangle-list',
            // cullMode: 'back',
            // frontFace: 'ccw'
        },
        // depthStencil: {
        //     depthWriteEnabled: true,
        //     depthCompare: 'less',
        //     format: 'depth24plus'
        // },
        multisample: {
            count: 4,
        }
    })
    return rpl
}


export function createBindGroup({ bindings, rpl }: { bindings: GPUBindGroupEntry[], rpl: GPURenderPipeline }) {
    const bindGroup = device.createBindGroup({
        layout: rpl.getBindGroupLayout(0),
        entries: bindings,
    })
    return bindGroup
}

export function createBuffer({
    data,
    usage
}: {
    data: number[],
    usage: number
}) {
    const buffer = device.createBuffer({
        size: data.length * Float32Array.BYTES_PER_ELEMENT,
        usage,
    })
    device.queue.writeBuffer(buffer, 0, new Float32Array(data))
    
    return {
        buffer,
        reWrite: (data:number[]) => device.queue.writeBuffer(buffer, 0, new Float32Array(data))
    }
}