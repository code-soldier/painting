import * as util from './util'

const { gl } = util

util.clear()

const textureOriginOff = drawOriginOff()

const textureBlur1 = getBlurTexture(textureOriginOff,[0,1])

drawCompare()

function getBlurTexture( texture:WebGLTexture,dir:number[]) {
    // const { texture:texture_out, frameBuffer } = util.bindFBO()
    const program = util.initProgram({
        vs:/* glsl */`
            attribute vec2 pos;
            attribute vec2 uv;
            varying vec2 frag_uv;
            void main() {
                gl_Position = vec4(pos,1,1);
                frag_uv = uv;
            }
        `,
        fs:/* glsl */`
            precision highp float;
            varying vec2 frag_uv;
            uniform sampler2D texture;
            uniform vec2 dir;
            uniform vec2 resolution;
            void main() {
                vec2 uv = frag_uv;
                if(texture2D(texture,uv).x>.8) {
                    gl_FragColor = vec4(0,1,1,1);
                }
            }
        `
    })
    util.setAttribute({
        program,
        name: 'pos',
        data: util.square.pos
    })
    util.setAttribute({
        program,
        name: 'uv',
        data: util.square.uv
    })
    util.setUniform({
        program,
        name: 'resolution',
        value: [util.w, util.h],
        type: gl.FLOAT_VEC2
    })
    util.setUniform({
        program,
        name: 'dir',
        value: dir,
        type: gl.FLOAT_VEC2
    })
    util.draw({program,count:util.square.drawCount})
    // return texture_out
}

function drawOriginOff() {
    const programBloom = util.initProgram({
        vs:/* glsl */`
        attribute vec2 pos;
        attribute vec2 uv;
        uniform mat3 mat;
        varying vec2 frag_uv;
        void main() {
            frag_uv = uv;
            gl_Position = vec4(mat*vec3(pos,1),1);
        }
    `,
        fs:/*glsl*/`
        precision highp float;
        // uniform sampler2D texture;
        varying vec2 frag_uv;
        void main() {
            gl_FragColor = vec4(vec3(1),1);
        }
    `
    })
    const mat1 = util.getTRS([0, 0], .1)
    util.setAttribute({
        program: programBloom,
        name: 'pos',
        data: util.square.pos,
    })
    util.setAttribute({
        program: programBloom,
        name: 'uv',
        data: util.square.uv,
    })
    util.setUniform({
        program: programBloom,
        name: 'mat',
        value: mat1,
        type: gl.FLOAT_MAT3
    })

    const { texture, frameBuffer } = util.bindFBO()
    util.draw({ count: util.square.drawCount, program: programBloom, frameBuffer })
    return texture
}


function drawCompare() {
    const programCompare = util.initProgram({
        vs:/* glsl */`
        attribute vec2 pos;
        uniform mat3 mat;
        void main() {
            gl_Position = vec4(mat*vec3(pos,1),1);
        }
    `,
        fs:/*glsl*/`
        precision highp float;
        uniform sampler2D texture;
        void main() {
            gl_FragColor = vec4(vec3(0),1);
        }
    `
    })
    const mat2 = util.getTRS([0, 0.5], .1)
    util.setAttribute({
        program: programCompare,
        name: 'pos',
        data: util.square.pos,
    })
    util.setUniform({
        program: programCompare,
        name: 'mat',
        value: mat2,
        type: gl.FLOAT_MAT3
    })


    util.draw({ count: util.square.drawCount, program: programCompare })
}



