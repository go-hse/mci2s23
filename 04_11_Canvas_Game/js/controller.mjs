import * as G from "./graphics.mjs";


export function controller() {
    let isTouched = false, identifier, ialpha = undefined, rotation = 0;
    let touchX, touchY, itouchX, itouchY, ctx, width, height, moveable, insideCB;
    let shotTime;

    const radius = 20;
    let x, y;

    function resize(c) {
        ctx = c;
        width = ctx.canvas.width
        height = ctx.canvas.height;
    }

    function draw(ctx) {
        if (isTouched) {
            ctx.globalAlpha = 0.4;
            G.circle(ctx, x, y, radius, "red");
            G.line(ctx, x, y, touchX, touchY, "white", 1);
            ctx.globalAlpha = 1;
        }
    }

    function isInside(ctx, ti, tx, ty) {
        isTouched = insideCB(ctx, ti, tx, ty);
        if (isTouched) {
            shotTime = new Date();
            if (identifier === undefined) {
                identifier = ti;
                x = tx;
                y = ty;
                touchX = tx;
                touchY = ty;
            }
        }
    }

    function setMoveable(n) {
        moveable = n;
        insideCB = n.insideCB;
    }

    function move(ti, tx, ty) {
        if (ti !== identifier || moveable === undefined) return;
        const rn = G.distance(x, y, tx, ty);
        const nalpha = Math.atan2(ty - y, tx - x);
        touchX = tx;
        touchY = ty;
        if (rn > radius) {
            if (ialpha === undefined) {
                itouchX = tx;
                itouchY = ty;
                ialpha = nalpha;
            }
            moveable.move(rn / radius - 1, nalpha);
        } else {
            moveable.move(0);
        }
    }

    function reset(ti) {
        if (isTouched) {
            const deltaT = new Date() - shotTime;
            console.log(`reset dt: ${deltaT}`);
            if (deltaT < 500) {
                moveable.shoot();
            }
        }
        if (ti === identifier) {
            isTouched = false;
            ialpha = undefined;
            identifier = undefined;
            moveable.move(0);
        }
    }
    return { draw, isInside, move, reset, resize, setMoveable };
}
