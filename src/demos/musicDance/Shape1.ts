import { Mat4, ObjectGPU } from "@/engine";

const A = 1
const DELTA = 2

export class Shape1 extends ObjectGPU {

    frequencyData: Uint8Array

    modelMats: Mat4[]

    constructor(frequencyData:Uint8Array,center = {x:0,y:0,z:0}){
        super({
            paramsGPU: {
                instanceNum: frequencyData.length
            }
        })
        this.onRenderCb = this.frame;
        this.modelMats = []
        this.frequencyData = frequencyData
        const left = -(frequencyData.length/2 * DELTA)
        this.frequencyData.forEach((v:number,i:number) => {
            const mat4 = new Mat4()
            mat4.elements[12] = left + i * DELTA
            this.modelMats.push(mat4)
        })
    }

    frame() {
        this.modelMatsData = []
        this.modelMats.forEach((v:Mat4,i:number) => {
            v.elements[13] = this.frequencyData[i]/5
            this.modelMatsData.push(...v.elements)
        })
        this.isInstanceBufferNeedChange = true
    }
}