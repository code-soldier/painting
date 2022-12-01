import * as util from './util'

util.clear()

const vertexData = [
    -1, 1,
    1, 1,
    1, -1,
    1, -1,
    -1, -1,
    -1, 1,
]
const uv = [
    0, 1,
    1, 1,
    1, 0,
    1, 0,
    0, 0,
    0, 1,
]
const indices = [0, 1, 2, 2, 3, 0]

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
        uniform float time;
        varying vec2 frag_uv;
        void main() {
            vec2 center = vec2(0,0);
            vec2 uv = frag_uv-0.5;
            float strength = abs(.5*sin(time*0.001));
            strength = .9;
            float range = .9;

            float dist = distance(uv,center);
            vec2 dir = normalize(uv-center);
            float scale = 1.+strength*(smoothstep(0.,1.,dist/range)-1.);
            float newDist = dist*scale;
            vec2 newUv = center+newDist*dir;

            gl_FragColor = texture2D(texture,newUv+.5);
        }
    `,
})
const image = await util.loadImg('src/assets/img/cat.jpg')
util.setTexture({
    program,
    image,
    unifName: 'texture'
})
// util.setIndices(indices)

frame(0)
function frame(t: number) {
    // requestAnimationFrame(frame)

    util.setAttribute({
        program,
        data: vertexData,
        name: 'pos'
    })
    util.setAttribute({
        program,
        data: uv,
        name: 'uv'
    })
    util.setUniform({
        program,
        value: t,
        name: 'time',
    })

    util.draw({ count: 6, isIndex: false })
}