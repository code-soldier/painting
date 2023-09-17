import { OrbitControl } from '../core'
import * as y from '../index'

const mesh = new y.Mesh()

const scene = new y.Scene()
scene.camera.setPositon({z: -10})
scene.camera.lookAt([0,0,0])

scene.add(mesh)

const renderer = new y.Renderer()
renderer.scene = scene

const orbit = new OrbitControl(renderer)

const frame = ()=> {
    // mesh.rotate({dy: 0.01})
    renderer.render()
    // window.requestAnimationFrame(frame)
}

window.requestAnimationFrame(frame)

console.log(renderer)