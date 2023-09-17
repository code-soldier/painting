import { mat4, quat, vec3 } from "gl-matrix"
import { Node } from "./node"
import { Renderer } from "./renderer"
import { Scene } from "./scene"
import { Camera } from "./camera"

enum Mouse {
    mouseLeft = 0
}

export abstract class Control {

    abstract init(): void

    abstract destroy(): void

    abstract update(): void
}

export class OrbitControl extends Control {

    elm: HTMLElement
    node: Node

    target: vec3
    quat: quat

    isMouseDown: boolean = false

    radius: number

    handleDown: Function
    handleMove: Function
    handleUp: Function

    constructor(
        public renderer: Renderer,
    ) {
        super()
        this.elm = renderer.canvas
        this.node = renderer.scene.camera
        this.target = vec3.create()
        this.quat = quat.create()
        this.radius = vec3.distance(this.node.postion, this.target)
        this.init()
    }

    init(): void {
        this.handleDown = this._handleDown.bind(this)
        this.handleMove = this._handleMove.bind(this)
        this.handleUp = this._handleUp.bind(this)
        this.elm.addEventListener('mousedown', this.handleDown as any)
        this.elm.addEventListener('mousemove', this.handleMove as any)
        this.elm.addEventListener('mouseup', this.handleUp as any)
    }

    update(): void {

    }
    destroy(): void {

    }
    _handleDown(e: MouseEvent) {
        this.isMouseDown = true
    }
    _handleMove(e: MouseEvent) {
        if (!this.isMouseDown) return

        // const rotationX = e.movementY
        // const rotationY = e.movementX
        // const {target,radius,node} = this
        // const x = target[0] + radius * Math.sin(rotationY) * Math.cos(rotationX);
        // const y = target[1] + radius * Math.sin(rotationX);
        // const z = target[2] + radius * Math.cos(rotationY) * Math.cos(rotationX);
        // node.setPositon({x,y,z})
        // node.lookAt(target, true)

        const deltaX = e.movementX
        const deltaY = e.movementY
        const deltaQuat = quat.create()
        quat.fromEuler(deltaQuat, deltaY, deltaX, 0)
        quat.multiply(this.quat, this.quat, deltaQuat)
        const modelMatrix = mat4.create();
        mat4.fromQuat(modelMatrix, this.quat);
        mat4.translate(modelMatrix, modelMatrix, [0, 0, -this.radius]);
        mat4.invert((this.node as Camera).viewMatrix, modelMatrix)

        this.renderer.render()
    }
    _handleUp(e: MouseEvent) {
        this.isMouseDown = false
    }
}