import { initInteraction } from "./interaction.mjs";


export function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

export function line(ctx, x1, y1, x2, y2, strokeStyle = "#fff", lineWidth = 1) {
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

const startAngle = 0;
const endAngle = Math.PI * 2;

export function circle(ctx, x, y, radius, fillStyle = "#fff", strokeStyle = "#000", lineWidth = 1) {
    ctx.fillStyle = fillStyle;
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.beginPath();
    ctx.arc(x, y, radius, startAngle, endAngle, true);
    ctx.fill();
    ctx.stroke();
}

export function u_path() {
    let upath = new Path2D();
    upath.moveTo(-2, -2);
    upath.lineTo(-2, 2);
    upath.lineTo(-1, 2);
    upath.lineTo(-1, -1);
    upath.lineTo(1, -1);
    upath.lineTo(1, 2);
    upath.lineTo(2, 2);
    upath.lineTo(2, -2);
    upath.closePath();
    return upath;
}

export function path(ctx, p, x, y, angle,
    sc = 10, fillStyle = "#f00", strokeStyle = "#f00", lineWidth = 0.1
) {
    ctx.save();  // Sicherung der globalen Attribute
    ctx.translate(x, y);
    ctx.scale(sc, sc);
    ctx.rotate(angle);

    let m = ctx.getTransform();

    ctx.fillStyle = fillStyle;
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.fill(p);
    ctx.stroke(p);
    ctx.restore(); // Wiederherstellung der globalen Attribute

    return m;
}



export function initGraphics(drawcallback, interactiveObjects) {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    // forEachTouch ist Funktion, zurückgegeben aus initInteraction
    let forEachTouchFunction = initInteraction(ctx, interactiveObjects);

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        console.log(`resize ${ctx.canvas.width}x${ctx.canvas.height}`);
    }
    window.addEventListener("resize", resize);
    resize();

    const startTime = new Date();

    function mainloop() {
        const deltaTime = new Date() - startTime;
        ctx.resetTransform();
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        drawcallback(ctx, deltaTime);
        ctx.font = "20px Arial";

        // Callback: anonyme Funktion, 3 Parameter
        forEachTouchFunction((identifier, x, y) => {
            circle(ctx, x, y, 30, "red");
            ctx.fillStyle = "white";
            ctx.fillText(`id: ${identifier}`, x + 40, y);
        });
        window.requestAnimationFrame(mainloop);
    }
    mainloop();
}


