// import { initGraphics } from "./js/graphics.mjs";
import * as G from "./js/graphics.mjs";
import { button } from "./js/button.mjs";
import { flying_u } from "./js/flying_u.mjs";

window.onload = function () {
    let interactiveObjects = [];

    interactiveObjects.push(button(50, 50, 30, () => {
        console.log("button 1 action");
    }));

    interactiveObjects.push(button(150, 50, 30, () => {
        console.log("button 2 action");
    }));

    interactiveObjects.push(flying_u(250, 250));
    G.initGraphics(draw, interactiveObjects);


    function draw(ctx, deltaTime) {
        for (let io of interactiveObjects) {
            io.draw(ctx);
        }
    }
}

