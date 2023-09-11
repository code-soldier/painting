import { Geometry } from "./geometry";
import { Material } from "./material";
import { Node } from "./node";

export class Mesh extends Node {

    public material: Material
    public geometry: Geometry

    constructor() {
        super()
    }
}