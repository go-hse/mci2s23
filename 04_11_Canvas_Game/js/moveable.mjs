import * as G from "./graphics.mjs";

export function Moveable(ctx, x, y, vx, vy, radius = 15, mass = 1, id = "", color = "gray", interactive = false) {
    let alpha = 0, towards = 0, rotation = 0, speed = 0;
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    let lastTime = 0;
    let collideCounter = 0;
    let imgDrawFunc;

    function setImage(src, radius = 1) {
        imgDrawFunc = G.image(ctx, src, radius)
    }

    function update(t) {
        lastTime = t;

        rotation = G.delta(towards, alpha) / 30;

        alpha += rotation;

        if (speed > 0) {
            vx = speed * Math.cos(alpha);
            vy = speed * Math.sin(alpha);
        }
        const nx = x + vx * t;
        const ny = y + vy * t;

        if (nx + radius > width || nx - radius < 0) vx *= -1;
        if (ny + radius > height || ny - radius < 0) vy *= -1;

        x += vx * t;
        y += vy * t;

        --collideCounter;

        vx *= 0.9;
        vy *= 0.9;
    }

    function move(s, nalpha) {
        if (collideCounter < 1 && nalpha !== undefined) {
            speed = s / 5;
            towards = nalpha;
        } else {
            speed = 0.2;
            rotation = 0;
            towards = alpha;
        }
    }

    function setHit(cc = 3) {
        collideCounter = cc;
    }

    function setColor(c) {
        color = c;
    }

    function setVelocity(nvx, nvy) {
        vx = nvx;
        vy = nvy;
        alpha = Math.atan2(vy, vx);
        setHit();
    }

    function getState() {
        return { x, y, alpha, radius, collideCounter, interactive };
    }

    function velocity() {
        return { vx, vy };
    }

    function draw() {
        ctx.save();
        ctx.translate(x, y);
        if (interactive) ctx.rotate(alpha);
        ctx.fillStyle = color;
        if (interactive && collideCounter < 1 || interactive === false) {
            G.circle(ctx, 0, 0, radius, color);
        }
        if (interactive && collideCounter > 0) {
            G.circle(ctx, 0, 0, radius, "gray");
        }
        if (imgDrawFunc) imgDrawFunc(0, 0, 0);
        ctx.strokeStyle = "white";
        if (interactive && collideCounter < 1) {
            G.line(ctx, 0, 0, radius * 1.2, 0, "white", 2);
            ctx.translate(radius, 0);
            G.curve(ctx, speed, rotation, "orange", 2);
        }
        // ctx.fillStyle = "white";
        // ctx.fillText(id, 0, -5);
        ctx.restore();
    }

    return { update, draw, move, setVelocity, radius, id, getState, velocity, mass, setHit, setColor, setImage };
}

const MAX_SPEED = 0.1;
const MAX_SPEED_HALF = MAX_SPEED / 2;

export function Moveables(ctx, number) {
    let objects = [];

    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const border = width < height ? width / 5 : height / 5;

    let errorCounter = 0;
    while (objects.length < number && errorCounter < 1000) {
        const radius = border / 3 + Math.random() * border / 3;
        const x = radius + Math.random() * (width - border);
        const y = border + Math.random() * (height - 2 * border);

        if (isInside(x, y, radius) === false) {
            const vx = MAX_SPEED_HALF - Math.random() * MAX_SPEED;
            const vy = MAX_SPEED_HALF - Math.random() * MAX_SPEED;
            const mass = radius / 40;
            objects.push(Moveable(ctx, x, y, vx, vy, radius, mass, `id: ${objects.length}`, "black"));
            errorCounter = 0;
        } else {
            ++errorCounter;
        }
    }

    function addMoveable(m) {
        objects.push(m);
    }

    function forMoveable(cb) {
        for (let o of objects) {
            if (cb(o)) return true;
        }
        return false;
    }

    function isInside(x, y, radius) {
        for (let o of objects) {
            const co = o.getState();
            const d = G.distance(x, y, co.x, co.y);
            if (d * 0.8 < radius + o.radius) return true;
        }
        return false;
    }

    function draw() {
        ctx.font = "20px Arial";
        for (let o of objects) {
            o.draw();
        }
    }

    // https://spicyyoghurt.com/tutorials/html5-javascript-game-development/collision-detection-physics
    function update(t) {
        for (let o of objects) {
            for (let i of objects) {
                if (i === o) continue;
                const ci = i.getState();
                const co = o.getState();
                const d = G.distance(ci.x, ci.y, co.x, co.y);
                if (d < i.radius + o.radius) {
                    const vCollision = { x: ci.x - co.x, y: ci.y - co.y };
                    const vCollisionNorm = { x: vCollision.x / d, y: vCollision.y / d };
                    const vi = i.velocity();
                    const vo = o.velocity();
                    const vRelativeVelocity = { x: vo.vx - vi.vx, y: vo.vy - vi.vy };
                    const speed = vRelativeVelocity.x * vCollisionNorm.x + vRelativeVelocity.y * vCollisionNorm.y;
                    if (speed < 0) continue;
                    const impulse = speed / (i.mass + o.mass);
                    i.setVelocity(vi.vx + (impulse * o.mass * vCollisionNorm.x), vi.vy + (impulse * o.mass * vCollisionNorm.y))
                    o.setVelocity(vo.vx - (impulse * i.mass * vCollisionNorm.x), vo.vy - (impulse * i.mass * vCollisionNorm.y))
                };
            }
            o.update(t);
        }
    }


    return { draw, update, addMoveable, forMoveable };
}


