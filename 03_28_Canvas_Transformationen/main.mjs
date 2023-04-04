// import { initGraphics } from "./js/graphics.mjs";
import * as G from "./js/graphics.mjs";


function getTime() {
    let now = new Date();
    let sec = now.getSeconds();
    let min = now.getMinutes();
    let hrs = now.getHours();
    if (hrs >= 12) hrs -= 12;
    return {
        sec,
        min,
        hrs
    };
}

function clock(ctx) {
    const { sec, min, hrs } = getTime();

    ctx.resetTransform();
    let width = ctx.canvas.width;
    let height = ctx.canvas.height;
    let radius = (width / 4) * 0.7;

    function reset() {
        ctx.resetTransform();
        ctx.translate(width / 2, height / 2);
    }

    const size = radius * 0.7;
    ctx.translate(width / 2, height / 2);
    ctx.rotate(-Math.PI / 2);
    // G.line(ctx, 0, 0, radius, 0, "#f00", 3);
    for (let i = 0; i < 60; ++i) {
        if (i % 5 === 0)
            G.line(ctx, size, 0, size * 1.1, 0, "#fbb", 2);
        else
            G.line(ctx, size, 0, size * 1.05, 0, "#bbb");
        ctx.rotate(Math.PI / 30);
    }

    reset();
    let angle = sec * Math.PI / 30;
    ctx.rotate(angle);
    G.line(ctx, 0, 0, 0, -size, "#f00", 4);

    reset();
    angle = min * Math.PI / 30;
    ctx.rotate(angle);
    G.line(ctx, 0, 0, 0, -size, "#fff", 6);

    reset();
    angle = hrs * Math.PI / 6;
    ctx.rotate(angle);
    G.line(ctx, 0, 0, 0, -size / 2, "#fff", 12);

}

window.onload = function () {
    G.initGraphics(draw);

    function draw(ctx, deltaTime) {

        ctx.fillStyle = "red";
        ctx.fillRect(100, 100, 50, 70);

        ctx.resetTransform();
        ctx.translate(100, 100);
        ctx.rotate(deltaTime / 1000);
        ctx.fillStyle = "blue";
        ctx.fillRect(0, 0, 50, 70);

        ctx.resetTransform();
        ctx.translate(200, 100);
        ctx.rotate(deltaTime / 1000);
        ctx.translate(-25, -35);
        ctx.fillStyle = "blue";
        ctx.fillRect(0, 0, 50, 70);

        ctx.resetTransform();
        ctx.translate(0, 100);
        G.line(ctx, 0, 0, ctx.canvas.width, 0);

        clock(ctx);

    }
}

