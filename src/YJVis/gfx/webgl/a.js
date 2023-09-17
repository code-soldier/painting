const canvas = document.createElement('canvas')
canvas.width = innerWidth * window.devicePixelRatio
canvas.height = innerHeight * window.devicePixelRatio
// canvas.clientWidth = innerHeight
// canvas.clientWidth = innerWidth
Object.assign(canvas.style, {
    width: innerWidth + 'px',
    height: innerHeight + 'px',
});
document.body.appendChild(canvas)
canvas.style.display = 'block'

const gl = canvas.getContext('webgl2')

const vs = /* glsl */`
            attribute vec3 position;

            uniform mat4 modelViewMatrix;
            uniform mat4 projectionMatrix;

            void main() {
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `

const fs = /* glsl */`
            void main() {
                gl_FragColor = vec4(1.0);
            }
        `

const program = gl.createProgram()
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vs);
gl.compileShader(vertexShader);
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fs);
gl.compileShader(fragmentShader);
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program)

const modelViewMatrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -10, 1])
const loc_u1 = gl.getUniformLocation(program, 'modelViewMatrix')
gl.uniformMatrix4fv(loc_u1, false, modelViewMatrix)
const projectionMatrix = new Float32Array([1.7925909757614136, 0, 0, 0, 0, 1.7925909757614136, 0, 0, 0, 0, -1.0002000331878662, -1, 0, 0, -0.20002000033855438, 0])
const loc_u2 = gl.getUniformLocation(program, 'projectionMatrix')
gl.uniformMatrix4fv(loc_u2, false, projectionMatrix)

const position = new Float32Array([0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5])
const buffer_pos = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, buffer_pos)
gl.bufferData(gl.ARRAY_BUFFER, position, gl.STATIC_DRAW)
const loc_a1 = gl.getAttribLocation(program, 'position')
gl.enableVertexAttribArray(loc_a1)
gl.vertexAttribPointer(loc_a1, 3, gl.FLOAT, false, 0, 0)

const index = new Uint16Array([0, 2, 1, 2, 3, 1, 4, 6, 5, 6, 7, 5, 8, 10, 9, 10, 11, 9, 12, 14, 13, 14, 15, 13, 16, 18, 17, 18, 19, 17, 20, 22, 21, 22, 23, 21])
const buffer_index = gl.createBuffer()
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer_index)
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index, gl.STATIC_DRAW)

function frame() {

    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clearColor(0.0, 0.0, 0.0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0)
}

frame()


