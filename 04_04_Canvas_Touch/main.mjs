// import { initGraphics } from "./js/graphics.mjs";
import * as G from "./js/graphics.mjs";

function flying_u(x, y) {
    let isTouched = false;
    let identifier = undefined;
    let transformationMatrix = undefined;
    let inverseTransMatrix = undefined;

    const upath = G.u_path();

    function draw(ctx) {
        if (isTouched) {
            transformationMatrix = G.path(ctx, upath, x, y, 0, 20, "red");
        } else {
            transformationMatrix = G.path(ctx, upath, x, y, 0, 20, "white");
        }
        inverseTransMatrix = DOMMatrix.fromMatrix(transformationMatrix);
        inverseTransMatrix.invertSelf();
    }

    function isInside(ctx, ti, tx, ty) {
        let localTouchPoint = inverseTransMatrix.transformPoint(new DOMPoint(tx, ty));
        isTouched = ctx.isPointInPath(upath, localTouchPoint.x, localTouchPoint.y);
        if (isTouched) {
            identifier = ti;
        }
    }

    function move(x, y) { }

    function reset(ti) {
        if (ti === identifier) {
            isTouched = false;
            identifier = undefined;
        }
    }
    return { draw, isInside, move, reset };
}

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
    function isInside(ctx, ti, tx, ty) {
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

