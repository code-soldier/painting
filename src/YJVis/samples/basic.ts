import * as y from '../index'

const mesh = new y.Mesh()

const scene = new y.Scene()
scene.camera.setPositon({z: 10})

scene.add(mesh)

const renderer = new y.Renderer()


const frame = ()=> {
    renderer.render(scene)
    window.requestAnimationFrame(frame)
}

window.requestAnimationFrame(frame)