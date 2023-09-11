import { Camera } from "./camera";
import { Light } from "./light";
import { Node } from "./node";

export class Scene extends Node {
    
    camera: Camera
    light: Light

    constructor() {
        super()
        this.camera = new Camera()
        this.light = new Light()
        this.camera.add(this.light) // "头灯"，绑定到相机的平行光
    }
    
}