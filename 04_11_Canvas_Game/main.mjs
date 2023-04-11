// import { initGraphics } from "./js/graphics.mjs";
import * as G from "./js/graphics.mjs";
import { controller } from "./js/controller.mjs";
import { Moveable, Moveables } from "./js/moveable.mjs";

window.onload = function () {
    let interactiveObjects = [];


    const ctrl = controller();
    interactiveObjects.push(ctrl);

    const graphics = G.initGraphics(interactiveObjects);
    const ship = Moveable(graphics.ctx, 50, 50, 0, 0, 10, 3, "ship", "red");
    ctrl.setMoveable(ship);

    const moveables = Moveables(graphics.ctx, 15);
    moveables.addMoveable(ship);

    function draw(ctx, deltaTime) {


        moveables.update(deltaTime / 10);
        moveables.draw();
        for (let io of interactiveObjects) {
            io.draw(ctx);
        }
    }
    graphics.setDrawCallback(draw);
    graphics.mainloop();
}

