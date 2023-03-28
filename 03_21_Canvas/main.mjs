// import { initGraphics } from "./js/graphics.mjs";
import * as G from "./js/graphics.mjs";

function MovingObject(x = 0, y = 0, width = 70, height = 30, fillStyle = "red") {
    const radius = 30;

    function draw(ctx) {
        G.circle(ctx, x, y, radius, "red");
    }

    const speed = 5;
    let speedX = speed;
    let speedY = speed;

    // ctx.canvas.width / height
    function move(width, height) {
        if (x + radius > width || x - radius < 0) speedX *= -1;
        if (y + radius > height || y - radius < 0) speedY *= -1;
        x += speedX;
        y += speedY;
    }

    return { draw, move };
}

window.onload = function () {
    const m = MovingObject(100, 130, 10, 10, "red");
    G.initGraphics(draw);

    function draw(ctx) {
        ctx.fillStyle = "red";
        ctx.fillRect(100, 100, 50, 70);
        ctx.fillStyle = "blue";
        ctx.fillRect(200, 100, 50, 70);
        G.line(ctx, 0, 0, ctx.canvas.width, ctx.canvas.height);
        m.move(ctx.canvas.width, ctx.canvas.height);
        m.draw(ctx);

        G.circle(ctx, 250, 180, 60);
    }
}

