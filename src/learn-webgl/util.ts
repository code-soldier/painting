const canvas = document.querySelector('canvas') ?? document.createElement('canvas')
canvas.style.display = 'block'
canvas.width = innerWidth
canvas.height = innerHeight
document.body.appendChild(canvas)

export const w = canvas.width
export const h = canvas.height

export const gl = canvas.getContext('webgl2', {})

export function initProgram(params?: { vs?: string, fs?: string }) {
    const { fs = defaultFS, vs = defaultVS } = params ?? {}

    const program = gl.createProgram()

    const vertex = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vertex, vs)
    gl.compileShader(vertex)
    if (gl.getShaderInfoLog(vertex)) {
        console.log('顶点着色器编译失败：', gl.getShaderInfoLog(vertex));
    }
    gl.attachShader(program, vertex)

    const fragment = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fragment, fs)
    gl.compileShader(fragment)
    if (gl.getShaderInfoLog(fragment)) {
        console.log('片元着色器编译失败：', gl.getShaderInfoLog(fragment));
    }
    gl.attachShader(program, fragment)

    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log('program链接失败：', gl.getProgramInfoLog(program));
    }
    gl.useProgram(program)

    return program
}

export function setAttribute({
    program,
    data,
    name,
    size = 2,
    divisor = 0,
}: {
    program: WebGLProgram,
    data: number[],
    name: string,
    size?: number,
    divisor?: number,
}) {
    gl.useProgram(program)
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(program, name)
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(loc)

    gl.vertexAttribDivisor(loc, divisor)
}

export function setUniform({ program, name, value, type }: { program: WebGLProgram, name: string, value: any, type?: number }) {
    gl.useProgram(program)
    const loc = gl.getUniformLocation(program, name)
    switch (type) {
        case gl.FLOAT: value.length ? gl.uniform1fv(loc,value) : gl.uniform1f(loc, value); break;
        case gl.INT: gl.uniform1i(loc, value); break;
        case gl.FLOAT_VEC2: gl.uniform2fv(loc, value); break;
        case gl.FLOAT_MAT3: gl.uniformMatrix3fv(loc, false, value); break;
    }
}

export function setIndices(data: number[]) {
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)
}

export function clear() {
    gl.viewport(0, 0, innerWidth, innerHeight)
    gl.clearColor(0.0, 0.0, 0.0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
}


export function draw({
    count,
    mode = gl.TRIANGLES,
    instancedCount = 1,
    isIndex = false,
    program,
    vao,
    frameBuffer,
}: {
    count: number,
    mode?: GLenum,
    instancedCount?: number,
    isIndex?: boolean,
    program?: WebGLProgram
    vao?: WebGLVertexArrayObject,
    frameBuffer?: WebGLFramebuffer
}) {
    frameBuffer && gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)
    program && gl.useProgram(program)
    vao && gl.bindVertexArray(vao)
    if (instancedCount == 1) {
        if (isIndex) {
            gl.drawElements(mode, count, gl.UNSIGNED_BYTE, 0)
        } else {
            gl.drawArrays(mode, 0, count)
        }
    } else {
        gl.drawArraysInstanced(mode, 0, count, instancedCount)
    }
    frameBuffer && gl.bindFramebuffer(gl.FRAMEBUFFER, null)
}

export function setTexture({
    image,
    program,
    unifName,
    filpY = true,
    textureUnit = gl.TEXTURE0,
    target = gl.TEXTURE_2D,
    minFilter = gl.LINEAR,
    level = 0,
    type = gl.UNSIGNED_BYTE,
    format = gl.RGB,
    internalFormat = gl.RGB,
    width,
    height,
}: Partial<{
    filpY: boolean
    textureUnit: number
    target: number
    minFilter: number
    level: number
    format: number
    internalFormat: number
    type: number
    width: number
    height: number
}> & {
    image?: HTMLImageElement,
    unifName?: string
    program?: WebGLProgram,
}
) {
    const texture = gl.createTexture()

    gl.activeTexture(textureUnit)

    gl.bindTexture(target, texture)

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, filpY);

    gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, minFilter)

    if (image) {
        gl.texImage2D(target, level, internalFormat, format, type, image)
        setUniform({
            program,
            name: unifName,
            value: 0,
            type: gl.INT,
        })
    } else {
        gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null)
    }

    return texture
}

export async function loadImg(src: string): Promise<HTMLImageElement> {
    return new Promise(r => {
        const image = new Image()
        image.src = src
        image.onerror = err => console.log(err);
        image.onload = () => r(image)
    })
}

export function getTRS(pos = [0, 0], scale = 0.1) {
    return [
        scale, 0, 0,
        0, scale, 0,
        pos[0], pos[1], 1,
    ]
}

export function bindFBO() {
    const texture = setTexture({
        width: w,
        height: h,
    })

    const frameBuffer = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)

    const renderBuffer = gl.createRenderbuffer()
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer)
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h)

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderBuffer)

    return { texture, frameBuffer }

}

export function bindVAO() {
    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)
    return vao
}

export const square = {
    pos: [
        -1, 1,
        1, 1,
        1, -1,
        1, -1,
        -1, -1,
        -1, 1,
    ],
    uv: [
        0, 1,
        1, 1,
        1, 0,
        1, 0,
        0, 0,
        0, 1,
    ],
    drawCount: 6,
}

export const triangle = {
    pos: [
        0, 1,
        -1, -1,
        1, -1,
    ],
    uv: [
        0, 0,
        1, 0,
        0, 1,
    ],
    drawCount: 3,
}

export const defaultVS = /* glsl*/`
                attribute vec2 pos;
                void main() {
                    gl_Position = vec4(pos,0,1);
                }
            `
export const defaultFS = /* glsl*/`
                precision highp float;
                void main() {
                    gl_FragColor = vec4(0,1,1,1);
                }
            `

function getGaussionWeights(radius: number = 10, sigma: number = 1) {
    //采样点个数为半径+1的平方
    //方差越小越平均，越接近期望值，曲线越陡
    const gaussian = (x: number, sigma: number) => Math.exp(x ** 2 / sigma ** 2 * -0.5) / (Math.sqrt(2 * Math.PI) * sigma)
    return Array(radius).fill(0).map((_, i) => gaussian(i, sigma))
}