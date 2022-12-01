import { gl, initProgram, setAttribute,draw, clear } from './util'

const vs = /* glsl */`
        attribute vec3 pos;
        void main() {
            gl_Position = vec4(pos,1.0);
        }
`
const fs = /* glsl */`
        void main() {
            gl_FragColor.xyz = vec3(1,0,0);
        }
`
const program = initProgram({ vs, fs })

const pos = [
    -1, -1,
    1, -1,
    0, 1,
]

clear()

setAttribute({
    program,
    data: pos,
    name: 'pos'
})
draw({count:3})

