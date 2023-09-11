import { Mesh } from "@/YJVis/core";

export class GPUMesh{

    renderable: Mesh

    vertexBuffer: GPUBuffer
    indexBuffer: GPUBuffer
    modelMatrixBuffer: GPUBuffer

    rpl: GPURenderPipeline
    bgp: GPUBindGroup

    draw(){

    }
}