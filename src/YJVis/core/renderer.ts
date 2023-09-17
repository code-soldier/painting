import { Scene } from "./scene";
import { GPURenderer } from '../gfx/webgpu'
import { GLRenderer } from '../gfx/webgl'
import { Control, OrbitControl } from "./control";

export class Renderer {

    canvas: HTMLCanvasElement

    apiRenderer: GPURenderer | GLRenderer

    scene: Scene

    control: Control

    constructor(props?: {
        api?: 'webgpu' | 'webgl',
        canvas?: HTMLCanvasElement
    }) {
        const {
            api = 'webgl',
            canvas
        } = props ?? {}

        this.initCanvas(canvas)

        this.apiRenderer = api == 'webgpu' ? new GPURenderer() : new GLRenderer()
        this.apiRenderer.renderable = this
    }

    render() {
        this.scene.updateWorldMatrix()
        // this.scene.camera.updateViewMatrix()
        
        this.apiRenderer.render()
    }

    initCanvas(canvas?: HTMLCanvasElement) {
        if (!canvas) {
            canvas = document.createElement('canvas')
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            document.body.appendChild(canvas)
        }
        canvas.style.display = 'block'
        this.canvas = canvas
    }

}