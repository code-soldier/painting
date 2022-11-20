import { draw, gl, initProgram, setAttribute, setUniform, setTexture } from './util'
import * as util from './util'

const program = initProgram({
    vs:/*glsl*/`
        attribute vec4 pos;
        attribute vec2 uv_;
        varying vec2 uv;
        void main() {
            gl_Position = pos;
            uv = uv_;
        }
    `,
    fs:/* glsl */`
        precision highp float;
        uniform sampler2D sp;
        uniform vec2 resolution;
        varying vec2 uv;

        float gaussian(vec2 p,float sigma) {
            float fangCha = sigma*sigma;
            return exp( ( p.x*p.x+p.y*p.y ) / fangCha * (-0.5) ) / ( 6.28 * fangCha );
        }

        vec3 blur(vec2 uv,vec2 resolution,sampler2D sp) {
            vec3 color = vec3(0);
            float a = 20.;
            const float sampleNum = 400.;
            float sigma = 5.;
            vec2 scale = 1./resolution.xy;
            for(float i=0.;i<sampleNum;i+=1.){
                vec2 p = vec2(mod(i,a),i/a)-a/2.;
                float weight = gaussian(p,sigma);
                color += weight * texture2D(sp, uv+p*scale).rgb;
            }
            return color;
        }

        void main() {
            // gl_FragColor = vec4(blur(uv,resolution,sp),1.0);
            gl_FragColor = texture2D(sp,uv);
        }
    `
})

setAttribute({
    program,
    name: 'pos',
    data: [
        -1, 1,
        -1, -1,
        1, 1,
        1, -1,
    ],
    size: 2,
})
setAttribute({
    program,
    name: 'uv_',
    size: 2,
    data: [
        0, 1,
        0, 0,
        1, 1,
        1, 0,
    ]
})

setUniform({
    program,
    name: 'resolution',
    value: [innerWidth, innerHeight],
    type: gl.FLOAT_VEC2,
})

const image = await util.loadImg('src/assets/img/cat.jpg')
setTexture({
    program,
    unifName: 'sp',
    image  
})

draw({ count: 4, mode: gl.TRIANGLE_STRIP })