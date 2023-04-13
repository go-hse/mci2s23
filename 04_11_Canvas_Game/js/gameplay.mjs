import * as G from "./graphics.mjs";
import { controller } from "./controller.mjs";
import { Moveable } from "./moveable.mjs";

const SHOT_SPEED = 4;

function Shot(ctx, x, y, alpha, myPlayerID) {
    const dx = SHOT_SPEED * Math.cos(alpha);
    const dy = SHOT_SPEED * Math.sin(alpha);
    let isDone = false;

    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    function update(players, moveables) {
        x += dx;
        y += dy;
        for (let playerId in players) {
            if (playerId !== myPlayerID) {
                const coords = players[playerId].getState();
                const distance = G.distance(x, y, coords.x, coords.y);
                if (distance < coords.radius) {
                    players[playerId].setHit();
                    isDone = true;
                    return;
                }
            }
        }
        isDone = moveables.forMoveable((o) => {
            const state = o.getState();
            if (state.interactive) return false;
            const distance = G.distance(x, y, state.x, state.y);
            return distance < state.radius;
        });

        if (x > width || x < 0) isDone = true;
        if (y > height || y < 0) isDone = true;
    }

    function done() {
        return isDone;
    }

    function draw() {
        G.line(ctx, x, y, x + dx, y + dy, "white", 2);
    }

    return { update, draw, done };

}

export function Shots(ctx) {
    let shots = [];
    let players = {}, moveables;

    function add(s) {
        shots.push(s);
    }

    function setMoveables(m) {
        moveables = m;
    }

    function addPlayer(ship) {
        players[ship.playerID] = ship;
    }

    function update() {
        for (let s of shots) {
            s.update(players, moveables)
        }
        shots = shots.filter(el => el.done() === false);
    }

    function draw() {
        for (let s of shots) {
            s.draw();
        }
    }

    return { add, update, draw, addPlayer, setMoveables };
}

export function Ship(ctx, x, y, color, shots, src, insideCB) {
    let that = Moveable(ctx, x, y, 0, 0, 15, 3, "ship", color, true);
    that.insideCB = insideCB;
    that.playerID = color;

    const baseHit = that.setHit;
    const baseDraw = that.draw;

    const imgDraw = G.image(ctx, src, 30);

    that.shoot = function () {
        let { x, y, alpha, collideCounter } = that.getState();
        if (collideCounter < 1)
            shots.add(Shot(ctx, x, y, alpha, that.playerID));
    }

    that.draw = function () {
        let { x, y, alpha } = that.getState();
        baseDraw();
        imgDraw(x, y, alpha);
    }


    that.setHit = function () {
        baseHit(40);
        console.log(`${that.playerID} is hit`);
    }

    shots.addPlayer(that);
    return that;
}

export function Player(graphics, moveables, shots, options) {
    const x = options.x;
    const y = options.y;

    const ctrl = controller();
    const ship = Ship(graphics.ctx, x, y, options.color, shots, options.imgsrc, options.callback);
    ctrl.setMoveable(ship);
    moveables.addMoveable(ship);

    graphics.addIO(ctrl);

    function draw(ctx) {
        G.circle(ctx, x, y, 30, options.color);
    }

    return { draw };

}