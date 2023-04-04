// import { initGraphics } from "./js/graphics.mjs";
import * as G from "./js/graphics.mjs";

window.onload = function () {
    G.initGraphics(draw);

    function draw(ctx, deltaTime) {
        G.circle(ctx, 100, 100, 30, "blue", "white", 2);
        G.circle(ctx, 120, 130, 30, "green", "red", 2);
    }
}

