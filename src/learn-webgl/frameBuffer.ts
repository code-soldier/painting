import * as util from './util'

const { gl } = util

const programOffScreen = util.initProgram({
    vs:/* glsl*/`
            attribute vec2 pos;
            attribute vec2 uv;
            varying vec2 frag_uv;
            void main() {
                frag_uv = uv;
                gl_Position = vec4(pos,0,1);
            }
        `,
    fs:/* glsl*/`
            precision highp float;
            uniform vec2 iResolution;
            varying vec2 frag_uv;
            void main() {
                vec2 uv = frag_uv;
                float td = 30.;
                float lineWidth = 2.;
                float x = fract((uv.x*iResolution.x)/td)*td;
                float y = fract((uv.y*iResolution.y)/td)*td;
                if(x<lineWidth || y<lineWidth){
                    gl_FragColor = vec4(vec3(.5),1);
                }else{
                    gl_FragColor = vec4(vec3(.8),1);
                }
            }
        `,
})

const program = util.initProgram({
    vs:/* glsl*/`
                attribute vec2 pos;
                attribute vec2 uv;
                varying vec2 frag_uv;
                void main() {
                    frag_uv = uv;
                    gl_Position = vec4(pos,0,1);
                }
            `,
    fs:/* glsl*/`
                precision highp float;
                uniform sampler2D texture;
                varying vec2 frag_uv;
                void main() {
                    vec2 uv = frag_uv;

                    gl_FragColor = texture2D(texture,uv);
                }
            `,
})


const vaoOffs = util.bindVAO()
util.setAttribute({
    program: programOffScreen,
    data: util.square.pos,
    name: 'pos'
})
util.setAttribute({
    program: programOffScreen,
    data: util.square.uv,
    name: 'uv'
})
util.setUniform({
    program: programOffScreen,
    value: [util.w, util.h],
    name: 'iResolution',
    type: gl.FLOAT_VEC2,
})
const { texture, frameBuffer } = util.bindFBO()
util.draw({ count: util.square.drawCount, program: programOffScreen, vao: vaoOffs, frameBuffer })

const vao = util.bindVAO()
util.setAttribute({
    program,
    name: 'pos',
    data: util.triangle.pos
})
util.setAttribute({
    program,
    name: 'uv',
    data: util.triangle.uv
})
util.setUniform({
    program,
    name: 'texture',
    value: texture,
    type: gl.INT,
})

frame(0)
async function frame(t: number) {
    requestAnimationFrame(frame)
    util.clear()

    util.draw({ count: util.triangle.drawCount, program, vao, })

}