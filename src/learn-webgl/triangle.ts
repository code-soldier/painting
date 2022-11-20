import { gl, initProgram, setAttribute,draw, clear } from './util'

const vs = /* glsl */`
        attribute vec3 pos;
        attribute vec3 color;
        varying vec3 frag_color;
        void main() {
            gl_Position = vec4(pos,1.0);
            frag_color = color;
        }
`
const fs = /* glsl */`
        precision highp float;
        varying vec3 frag_color;
        void main() {
            gl_FragColor = vec4(frag_color,1);
        }
`
const program = initProgram({ vs, fs })
const program2 = initProgram({vs,fs})

const pos = [
    -1, -1, 0,
    1, -1, 0,
    0, 1, 0,
]
const pos2 = [
    0, -1, 0,
    2, -1, 0,
    1, 1, 0,
]
const color = [
    1, 0, 0,
    0, 1, 0,
    0, 0, 1,
]

// clear()

// setAttribute({
//     program,
//     data: pos,
//     name: 'pos'
// })
setAttribute({
    program,
    data: color,
    name: 'color'
})
// draw(3)

// setAttribute({
//     program:program2,
//     data: pos2,
//     name: 'pos'
// })
setAttribute({
    program:program2,
    data: color,
    name: 'color'
})
// draw(3)
// frame()
function frame() {
    requestAnimationFrame(frame)
    clear()

    setAttribute({
        program,
        data: pos,
        name: 'pos'
    })
    // setAttribute({
    //     program,
    //     data: color,
    //     name: 'color'
    // })
    draw(3)

    setAttribute({
        program: program2,
        data: pos2,
        name: 'pos'
    })
    // setAttribute({
    //     program: program2,
    //     data: color,
    //     name: 'color'
    // })
    draw(3)
}
