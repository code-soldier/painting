import { ObjectGPU } from "./ObjectGPU";


export class Line extends ObjectGPU {

    constructor(params?: {
        data?: number[]
        index?: number[]
    }) {
        let { data, index } = params ?? {}
        data ??= [
            10, 0, 0,
            0, 10, 0,
            0, 0, 10,
            -10, 0, 0,
        ]
        index ??= [3, 0, 3, 1, 3, 2]
        super({
            paramsGPU: {
                model: {
                    data,
                    index,
                    vertexCount: data.length/3,
                    arrayStride: [3]
                },
                topology: 'line-list',
                wgsl: {
                    value: /* wgsl */`
                        @group(0) @binding(0) var<uniform> vpMat: mat4x4<f32>;
                        @group(0) @binding(1) var<uniform> modelMat : mat4x4<f32>;

                        struct Output {
                            @builtin(position) Position : vec4<f32>,
                        }

                        @vertex
                        fn v_main(
                            @location(0) position : vec4<f32>,
                        ) -> Output {
                            var output: Output;
                            output.Position = vpMat * modelMat * position;
                            return output;
                        }

                        @fragment
                        fn f_main() -> @location(0) vec4<f32> {
                            return vec4<f32>(1,1,1,1);
                        }
                    `
                }
            }
        })
    }
}