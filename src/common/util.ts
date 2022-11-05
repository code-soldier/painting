
export function importImg() {
    let arr = [
        "right.webp",
        "left.webp",
        "top.webp",
        "bottom.webp",
        "front.webp",
        "back.webp",
    ];
    return arr.map(v => new URL(`../assets/img/${v}`, import.meta.url).href);
}
