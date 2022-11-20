import { Object3D } from "./Object3D";
import { gl } from "./RendererGL";

export class ObjectGL extends Object3D {

    program: WebGLProgram

    constructor(params?: {
        vs?: string
        fs?: string
    }) {
        super()
        let { vs, fs } = params
        this.initProgram(vs, fs)
    }

    frameObjecGL() {

    }

    initProgram(vs: string, fs: string) {
        const program = this.program = gl.createProgram()
        
        const vertex = gl.createShader(gl.VERTEX_SHADER)
        gl.shaderSource(vertex, vs)
        gl.compileShader(vertex)
        if (gl.getShaderInfoLog(vertex)) {
            console.error('顶点着色器编译失败：', gl.getShaderInfoLog(vertex));
        }
        gl.attachShader(program, vertex)

        const fragment = gl.createShader(gl.FRAGMENT_SHADER)
        gl.shaderSource(fragment, fs)
        gl.compileShader(fragment)
        if (gl.getShaderInfoLog(fragment)) {
            console.error('片元着色器编译失败：', gl.getShaderInfoLog(fragment));
        }
        gl.attachShader(program, fragment)

        gl.linkProgram(program)
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.log('program创建失败', gl.getProgramInfoLog(program));
        }
        gl.useProgram(program)

    }
}