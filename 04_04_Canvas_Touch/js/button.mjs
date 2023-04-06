import * as G from "./graphics.mjs";

export function button(x, y, radius, cb, fsNormal = "gray", fsTouched = "white") {

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
