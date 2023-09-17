import { Mesh, Renderer, Scene, Node } from "@/YJVis/core";
import { GLMesh } from "./glMesh";

export class GLRenderer {

    renderable: Renderer

    meshs: Map<Mesh, GLMesh> = new Map()

    gl: WebGL2RenderingContext

    scene: Scene

    constructor(

    ) { }

    render() {
        if (!this.gl) {
            this.initWebGL()
        }
        const gl = this.gl
        gl.viewport(0, 0, innerWidth, innerHeight)
        gl.clearColor(0.0, 0.0, 0.0, 1)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        this.traverse(this.renderable.scene)
    }

    traverse(node: Node) {
        if (node instanceof Mesh) {
            let mesh = this.meshs.get(node)
            if (!mesh) {
                mesh = new GLMesh({
                    gl: this.gl,
                    renderable: node,
                    scene: this.renderable.scene
                })
                this.meshs.set(node, mesh)
            }
            mesh.render()
        }

        node.children?.forEach((child: Node) => this.traverse(child))
    }

    initWebGL() {
        this.gl = this.renderable.canvas.getContext('webgl2')
    }
}