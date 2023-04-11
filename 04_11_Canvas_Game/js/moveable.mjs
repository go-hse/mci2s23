import * as G from "./graphics.mjs";


export function Moveable(ctx, x, y, vx, vy, radius = 10, mass = 1, id = "", color = "gray") {
    let alpha = 0, rotation = 0, speed = 0;
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    let lastTime = 0;
    let collideCounter = 0;

    function update(t) {
        lastTime = t;
        if (speed > 0) {
            alpha += rotation;
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
        if (collideCounter < 0) {
            vx *= 0.98;
            vy *= 0.98;
        }

    }

    function move(s, r) {
        speed = s;
        rotation = r;
    }

    function setVelocity(nvx, nvy) {
        vx = nvx;
        vy = nvy;
        collideCounter = 10;
    }

    function coords() {
        return { x, y };
    }

    function ncoords() {
        return { x: x + vx * lastTime, y: y + vy * lastTime };
    }


    function velocity() {
        return { vx, vy };
    }

    function draw() {
        ctx.save();
        ctx.translate(x, y);
        if (alpha !== 0) ctx.rotate(alpha);
        ctx.fillStyle = color;
        G.circle(ctx, 0, 0, radius, color);
        ctx.strokeStyle = "white";
        if (alpha !== 0) G.line(ctx, 0, 0, radius * 1.2, 0, "white", 2);
        // ctx.fillStyle = "white";
        // ctx.fillText(id, 0, -5);
        ctx.restore();
    }

    return { update, draw, move, setVelocity, radius, id, coords, ncoords, velocity, mass };
}

const MAX_SPEED = 0.1;
const MAX_SPEED_HALF = MAX_SPEED / 2;

export function Moveables(ctx, number) {

    let objects = [];

    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const border = width < height ? width / 5 : height / 5;

    while (objects.length < number) {
        const radius = border / 5 + Math.random() * border / 3;
        const x = border + Math.random() * (width - 2 * border);
        const y = border + Math.random() * (height - 2 * border);

        if (isInside(x, y, radius) === false) {
            const vx = MAX_SPEED_HALF - Math.random() * MAX_SPEED;
            const vy = MAX_SPEED_HALF - Math.random() * MAX_SPEED;
            objects.push(Moveable(ctx, x, y, vx, vy, radius, radius / 40, `id: ${objects.length}`));
        }
    }

    function addMoveable(m) {
        objects.push(m);
    }

    function isInside(x, y, radius) {
        for (let o of objects) {
            const co = o.coords();
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

    function update(t) {
        for (let o of objects) {
            for (let i of objects) {
                if (i === o) continue;
                const ci = i.coords();
                const co = o.coords();
                const d = G.distance(ci.x, ci.y, co.x, co.y);
                if (d < i.radius + o.radius) {
                    const vCollision = { x: ci.x - co.x, y: ci.y - co.y };
                    const vCollisionNorm = { x: vCollision.x / d, y: vCollision.y / d };
                    const vi = i.velocity();
                    const vo = o.velocity();
                    const vRelativeVelocity = { x: vo.vx - vi.vx, y: vo.vy - vi.vy };
                    const speed = vRelativeVelocity.x * vCollisionNorm.x + vRelativeVelocity.y * vCollisionNorm.y;
                    const impulse = 2 * speed / (i.mass + o.mass);
                    i.setVelocity(vi.vx + (impulse * o.mass * vCollisionNorm.x), vi.vy + (impulse * o.mass * vCollisionNorm.y))
                    o.setVelocity(vo.vx - (impulse * i.mass * vCollisionNorm.x), vo.vy - (impulse * i.mass * vCollisionNorm.y))
                };
            }
            o.update(t);
        }
    }


    return { draw, update, addMoveable };
}


