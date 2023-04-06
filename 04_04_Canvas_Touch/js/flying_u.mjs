import * as G from "./graphics.mjs";

export function flying_u(x, y) {
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
