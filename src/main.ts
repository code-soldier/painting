
const script = document.createElement('script')
const srcs1 = {
    0: './src/demos/firework/index.ts',
    1: './src/demos/musicDance/index.ts'
}
const srcs2 = {
    0: `./src/learn-webgpu/demo-basic.ts`
}

script.src = srcs2[0]
script.type = 'module'
document.body.appendChild(script)