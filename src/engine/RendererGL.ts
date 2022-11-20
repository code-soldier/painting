import { Camera } from "./Camera"
import { ObjectGL } from "./ObjectGL"
import { Scene } from "./Scene"
import { Object3D } from "./Object3D"

export let gl: WebGL2RenderingContext

export class RendererGL {

    canvas: HTMLCanvasElement
    size: { w: number, h: number }

    constructor(params?: {
        canvas?: HTMLCanvasElement
    }) {
        let {canvas} = params
        canvas ??= document.createElement('canvas')

        this.canvas = canvas
        canvas.style.display = 'block'
        gl = canvas.getContext('webgl2',{
            antialias: true
        })
        this.setSize({})
    }

    render(scene: Scene, camera: Camera) {
        this.renderObjectGL(scene)
    }

    setSize({
        w = innerWidth,
        h = innerHeight,
    }:{w?:number,h?:number}) {
        this.size = {w,h}
        this.canvas.width = w
        this.canvas.height = h
        gl.viewport(0,0,w,h)
    }

    renderObjectGL(scene: Scene) {
        const dfs = (obj: Object3D) => {
            if (obj instanceof ObjectGL) obj.frameObjecGL()
            obj.children?.forEach(v => dfs(v))
        }
        dfs(scene)
    }
    
}
