import * as G from "./graphics.mjs";

const PI = Math.PI;
const TPI = 2 * PI;
const HPI = PI / 2;

function delta(alpha, beta) {
    let a = alpha - beta;
    return modulo(a + PI, TPI) - PI;
}

function modulo(a, n) {
    return a - Math.floor(a / n) * n;
}


export function controller() {
    let isTouched = false, identifier, ialpha = undefined, rotation = 0;
    let touchX, touchY, itouchX, itouchY, ctx, width, height, moveable;

    const radius = 70;
    let x, y;

    function resize(c) {
        ctx = c;
        width = ctx.canvas.width
        height = ctx.canvas.height;
    }

    function draw(ctx) {
        if (isTouched) {
            if (ialpha !== undefined) {
                const start = ialpha;
                const end = start + rotation * 10;
                ctx.fillStyle = "#666";
                ctx.lineWidth = radius * 0.4;
                ctx.strokeStyle = "#777";
                ctx.beginPath();
                if (rotation < 0)
                    ctx.arc(x, y, radius * 1.4, end, start, false);
                else
                    ctx.arc(x, y, radius * 1.4, start, end, false);
                ctx.fill();
                ctx.stroke();
                G.circle(ctx, itouchX, itouchY, 5, "orange");
            }
            G.circle(ctx, x, y, radius, "red");
            G.line(ctx, x, y, touchX, touchY, "green", 1);
        }
    }

    function isInside(ctx, ti, tx, ty) {
        isTouched = ty > ctx.canvas.height / 2;
        if (isTouched) {
            identifier = ti;
            x = tx;
            y = ty;
            touchX = tx;
            touchY = ty;
        }
    }

    function setMoveable(n) {
        moveable = n;
    }

    function move(ti, tx, ty) {
        if (ti !== identifier || moveable === undefined) return;
        let rn = G.distance(x, y, tx, ty);
        touchX = tx;
        touchY = ty;
        if (rn > radius) {
            let nalpha = Math.atan2(ty - y, tx - x);
            if (ialpha === undefined) {
                itouchX = tx;
                itouchY = ty;
                ialpha = nalpha;
            }
            let d = delta(nalpha, ialpha);
            rotation = d / 30;
            moveable.move(rn / radius - 1, rotation);
        } else {
            moveable.move(0, 0);
        }
    }

    function reset(ti) {
        if (ti === identifier) {
            isTouched = false;
            ialpha = undefined;
            identifier = undefined;
            moveable.move(0, 0);
        }
    }
    return { draw, isInside, move, reset, resize, setMoveable };
}
