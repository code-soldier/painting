import { Node } from "./node";
import { mat4, vec3 } from "gl-matrix";

export type CameraProps = {
    near: number;
    far: number;
    fov: number;
    aspect: number;
    left: number;
    right: number;
    bottom: number;
    top: number;
    isPerspective: boolean
};

export class Camera extends Node {
    projectionMatrix: mat4
    viewMatrix: mat4

    // projectionMatrixChanged: boolean = false
    // viewMatrixChanged: boolean = false

    isPerspective: boolean
    near: number;
    far: number;
    fov: number;
    aspect: number;
    left: number;
    right: number;
    bottom: number;
    top: number;
    zoom: number;

    constructor({ near = 0.1, far = 1000, fov = 45, aspect = 1, left = -1, right = 1, bottom = 1, top = -1, isPerspective = true }: Partial<CameraProps> = {}) {
        super()
        Object.assign(this, { near, far, fov, aspect, left, right, bottom, top });
        this.projectionMatrix = mat4.identity(new Float32Array(16))
        this.viewMatrix = mat4.identity(new Float32Array(16))
        this.setPerspective(isPerspective)
    }

    updateViewMatrix(){
        mat4.invert(this.viewMatrix, this.worldMatrix)
    }

    setPerspective(isPerspective: boolean) {
        this.isPerspective = isPerspective
        if (!isPerspective) {
            mat4.ortho(this.projectionMatrix, this.left, this.right, this.bottom, this.top, this.near, this.far)
        } else {
            mat4.perspective(this.projectionMatrix, this.fov, this.aspect, this.near, this.far)
        }
    }

    lookAt(target: vec3) {
        super.lookAt(target, true)
    }
}