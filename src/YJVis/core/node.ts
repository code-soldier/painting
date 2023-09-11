import { mat4, vec3, quat } from "gl-matrix"

const _xAxis = vec3.fromValues(1, 0, 0)
const _yAxis = vec3.fromValues(0, 1, 0)
const _zAxis = vec3.fromValues(0, 0, 1)

const _v = vec3.create()
const _q = quat.create()
const _m = mat4.create()

export class Node {

    children?: Node[]
    parent?: Node

    matirx: mat4
    worldMatrix: mat4

    matrixShouldChanged: boolean = false

    up: vec3

    protected postion: vec3
    protected scale: vec3
    protected quatation: quat


    constructor() {
        this.postion = vec3.create()
        this.scale = vec3.fromValues(1, 1, 1)
        this.quatation = quat.create()
        this.matirx = mat4.identity(new Float32Array(16))
        this.worldMatrix = mat4.identity(new Float32Array(16))
        this.up = vec3.fromValues(0, 1, 0)
    }

    setPositon({ x, y, z }: { x?: number, y?: number, z?: number }) {
        if (x) this.postion[0] = x
        if (y) this.postion[1] = y
        if (z) this.postion[2] = z
        this.matrixShouldChanged = true
    }

    translateOnAxis(axis: vec3, distance: number) {
        vec3.transformQuat(_v, axis, this.quatation)
        vec3.scale(_v, _v, distance)
        vec3.add(this.postion, this.postion, _v)
        this.matrixShouldChanged = true
    }

    translate({ dx, dy, dz }: { dx?: number, dy?: number, dz?: number }) {
        if (dx) this.translateOnAxis(_xAxis, dx)
        if (dy) this.translateOnAxis(_yAxis, dy)
        if (dz) this.translateOnAxis(_zAxis, dz)
    }


    setRotation({ x, y, z }: { x?: number, y?: number, z?: number }) {

    }

    rotateOnAxis(axis: vec3, angle: number) {
        quat.setAxisAngle(_q, axis, angle)
        quat.multiply(this.quatation, this.quatation, _q)
        this.matrixShouldChanged = true
    }

    rotateOnWorldAxis(axis: vec3, angle: number) {
        quat.setAxisAngle(_q, axis, angle)
        quat.multiply(this.quatation, _q, this.quatation)
        this.matrixShouldChanged = true
    }

    rotate({ dx, dy, dz }: { dx?: number, dy?: number, dz?: number }) {
        if (dx) this.rotateOnAxis(_xAxis, dx)
        if (dy) this.rotateOnAxis(_yAxis, dy)
        if (dz) this.rotateOnAxis(_zAxis, dz)
    }

    lookAt(target: vec3, isCamera = false) {
        if (!isCamera) mat4.targetTo(this.matirx, this.postion, target, this.up)
        else mat4.targetTo(this.matirx, target, this.postion, this.up)
        mat4.getRotation(this.quatation, this.matirx)
    }

    updateMatrix() {
        mat4.fromRotationTranslationScale(this.matirx, this.quatation, this.postion, this.scale)
        this.matrixShouldChanged = false
    }

    // 每次渲染都遍历一遍节点树，以此更新本地矩阵，而不是调用旋转方法后立即更新
    // TODO: 待优化
    updateWorldMatrix() {
        if (this.matrixShouldChanged) {
            this.updateMatrix()
        }
        this.worldMatrix = this.parent ? mat4.multiply(this.worldMatrix, this.parent.worldMatrix, this.matirx) : this.matirx

        this.children?.forEach((v) => {
            v.updateWorldMatrix()
        })
    }

    public add(child: Node) {
        this.children ??= []
        this.children.push(child)
        child.parent = this
    }
}