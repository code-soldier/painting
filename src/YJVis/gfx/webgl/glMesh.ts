import { Mesh, Node, Scene } from "@/YJVis/core";
import vs from './template_vertex.glsl?raw'
import fs from './template_fragment.glsl?raw'
import { buildBox } from "@/YJVis/core/polyData";
import { mat4 } from "gl-matrix";


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
    program: WebGLProgram
    gl: WebGL2RenderingContext
    vao: WebGLVertexArrayObject
    uniforms: Record<string, Uniform>
    vertex: string
    fragment: string
    linked: boolean = false

    packedBuffer: WebGLBuffer
    indexBuffer: WebGLBuffer

    scene: Scene // 为了拿到相机和灯光


    constructor(props: {
        gl: WebGL2RenderingContext
        renderable: Mesh
        scene: Scene
    }) {
        const { gl, renderable, scene } = props
        this.gl = gl
        this.renderable = renderable
        this.scene = scene
        this.program = gl.createProgram();
    }

    render() {
        this.updateShader()
        this.updateAttribute()
        this.updateUniform()
        this.draw()
    }

    draw() {
        const gl = this.gl
        gl.enable(this.gl.DEPTH_TEST);
        gl.depthMask(true);
        const geometry = this.renderable.geometry
        if (geometry.indexAttribute) {
            gl.drawElements(gl.TRIANGLES, geometry.drawCount, gl.UNSIGNED_SHORT, 0)
        } else {
            gl.drawArrays(gl.TRIANGLES, 0, this.renderable.geometry.drawCount)
        }

    }

    updateShader() {
        if (this.linked) this.gl.useProgram(this.program)
        if (!this.vertex) {
            this.vertex = vs
            this.fragment = fs
            this.compileShader()
        }
    }

    updateAttribute() {
        const gl = this.gl
        const geometry = this.renderable.geometry
        if (!this.packedBuffer) {
            this.vao = this.gl.createVertexArray()
            gl.bindVertexArray(this.vao)


            this.packedBuffer = gl.createBuffer()
            gl.bindBuffer(gl.ARRAY_BUFFER, this.packedBuffer)
            gl.bufferData(gl.ARRAY_BUFFER, geometry.packedData, gl.STATIC_DRAW)
            Object.values(geometry.attributes).forEach((attr) => {
                const loc = gl.getAttribLocation(this.program, attr.name)
                gl.enableVertexAttribArray(loc)
                gl.vertexAttribPointer(loc, attr.size, gl.FLOAT, false, geometry.packedStride * Float32Array.BYTES_PER_ELEMENT, attr.offset * Float32Array.BYTES_PER_ELEMENT)
                // gl.vertexAttribDivisor(loc, 1)
            })

        }

        if (!this.indexBuffer && geometry.indexAttribute) {
            this.indexBuffer = gl.createBuffer()
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indexAttribute.data as Uint16Array, gl.STATIC_DRAW)
        }

        gl.bindVertexArray(this.vao)
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

            // this.uniforms.dirLightIntensity.value = 1
            // this.uniforms.dirLightColor.value = [1, 1, 1]
            // this.uniforms.dirLightDir.value = [1, 1, 1] // 相机的正方向

        }
        this.uniforms.modelViewMatrix.value = mat4.multiply(mat4.create(), this.scene.camera.viewMatrix, this.renderable.worldMatrix)
        this.uniforms.projectionMatrix.value = this.scene.camera.projectionMatrix
        Object.values(this.uniforms).forEach(uniform => {
            this.setUniform(uniform.activeInfo.type, uniform.location, uniform.value)
        })
    }

    setUniform(type: GLenum, location: WebGLUniformLocation, value: any) {
        const gl = this.gl
        switch (type) {
            case gl.FLOAT:
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
            case gl.FLOAT_MAT4:
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
