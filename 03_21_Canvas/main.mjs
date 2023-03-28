// import { initGraphics } from "./js/graphics.mjs";
import * as G from "./js/graphics.mjs";

function MovingObject(x = 0, y = 0, width = 70, height = 30, fillStyle = "red") {
    function draw(ctx) {
        ctx.fillStyle = fillStyle;
        ctx.fillRect(x, y, width, height);
    }

    // ctx.canvas.width / height
    function move() {
        x += 1;
    }

    return { draw, move };
}

window.onload = function () {
    const m = MovingObject(20, 30, 10, 10, "red");
    G.initGraphics(draw);

    function draw(ctx) {
        ctx.fillStyle = "red";
        ctx.fillRect(100, 100, 50, 70);
        ctx.fillStyle = "blue";
        ctx.fillRect(200, 100, 50, 70);
        G.line(ctx, 0, 0, ctx.canvas.width, ctx.canvas.height);
        m.move();
        m.draw(ctx);

        G.circle(ctx, 250, 180, 60);
    }
}

