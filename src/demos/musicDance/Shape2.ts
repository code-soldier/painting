import { Line } from "@/engine";

const R = 10
const DELTA = 2

export class Shape2 extends Line {

    frequencyData: Uint8Array
    data: number[]
    triangleFun: Array<{cos:number,sin:number}> = []

    constructor(frequencyData: Uint8Array, center = { x: 0, y: 0, z: 0 }) {
        const data = new Array(frequencyData.length * 3 * 2).fill(0)
        const triangleFun = []
        const index = []
        const theta = Math.PI*2/frequencyData.length
        frequencyData.forEach((v:number,i:number)=> {
            triangleFun.push({
                cos: Math.cos(theta * i),
                sin: Math.sin(theta * i)
            })
            const step = i*2
            if(i!=frequencyData.length-1){
               index.push(
                    step,step+1,
                    step,step+2,
                    step+1,step+3,
                )
            } else {
                index.push(
                    step,step+1,
                    step,0,
                    step+1,1
                )
            }
        })     
        super({
            data,
            index
        })
        this.onRenderCb = this.frame
        this.data = data
        this.triangleFun = triangleFun
        this.frequencyData = frequencyData
    }

    frame() {
        this.triangleFun.forEach((v,i:number)=>{
            const ratio = this.frequencyData[i] / 255
            const avg = this.frequencyData.reduce((p,c)=>p+c)/this.frequencyData.length
            const change = ratio * DELTA
            const R_ = R * (0.6 + 0.6 * (avg/255))
            const x1 = v.cos*(R_+change),y1 = v.sin*(R_+change)
            const x2 = v.cos*(R_-change),y2 = v.sin*(R_-change)
            const data = this.data
            const step = i*6
            data[step] = x1
            data[step+1] = y1
            data[step+3] = x2
            data[step+4] = y2
        })
        this.model.isChange = true
    }
}