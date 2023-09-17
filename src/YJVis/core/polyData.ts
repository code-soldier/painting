

class PrimitiveData {

}

export class PolyData {
    points: number[]

    triangles: number[]
    lines: number[]

}

type BoxOptions = {
    width: number;
    height: number;
    depth: number;
    widthSegments: number;
    heightSegments: number;
    depthSegments: number;
};

export function buildBox({ width = 1, height = 1, depth = 1, widthSegments = 1, heightSegments = 1, depthSegments = 1 }: Partial<BoxOptions> = {}
) {
    const wSegs = widthSegments;
    const hSegs = heightSegments;
    const dSegs = depthSegments;

    const num = (wSegs + 1) * (hSegs + 1) * 2 + (wSegs + 1) * (dSegs + 1) * 2 + (hSegs + 1) * (dSegs + 1) * 2;
    const numIndices = (wSegs * hSegs * 2 + wSegs * dSegs * 2 + hSegs * dSegs * 2) * 6;

    const position = new Float32Array(num * 3);
    const normal = new Float32Array(num * 3);
    const uv = new Float32Array(num * 2);
    const color = new Float32Array(num*3)
    for(let i=0;i<num*3;i+=3){
        const f = ()=> Math.random()
        color[i] = f()
        color[i+1] = f()
        color[i+2] = f()
    }
    const index = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);

    let i = 0;
    let ii = 0;

    // left, right
    buildPlane(position, normal, uv, index, depth, height, width, dSegs, hSegs, 2, 1, 0, -1, -1, i, ii);
    i += (dSegs + 1) * (hSegs + 1);
    ii += dSegs * hSegs;

    buildPlane(position, normal, uv, index, depth, height, -width, dSegs, hSegs, 2, 1, 0, 1, -1, i, ii);
    i += (dSegs + 1) * (hSegs + 1);
    ii += dSegs * hSegs;

    // top, bottom
    buildPlane(position, normal, uv, index, width, depth, height, dSegs, wSegs, 0, 2, 1, 1, 1, i, ii);
    i += (wSegs + 1) * (dSegs + 1);
    ii += wSegs * dSegs;

    buildPlane(position, normal, uv, index, width, depth, -height, dSegs, wSegs, 0, 2, 1, 1, -1, i, ii);
    i += (wSegs + 1) * (dSegs + 1);
    ii += wSegs * dSegs;

    // front, back
    buildPlane(position, normal, uv, index, width, height, -depth, wSegs, hSegs, 0, 1, 2, -1, -1, i, ii);
    i += (wSegs + 1) * (hSegs + 1);
    ii += wSegs * hSegs;

    buildPlane(position, normal, uv, index, width, height, depth, wSegs, hSegs, 0, 1, 2, 1, -1, i, ii);

    return {
        position: { size: 3, data: position },
        // normal: { size: 3, data: normal },
        // uv: { size: 2, data: uv },
        color: {size: 3,data: color},
        index: { data: index,isIndex: true },
    };
}

function buildPlane(
    position: Float32Array,
    normal: Float32Array,
    uv: Float32Array,
    index: Uint32Array | Uint16Array,
    width: number,
    height: number,
    depth: number,
    wSegs: number,
    hSegs: number,
    u = 0,
    v = 1,
    w = 2,
    uDir = 1,
    vDir = -1,
    i = 0,
    ii = 0
) {
    const io = i;
    const segW = width / wSegs;
    const segH = height / hSegs;

    for (let iy = 0; iy <= hSegs; iy++) {
        let y = iy * segH - height / 2;
        for (let ix = 0; ix <= wSegs; ix++, i++) {
            let x = ix * segW - width / 2;

            position[i * 3 + u] = x * uDir;
            position[i * 3 + v] = y * vDir;
            position[i * 3 + w] = depth / 2;

            normal[i * 3 + u] = 0;
            normal[i * 3 + v] = 0;
            normal[i * 3 + w] = depth >= 0 ? 1 : -1;

            uv[i * 2] = ix / wSegs;
            uv[i * 2 + 1] = 1 - iy / hSegs;

            if (iy === hSegs || ix === wSegs) continue;
            let a = io + ix + iy * (wSegs + 1);
            let b = io + ix + (iy + 1) * (wSegs + 1);
            let c = io + ix + (iy + 1) * (wSegs + 1) + 1;
            let d = io + ix + iy * (wSegs + 1) + 1;

            index[ii * 6] = a;
            index[ii * 6 + 1] = b;
            index[ii * 6 + 2] = d;
            index[ii * 6 + 3] = b;
            index[ii * 6 + 4] = c;
            index[ii * 6 + 5] = d;
            ii++;
        }
    }
}

