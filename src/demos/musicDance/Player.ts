type Music = {
    name: string,
    url: string,
    id: string,
}

export class Player {

    ctx: AudioContext
    analyserNode: AnalyserNode
    audio: HTMLAudioElement

    isPlay  = false

    frequencyData: Uint8Array

    list: Music[]
    music: Music

    UIContainer = document.createElement('div')


    constructor(size = 64) {
        this.frequencyData = new Uint8Array(size)
        this.fetchDouYinMusics()
    }

    createAudioContex() {
        this.ctx = new AudioContext()
        this.audio = document.createElement('audio')
        this.audio.loop = true
        this.analyserNode = this.ctx.createAnalyser()
        this.analyserNode.fftSize = this.frequencyData.length*2
        const source = this.ctx.createMediaElementSource(this.audio)
        source.connect(this.analyserNode).connect(this.ctx.destination)
    }

    async start(music:Music) {
        this.ctx ?? this.createAudioContex()
        this.audio.pause()
        this.music = music
        this.isPlay = true
        this.audio.src = await this.getLocalUrl(music.url)
        this.audio.play()
    }

    pause() {
        this.audio.pause()
        this.isPlay = false
    }

    resume() {
        this.audio.play()
        this.isPlay = true
    }

    // 以blob格式请求音乐资源，转化为本地url，analyser节点只能分析同源音频
    getLocalUrl(url: string): Promise<string>  {
        return new Promise((resolve, reject) => {
            fetch(url)
                .then(res => res.blob())
                .then(async (res) => {
                    let url = URL.createObjectURL(res)
                    resolve(url)
                })
        })
    }

    fetchDouYinMusics() {
        const url = 'https://ca448d14-fda5-4d8f-9279-3f4896d8f854.bspapp.com/all/music?action=getMusics&uid=1660306799599'
        fetch(url)
            .then(res => res.json())
            .then(res => {
                const prior = ['collapsing world 钢琴', '多幸运 伴奏', 'unravel 魔改', 'memoryB']
                const prior_= []
                this.list = res.data.map((v: any) => {
                    const { name, id, url } = v
                    const music = { name, id, url }
                    if(prior.includes(name)) prior_.push(music)
                    return music
                })
                this.list.reverse()
                this.list.unshift(...prior_)
                const UI = new MusicUI(this.list, (music: Music) => {
                    if(this.music !== music) {
                        this.start(music)
                    } else {
                        this.isPlay ? this.pause() : this.resume()
                    }
                })
                this.UIContainer.appendChild(UI)
            })
    }
}

class MusicUI extends HTMLElement {
    constructor(musics: Music[], itemClick: Function) {
        super();
        this.attachShadow({ mode: 'open' })
        const style = document.createElement('style')
        style.innerHTML = `
            * {
                color: white;
                font-size: 11px;
                cursor: pointer;
            }
            .list {
                width: 250px;
                height: 250px;
                overflow: auto;
                position: absolute;
                left: 10px;
                top: 10px;
            }
            .item {
                display: flex;
                align-items: center;
                padding: 5px;
            }
            .item:hover {
                background-color: rgba(255,255,255,.2);
            }
            .index {
                width: 30px;
            }
            .name {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        `
        const list = document.createElement('div')
        list.className = 'list'
        musics.map((v, i) => {
            const item = document.createElement('div')
            item.className = 'item'
            item.onclick = () => itemClick(v)
            const index = document.createElement('div')
            index.className = 'index';
            index.innerHTML = `${musics.length - i}`
            const name = document.createElement('div')
            name.className = 'name'
            name.innerHTML = v.name
            item.append(index, name)
            list.append(item)
        })
        this.shadowRoot.appendChild(style)
        this.shadowRoot.appendChild(list)
    }
}
window.customElements.define('music-ui', MusicUI)