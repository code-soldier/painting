import { Mesh, Node, Scene } from "@/YJVis/core";
import vs from './template_vertex.glsl?raw'
import fs from './template_fragment.glsl?raw'
import { buildBox } from "@/YJVis/core/polyData";
import { mat4 } from "gl-matrix";

const model = buildBox()

type Model = {
    [key: string]: Partial<Attibute>
}

type Attibute = {
    name: string,
    size: number,
    data: number[],
    stride: number
    offset: number
    type: number
    isInstance: boolean // 实例化的数据是给每个实例，而不是每个顶点
    isIndex: boolean // 特殊的数据，不需要传递给着色器
}

type Uniform = {
    value?: any,
    activeInfo: WebGLActiveInfo,
    location: WebGLUniformLocation
}


class VBO {
    buffer: WebGLBuffer
    target: GLenum = WebGL2RenderingContext.ARRAY_BUFFER
    attributes: Map<string, GLAttribute> = new Map()
    drawCount: number

    constructor(public gl: WebGL2RenderingContext) { }

    build(model: Model) {
        let offset = 0
        let pos: GLAttribute, color: GLAttribute, uv: GLAttribute, normal: GLAttribute
        if (model.pos) {
            pos = new GLAttribute('pos')
            this.attributes.set('pos', pos)
            pos.data = model.pos
            offset += 3
        }
        if (model.color) {
            color = new GLAttribute('color')
            this.attributes.set('color', color)
            color.data = model.color
            color.offset = offset
            offset += 3
        }
        if (model.uv) {
            uv = new GLAttribute('uv')
            this.attributes.set('uv', uv)
            uv.data = model.uv
            uv.size = 2
            uv.offset = offset
            offset += 2
        }
        if (model.normal) {
            normal = new GLAttribute('normal')
            normal.data = model.normal
            this.attributes.set('normal', normal)
            normal.offset = offset
            offset += 3
        }
        const stride = offset
        const vertCount = model.pos.length / 3
        const packedData = new Array(stride * vertCount)
        const attrs = [pos, color, uv, normal].filter(v => {
            if (v) {
                v.stride = stride
                return true
            }
        })
        for (let i = 0; i < vertCount; i++) {
            attrs.forEach((attr) => {
                for (let j = 0; j < attr.size; j++) {
                    packedData[i * stride + attr.offset + j] = attr.data[i * attr.size + j]
                }
            })
        }
        this.buffer = this.gl.createBuffer()
        this.gl.bindBuffer(this.target, this.buffer)
        this.gl.bufferData(this.target, packedData.length, this.gl.STATIC_DRAW)
        this.drawCount = vertCount
    }
}

export class GLMesh {

    renderable: Mesh
    model: Model
    program: WebGLProgram
    gl: WebGL2RenderingContext
    vao: WebGLVertexArrayObject
    attributes: Record<string, Attibute> // 除了两种特殊的attr其它的需要打包
    uniforms: Record<string, Uniform>
    vertex: string
    fragment: string
    linked: boolean = false

    scene: Scene // 为了拿到相机灯光


    constructor(props: {
        gl: WebGL2RenderingContext
        renderable: Mesh
        scene: Scene
    }) {
        const { gl, renderable, scene } = props
        this.gl = gl
        this.renderable = renderable
        this.scene = scene
        this.vbo = new VBO(gl)
        this.program = gl.createProgram();
    }

    render() {
        this.updateShader()
        this.bindVAO()
        this.updateAttribute()
        this.updateUniform()
        this.draw()
    }

    draw() {
        const gl = this.gl
        gl.drawArrays(gl.TRIANGLES, 0, this.vbo.drawCount)
    }

    updateShader() {
        if (this.linked) this.gl.useProgram(this.program)
        if (!this.vertex) {
            this.vertex = vs
            this.fragment = fs
            this.compileShader()
        }
    }