export const data = [
    // 位置、UV坐标、法线和颜色
    // Face 1 (Front)
    +1, -1, +1, 1, 1, 0, 0, 1, 1, 0, 0,  // 顶点1
    -1, -1, +1, 0, 1, 0, 0, 1, 1, 0, 0,  // 顶点2
    -1, +1, +1, 0, 0, 0, 0, 1, 1, 0, 0,  // 顶点3
    +1, +1, +1, 1, 0, 0, 0, 1, 1, 0, 0,  // 顶点4

    // Face 2 (Back)
    +1, -1, -1, 1, 1, 0, 0, -1, 0, 1, 0,  // 顶点5
    -1, -1, -1, 0, 1, 0, 0, -1, 0, 1, 0,  // 顶点6
    -1, +1, -1, 0, 0, 0, 0, -1, 0, 1, 0,  // 顶点7
    +1, +1, -1, 1, 0, 0, 0, -1, 0, 1, 0,  // 顶点8

    // Face 3 (Top)
    +1, +1, +1, 1, 1, 0, 1, 0, 0, 0, 1,  // 顶点9
    -1, +1, +1, 0, 1, 0, 1, 0, 0, 0, 1,  // 顶点10
    -1, +1, -1, 0, 0, 0, 1, 0, 0, 0, 1,  // 顶点11
    +1, +1, -1, 1, 0, 0, 1, 0, 0, 0, 1,  // 顶点12

    // Face 4 (Bottom)
    +1, -1, +1, 1, 1, 0, -1, 0, 1, 1, 0,  // 顶点13
    -1, -1, +1, 0, 1, 0, -1, 0, 1, 1, 0,  // 顶点14
    -1, -1, -1, 0, 0, 0, -1, 0, 1, 1, 0,  // 顶点15
    +1, -1, -1, 1, 0, 0, -1, 0, 1, 1, 0,  // 顶点16

    // Face 5 (Right)
    +1, -1, +1, 1, 1, 1, 0, 0, 0, 1, 1,  // 顶点17
    +1, -1, -1, 0, 1, 1, 0, 0, 0, 1, 1,  // 顶点18
    +1, +1, -1, 0, 0, 1, 0, 0, 0, 1, 1,  // 顶点19
    +1, +1, +1, 1, 0, 1, 0, 0, 0, 1, 1,  // 顶点20

    // Face 6 (Left)
    -1, -1, +1, 1, 1, -1, 0, 0, 1, 1, 1,  // 顶点21
    -1, -1, -1, 0, 1, -1, 0, 0, 1, 1, 1,  // 顶点22
    -1, +1, -1, 0, 0, -1, 0, 0, 1, 1, 1,  // 顶点23
    -1, +1, +1, 1, 0, -1, 0, 0, 1, 1, 1   // 顶点24
]

const positions = [
    // Face 1 (Front)
    +1, -1, +1,
    -1, -1, +1,
    -1, +1, +1,
    +1, +1, +1,

    // Face 2 (Back)
    +1, -1, -1,
    -1, -1, -1,
    -1, +1, -1,
    +1, +1, -1,

    // Face 3 (Top)
    +1, +1, +1,
    -1, +1, +1,
    -1, +1, -1,
    +1, +1, -1,

    // Face 4 (Bottom)
    +1, -1, +1,
    -1, -1, +1,
    -1, -1, -1,
    +1, -1, -1,

    // Face 5 (Right)
    +1, -1, +1,
    +1, -1, -1,
    +1, +1, -1,
    +1, +1, +1,

    // Face 6 (Left)
    -1, -1, +1,
    -1, -1, -1,
    -1, +1, -1,
    -1, +1, +1,
];
const uvs = [
    // Face 1 (Front)
    1, 1,
    0, 1,
    0, 0,
    1, 0,

    // Face 2 (Back)
    1, 1,
    0, 1,
    0, 0,
    1, 0,

    // Face 3 (Top)
    1, 1,
    0, 1,
    0, 0,
    1, 0,

    // Face 4 (Bottom)
    1, 1,
    0, 1,
    0, 0,
    1, 0,

    // Face 5 (Right)
    1, 1,
    0, 1,
    0, 0,
    1, 0,

    // Face 6 (Left)
    1, 1,
    0, 1,
    0, 0,
    1, 0,
];
const normals = [
    // Face 1 (Front)
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,

    // Face 2 (Back)
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,

    // Face 3 (Top)
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,

    // Face 4 (Bottom)
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,

    // Face 5 (Right)
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,

    // Face 6 (Left)
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
];
const colors = [
    // Face 1 (Front)
    1, 0, 0,
    0, 1, 0,
    0, 0, 1,
    1, 1, 0,

    // Face 2 (Back)
    1, 0, 0,
    0, 1, 0,
    0, 0, 1,
    1, 1, 0,

    // Face 3 (Top)
    1, 0, 0,
    0, 1, 0,
    0, 0, 1,
    1, 1, 0,

    // Face 4 (Bottom)
    1, 0, 0,
    0, 1, 0,
    0, 0, 1,
    1, 1, 0,

    // Face 5 (Right)
    1, 0, 0,
    0, 1, 0,
    0, 0, 1,
    1, 1, 0,

    // Face 6 (Left)
    1, 0, 0,
    0, 1, 0,
    0, 0, 1,
    1, 1, 0,
];
export const model = {
    pos: positions,
    color: colors,
    uv: uvs,
    normal: normals
}