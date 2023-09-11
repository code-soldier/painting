
const script = document.createElement('script')
const srcs1 = {
    0: './src/demos/firework/index.ts',
    1: './src/demos/musicDance/index.ts'
}
const srcs2 = {
    0: `./src/learn-webgpu/demo-basic.ts`,
    1: `./src/learn-webgpu/fbo.ts`
}
const srcs3 = {
    0: './src/YJVis/samples/basic.ts'
}

script.src = srcs3[0]
script.type = 'module'
document.body.appendChild(script)