// import { initGraphics } from "./js/graphics.mjs";
import * as G from "./js/graphics.mjs";

function clock(ctx) {
    ctx.resetTransform();
    let width = ctx.canvas.width;
    let height = ctx.canvas.height;
    let radius = width / 2;

    ctx.translate(radius, height / 2);
    ctx.rotate(Math.PI);
    for (let i = 0; i < 60; ++i) {
        ctx.rotate(Math.PI / 30);
        G.line(ctx, radius * 0.9, 0, radius, 0);
    }

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

