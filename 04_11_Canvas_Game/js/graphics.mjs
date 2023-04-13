import { initInteraction } from "./interaction.mjs";


export function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

const PI = Math.PI;
const TPI = 2 * PI;
const HPI = PI / 2;

export function delta(alpha, beta) {
    let a = alpha - beta;
    return modulo(a + PI, TPI) - PI;
}

function modulo(a, n) {
    return a - Math.floor(a / n) * n;
}


export function image(ctx, src, width) {
    let img = new Image();
    img.src = src;
    let offsetX = 0, offsetY = 0;
    let sc = 1;

    img.addEventListener('load', () => {
        sc = width / img.naturalWidth;
        offsetX = -img.naturalWidth / 2;
        offsetY = -img.naturalHeight / 2;
        console.log('Imaged loaded: ', offsetX, offsetY, width, sc);
    });

    return (x, y, angle) => {
        if (offsetX < 0) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.scale(sc, sc);
            ctx.translate(offsetX, offsetY);
            ctx.drawImage(img, 0, 0);
            ctx.restore();
        }
    }
}


export function line(ctx, x1, y1, x2, y2, strokeStyle = "#fff", lineWidth = 1) {
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

const CURVE_LEN = 100;
export function curve(ctx, speed, rotation, strokeStyle = "#fff", lineWidth = 1) {

    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;

    const ctrlX = speed * CURVE_LEN;
    const endX = ctrlX + 2 * CURVE_LEN * rotation;
    const endY = 10 * CURVE_LEN * rotation;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(ctrlX, 0, endX, endY);
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



export function initGraphics() {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    let { forEachTouchFunction, addInteractiveObject } = initInteraction(ctx);

    let interactiveObjects = [];
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        console.log(`resize ${ctx.canvas.width}x${ctx.canvas.height}`);
        for (let io of interactiveObjects) {
            io.resize(ctx);
        }

    }

    function addIO(o) {
        interactiveObjects.push(o);
        addInteractiveObject(o);
    }


    window.addEventListener("resize", resize);
    resize();

    let lastTime = new Date();
    let drawcallback = () => { };
    function setDrawCallback(cb) {
        drawcallback = cb;
    }

    function mainloop() {
        const now = new Date();
        ctx.resetTransform();
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        drawcallback(ctx, now - lastTime);
        ctx.font = "20px Arial";

        // Callback: anonyme Funktion, 3 Parameter
        forEachTouchFunction((identifier, x, y) => {
            circle(ctx, x, y, 10, "red");
            ctx.fillStyle = "white";
            ctx.fillText(`id: ${identifier}`, x + 40, y);
        });

        for (let io of interactiveObjects) {
            io.draw(ctx);
        }

        window.requestAnimationFrame(mainloop);
        lastTime = now;
    }
    return { ctx, mainloop, setDrawCallback, addIO };
}


