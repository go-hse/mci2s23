// import { initGraphics } from "./js/graphics.mjs";
import * as G from "./js/graphics.mjs";



function button(x, y, radius, cb, fsNormal = "gray", fsTouched = "white") {

    let isTouched = false;
    let identifier = undefined;  // kein Touch-Punkt
    let startTouchTime = undefined;

    function draw(ctx) {
        if (isTouched) {
            G.circle(ctx, x, y, radius, fsTouched);
        } else {
            G.circle(ctx, x, y, radius, fsNormal);
        }
    }
    // isInside: bei TouchStart aufgerufen 
    // ti: identifier, tx/ty: Touch-Koodinaten
    function isInside(ti, tx, ty) {
        isTouched = G.distance(x, y, tx, ty) < radius;
        if (isTouched) {
            identifier = ti;
            startTouchTime = new Date();
        }
    }

    function move(x, y) { }

    // reset: bei TouchEnd aufgerufen; 
    // ti: identifier
    function reset(ti) {
        if (ti === identifier) {
            isTouched = false;
            identifier = undefined;
            const deltaTime = new Date() - startTouchTime;
            if (deltaTime < 300) {
                cb();
            } else {
                console.log("too slow");
            }
        }
    }


    return { draw, isInside, move, reset };
}

window.onload = function () {
    let btn = button(300, 300, 30, () => {
        console.log("button action");
    });

    const upath = G.u_path();

    let interactiveObjects = [btn];

    interactiveObjects.push(button(350, 300, 30, () => {
        console.log("button 2 action");
    }));

    G.initGraphics(draw, interactiveObjects);


    function draw(ctx, deltaTime) {
        G.circle(ctx, 100, 100, 30, "white", "white", 2);
        G.circle(ctx, 120, 130, 30, "green", "red", 2);

        for (let io of interactiveObjects) {
            io.draw(ctx);
        }

        G.path(ctx, upath, 200, 200, deltaTime / 1000, 20, "red", "red", 0.1);
    }
}

