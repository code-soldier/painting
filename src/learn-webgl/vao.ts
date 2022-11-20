import * as util from './util'

const { gl } = util

const program1 = util.initProgram({
    vs:/* glsl*/`
                attribute vec2 pos;
                uniform mat3 mat;
                void main() {
                    gl_Position = vec4(mat*vec3(pos,1),1);
                }
            `,
    fs: /* glsl*/`
                precision highp float;
                void main() {
                    gl_FragColor = vec4(0,1,1,1);
                }
            `
})
const program2 = util.initProgram({
    vs:/* glsl*/`
                attribute vec2 pos;
                uniform mat3 mat;
                void main() {
                    gl_Position = vec4(mat*vec3(pos,1),1);
                }
            `,
    fs: /* glsl*/`
                precision highp float;
                void main() {
                    gl_FragColor = vec4(0,1,1,1);
                }
            `
})

const mat1 = util.getTRS([0, 0], 1)
const mat2 = util.getTRS([0, 0], 0.9)

gl.useProgram(program1)
const vao1 = util.bindVAO()
util.setAttribute({
    program: program1,
    name: 'pos',
    data: util.triangle.pos
})
util.setUniform({
    program: program1,
    name: 'mat',
    value: mat1,
})

gl.useProgram(program2)
const vao2 = util.bindVAO()
util.setAttribute({
    program: program2,
    name: 'pos',
    data: util.square.pos
})
util.setUniform({
    program: program2,
    name: 'mat',
    value: mat2,
})

frame()
function frame() {
    requestAnimationFrame(frame)

    util.draw({ count: util.triangle.drawCount, program: program1, vao: vao1 })

    util.draw({ count: util.square.drawCount, program: program2, vao: vao2 })
}