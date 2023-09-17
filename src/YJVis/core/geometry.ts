import { buildBox } from "./polyData"

export type Model = Record<string, Partial<Attibute>>

export type Attibute = {
    name: string,
    size: number,
    data: number[] | Float32Array | Uint16Array | Uint32Array,
    stride: number
    offset: number
    isInstance: boolean // 实例化的数据是给每个实例，而不是每个顶点
    isIndex: boolean // 特殊的数据，不需要传递给着色器
}
export class Geometry {
    attributes: Record<string, Attibute>
    indexAttribute: Attibute
    instanceAttributes: Record<string, Attibute>
    packedData: Float32Array
    packedStride: number = 0
    drawCount: number

    model: Model

    constructor() {
        this.model = buildBox() as Model

        let offset = 0
        this.attributes = {}
        Object.keys(this.model).map(k => {
            const { size = 3, data, isIndex = false, isInstance = false } = this.model[k]
            if(isIndex || isInstance) return
            const attr: Attibute = {
                name: k,
                size,
                data,
                offset,
                stride: 0,
                isIndex,
                isInstance
            }
            if (!(isIndex || isInstance)) {
                offset += size
                this.packedStride += size
            }
            this.attributes[k] = attr
        })
        const pos = this.attributes['position']
        this.drawCount = pos.data.length / pos.size
        this.packedData = new Float32Array(this.drawCount*this.packedStride)
        for (let i = 0; i < this.drawCount; i++) {
            Object.values(this.attributes).forEach((attr) => {
                for (let j = 0; j < attr.size; j++) {
                    this.packedData[i * this.packedStride + attr.offset + j] = attr.data[i * attr.size + j]
                }
            })
        }

        if(this.model['index']){
            const { size = 1, data, isIndex = false } = this.model['index']
            this.indexAttribute = {
                name: 'index',
                size,
                data,
                offset: 0,
                stride: 0,
                isIndex: true,
                isInstance: false
            }
            this.drawCount = data.length;
        }
    }

}