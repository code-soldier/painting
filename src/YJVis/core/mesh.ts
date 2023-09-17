import { Geometry } from "./geometry";
import { Material } from "./material";
import { Node } from "./node";

export class Mesh extends Node {

    material: Material
    geometry: Geometry

    constructor() {
        super()
        this.material = new Material()
        this.geometry = new Geometry()
    }
}