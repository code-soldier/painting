import { importImg } from "@/common/util";
import { Renderer, Scene, Cube, SkyBox, AxesHelper, Fly1Control, OrbitControl, Mat4, Vec3, Camera } from "@/engine";
import { Player } from './Player'
import { Shape1 } from './Shape1'
import { Shape2 } from './Shape2'

let renderer: Renderer, scene: Scene, camera: Camera
renderer = new Renderer()
await renderer.init()
document.body.appendChild(renderer.canvas)
scene = new Scene()
camera = new Camera({
    position: { x: 0, y: 1, z: 100 },
})
// scene.attachControl(new Fly1Control(camera,renderer.canvas))
scene.attachControl(new OrbitControl(camera, renderer.canvas))
// scene.add(new AxesHelper())
const skyBox = new SkyBox({
    imgs: importImg(),
    size: 10000,
})
scene.add(skyBox)


const player = new Player()
document.body.appendChild(player.UIContainer)

scene.add(new Shape1(player.frequencyData))
// scene.add(new Shape2(player.frequencyData))

// scene.add(new Cube())



const debug = !true
const delta = 1/50
async function frame() {

    renderer.render(scene, camera)
    player.analyserNode?.getByteFrequencyData(player.frequencyData)

    if (debug) {

        await new Promise(r => {
            setTimeout(() => {
                r(0)
            }, 3000)
        })
    }

    window.requestAnimationFrame(frame)
}

frame()

renderer.render(scene, camera)
