import { Scene, Renderer, Node, Mesh } from "@/YJVis/core";
import { GPUMesh } from "./gpuMesh";

export class GPURenderer {

    renderable: Renderer
    meshs: Map<Mesh,GPUMesh> = new Map()

    device: GPUDevice
    context: GPUCanvasContext
    format: GPUTextureFormat

    render(scene: Scene) {
        
        if (!this.device) {
            this.initWebGPU().then(_ => {
                this.render(scene)
            })
            return
        }
        this.traverse(scene)
    }

    traverse(node: Node) {
        if(node instanceof Mesh){
            let mesh = this.meshs.get(node)
            if(!mesh){
                mesh = new GPUMesh()
                mesh.renderable = node
                this.meshs.set(node,mesh)
            }
            mesh.draw()
        }
        
        node.children?.forEach((child: Node) => this.traverse(child))
    }

    async initWebGPU() {
        if (!navigator.gpu) throw new Error('Not Support WebGPU')
        const adapter = await navigator.gpu.requestAdapter({
            powerPreference: 'high-performance'
        })
        if (!adapter) throw new Error('No Adapter Found')

        this.device = await adapter.requestDevice()
        this.context = this.renderable.canvas.getContext('webgpu') as GPUCanvasContext
        this.format = navigator.gpu.getPreferredCanvasFormat()
        this.context.configure({
            device: this.device, format: this.format,
            alphaMode: 'opaque'
        })
        // depthView = device.createTexture({
        //     size: { width: canvas.width, height: canvas.height },
        //     usage: GPUTextureUsage.RENDER_ATTACHMENT,
        //     format: 'depth24plus',
        //     sampleCount: 4,
        // }).createView()
        // MSAAView = device.createTexture({
        //     size: { width: canvas.width, height: canvas.height },
        //     usage: GPUTextureUsage.RENDER_ATTACHMENT,
        //     format: format,
        //     sampleCount: 4,
        // }).createView()
    }
}