    bindVAO() {
        const gl = this.gl
        if (!this.vao) {
            this.vao = this.gl.createVertexArray()
            gl.bindVertexArray(this.vao)
            this.vbo.build(model)

            gl.bindBuffer(this.vbo.target, this.vbo.buffer)
            this.vbo.attributes.forEach((attr, name) => {
                gl.enableVertexAttribArray(attr.index)
                gl.vertexAttribPointer(attr.index, attr.size, attr.type, attr.normalized, attr.stride * Float32Array.BYTES_PER_ELEMENT, attr.offset * Float32Array.BYTES_PER_ELEMENT)
                gl.vertexAttribDivisor(attr.index, attr.divisor)
            })
            // this.vbo.build(model)
        } else {
            this.gl.bindVertexArray(this.vao)
        }
    }

    updateAttribute() {

    }

    updateUniform() {
        const gl = this.gl
        if (!this.uniforms) {
            this.uniforms = {}
            const numUniforms = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
            for (let i = 0; i < numUniforms; i++) {
                const activeInfo = gl.getActiveUniform(this.program, i)
                const location = gl.getUniformLocation(this.program, activeInfo.name)
                this.uniforms[activeInfo.name] = {
                    activeInfo,
                    location,
                }
            }
            this.uniforms.modelViewMatrix.value = mat4.multiply(mat4.create(), this.scene.camera.viewMatrix, this.renderable.worldMatrix)
            this.uniforms.projectionMatrix.value = this.scene.camera.projectionMatrix
            // this.uniforms.dirLightIntensity.value = 1
            // this.uniforms.dirLightColor.value = [1, 1, 1]
            // this.uniforms.dirLightDir.value = [1, 1, 1] // 相机的正方向

        }
        Object.values(this.uniforms).forEach(uniform => {
            this.setUniform(uniform.activeInfo.type, uniform.location, uniform.value)
        })
    }

    setUniform(type: GLenum, location: WebGLUniformLocation, value: any) {
        const gl = this.gl
        switch (type) {
            case 5126:
                return value.length ? gl.uniform1fv(location, value) : gl.uniform1f(location, value); // FLOAT
            case 35664:
                return gl.uniform2fv(location, value); // FLOAT_VEC2
            case 35665:
                return gl.uniform3fv(location, value); // FLOAT_VEC3
            case 35666:
                return gl.uniform4fv(location, value); // FLOAT_VEC4
            case 35670: // BOOL
            case 5124: // INT
            case 35678: // SAMPLER_2D
            case 35680:
                return value.length ? gl.uniform1iv(location, value) : gl.uniform1i(location, value); // SAMPLER_CUBE
            case 35671: // BOOL_VEC2
            case 35667:
                return gl.uniform2iv(location, value); // INT_VEC2
            case 35672: // BOOL_VEC3
            case 35668:
                return gl.uniform3iv(location, value); // INT_VEC3
            case 35673: // BOOL_VEC4
            case 35669:
                return gl.uniform4iv(location, value); // INT_VEC4
            case 35674:
                return gl.uniformMatrix2fv(location, false, value); // FLOAT_MAT2
            case 35675:
                return gl.uniformMatrix3fv(location, false, value); // FLOAT_MAT3
            case 35676:
                return gl.uniformMatrix4fv(location, false, value); // FLOAT_MAT4
        }
    }

    compileShader() {
        const gl = this.gl

        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, this.vertex);
        gl.compileShader(vertexShader);
        if (gl.getShaderInfoLog(vertexShader) !== '') {
            console.warn(`${gl.getShaderInfoLog(vertexShader)}\nVertex Shader\n${addShaderLineNumbers(this.vertex)}`);
        }

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, this.fragment);
        gl.compileShader(fragmentShader);
        if (gl.getShaderInfoLog(fragmentShader) !== '') {
            console.warn(`${gl.getShaderInfoLog(fragmentShader)}\nFragment Shader\n${addShaderLineNumbers(this.fragment)}`);
        }

        // compile program and log errors
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);
        this.linked = true
        gl.useProgram(this.program)
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            console.warn(gl.getProgramInfoLog(this.program));
            return;
        }

        // Remove shader once linked
        // gl.deleteShader(vertexShader);
        // gl.deleteShader(fragmentShader);
    }
}

function addShaderLineNumbers(string: string) {
    let lines = string.split('\n');
    for (let i = 0; i < lines.length; i++) {
        lines[i] = i + 1 + ': ' + lines[i];
    }
    return lines.join('\n');
}
