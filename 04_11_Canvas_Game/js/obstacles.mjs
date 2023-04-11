import * as G from "./graphics.mjs";

export function createObstacles(ctx, number) {
    let obs = [];

    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const border = width < height ? width / 5 : height / 5;

    while (obs.length < number) {
        const radius = border / 20 + Math.random() * border / 3;
        const x = border + Math.random() * (width - 2 * border);
        const y = border + Math.random() * (height - 2 * border);
        if (isInside(x, y, radius) === false)
            obs.push({ x, y, radius });
    }

    function draw() {
        for (let o of obs) {
            G.circle(ctx, o.x, o.y, o.radius, "gray");
        }
    }

    function isInside(x, y, radius) {
        for (let o of obs) {
            const d = G.distance(x, y, o.x, o.y);
            if (d < radius + o.radius) return true;
        }
        return false;
    }

    return { draw, isInside };
}