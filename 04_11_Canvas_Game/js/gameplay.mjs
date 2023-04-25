import * as G from "./graphics.mjs";
import { controller } from "./controller.mjs";
import { Moveable } from "./moveable.mjs";
import { GameObjects } from "./gameobjects.mjs";

const SHOT_SPEED = 4;

function Shot(ctx, x, y, alpha, myPlayerID) {
    const dx = SHOT_SPEED * Math.cos(alpha);
    const dy = SHOT_SPEED * Math.sin(alpha);
    let isDone = false;

    console.log("shot", myPlayerID);
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

export function Ship(ctx, x, y, playerID, color, shots, src, insideCB) {
    let hasFlag = false;
    const radius = 15;
    const mass = 5;
    let that = Moveable(ctx, x, y, 0, 0, radius, mass, "ship", color, true);
    that.insideCB = insideCB;
    that.playerID = playerID;

    const baseHit = that.setHit;
    const baseDraw = that.draw;
    const baseState = that.getState;

    const imgDraw = G.image(ctx, src, 30);

    that.shoot = function () {
        let { x, y, alpha, collideCounter } = that.getState();
        if (collideCounter < 1)
            shots.add(Shot(ctx, x, y, alpha, that.playerID));
    }

    that.draw = function () {
        let { x, y, alpha } = that.getState();
        if (hasFlag) {
            that.setColor("orange");
        } else {
            that.setColor(color);
        }
        baseDraw();
        imgDraw(x, y, alpha);
    }

    that.setFlag = function (b) {
        hasFlag = b;
    }

    that.getState = function () {
        let state = baseState();
        state.hasFlag = hasFlag;
        return state;
    }

    that.setHit = function () {
        baseHit(100);
        hasFlag = false;
    }

    shots.addPlayer(that);
    return that;
}

export function Player(graphics, moveables, shots, options) {
    const x = options.x;
    const y = options.y;
    const playerID = GameObjects.add({ isInside, getState, setFlag, color: options.color }, "player");

    const ctrl = controller();
    const ship = Ship(graphics.ctx, x, y, `player ${playerID}`, options.color, shots, options.imgsrc, options.callback);
    ctrl.setMoveable(ship);
    moveables.addMoveable(ship);
    graphics.addIO(ctrl);


    const baseRadius = 30;
    function draw(ctx) {
        G.circle(ctx, x, y, baseRadius, options.color);
    }

    function isInside(ex, ey) {
        return G.distance(x, y, ex, ey) < baseRadius;
    }

    function getState() {
        return ship.getState();
    }

    function setFlag(b) {
        ship.setFlag(b);
    }

    return { draw };

}

export function Logic() {
    const players = GameObjects.all("player");
    const p1 = players[0];
    const p2 = players[1];

    let p1score = 0, p2score = 0;

    function update() {
        {
            let { x, y, hasFlag } = p1.getState();
            let insideBase = p2.isInside(x, y);
            if (insideBase) {
                p1.setFlag(true);
            }

            insideBase = p1.isInside(x, y);
            if (insideBase && hasFlag) {
                ++p1score;
                p1.setFlag(false);
            }
        }
        {
            let { x, y, hasFlag } = p2.getState();
            let insideBase = p1.isInside(x, y);
            if (insideBase) {
                p2.setFlag(true);
            }
            insideBase = p2.isInside(x, y);
            if (insideBase && hasFlag) {
                ++p2score;
                p2.setFlag(false);
            }
        }
    }

    function back(ctx) {
        ctx.font = "20px Arial";
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = p1.color;
        ctx.fillRect(0, ctx.canvas.height / 2, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = p2.color;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height / 2);
        ctx.globalAlpha = 1;
    }

    function draw(ctx) {
        ctx.fillStyle = p1.color;
        ctx.fillRect(10, 30, 10, 10);
        ctx.fillStyle = p2.color;
        ctx.fillRect(48, 30, 10, 10);

        ctx.fillStyle = "white";
        ctx.fillText(`${p1score}:${p2score}`, 20, 40);
    }


    return { update, draw, back };
}