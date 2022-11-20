import { gl, initProgram, setAttribute, draw, clear, fs,vs,getTRS, setUniform } from './util'

clear()

const program = initProgram({ vs, fs })

const pos = [
    -1, -1,
    1, -1, 
    0, 1,
    -1, 1,
    -1, -1,
    0, 0,
]
setAttribute({
    program,
    data: pos,
    name: 'pos',
})

const trs = getTRS()

frame()
function frame() {
    // requestAnimationFrame(frame)
    clear()

    trs[6] += 0.005
    if(trs[6]>1) trs[6]=-1

    setUniform({
        program,
        value: trs,
        type: gl.FLOAT_MAT3,
        name: 'TRSMat'
    })
    draw({count:3,})
}
