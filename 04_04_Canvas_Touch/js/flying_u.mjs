import * as G from "./graphics.mjs";

export function flying_u(x, y) {
    let isTouched = false;
    let identifier = undefined;
    let transformationMatrix = undefined;
    let inverseTransMatrix = undefined, localTouchPoint;
    let alpha = Math.PI / 2;
    let lastAlpha, tX = 0, tY = 0;

    const upath = G.u_path();

    function draw(ctx) {
        if (isTouched) {
            transformationMatrix = G.path(ctx, upath, x, y, alpha, 20, "red");
            let globalTouchPoint = transformationMatrix.transformPoint(localTouchPoint);
            G.line(ctx, globalTouchPoint.x, globalTouchPoint.y, tX, tY, "white");
            G.line(ctx, x, y, tX, tY, "white");
        } else {
            transformationMatrix = G.path(ctx, upath, x, y, alpha, 20, "white");
        }
        inverseTransMatrix = DOMMatrix.fromMatrix(transformationMatrix);
        inverseTransMatrix.invertSelf();
    }

    function isInside(ctx, ti, tx, ty) {
        localTouchPoint = inverseTransMatrix.transformPoint(new DOMPoint(tx, ty));
        isTouched = ctx.isPointInPath(upath, localTouchPoint.x, localTouchPoint.y);
        if (isTouched) {
            identifier = ti;
            lastAlpha = Math.atan2(ty - y, tx - x);
        }
    }

    function move(ctx, ti, tx, ty) {
        if (isTouched && ti === identifier) {
            tX = tx;
            tY = ty;
            let newAlpha = Math.atan2(ty - y, tx - x);

            // alpha wird um die Differenz der Winkel verändert
            alpha += newAlpha - lastAlpha;
            lastAlpha = newAlpha;
        }
    }

    function reset(ti) {
        if (ti === identifier) {
            isTouched = false;
            identifier = undefined;
        }
    }
    return { draw, isInside, move, reset };
}
