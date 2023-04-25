// import { initGraphics } from "./js/graphics.mjs";
import * as G from "./js/graphics.mjs";
import { Moveables } from "./js/moveable.mjs";
import { Shots, Player, Logic } from "./js/gameplay.mjs";

window.onload = function () {
    const graphics = G.initGraphics();
    const shots = Shots(graphics.ctx);
    const moveables = Moveables(graphics.ctx, 25);

    let players = [];

    players.push(Player(graphics, moveables, shots, {
        x: 20, y: graphics.ctx.canvas.height - 20, color: "red", imgsrc: "./img/ship_64_r.png", callback: (ctx, ti, tx, ty) => {
            return ty > ctx.canvas.height * 0.5;
        }
    }));

    players.push(Player(graphics, moveables, shots, {
        x: graphics.ctx.canvas.width - 20, y: 20, color: "green", imgsrc: "./img/ship_64_g.png", callback: (ctx, ti, tx, ty) => {
            return ty < ctx.canvas.height * 0.5;
        }
    }));

    shots.setMoveables(moveables);
    const logic = Logic();


    function draw(ctx, deltaTime) {
        logic.update();
        logic.back(ctx);
        for (let p of players) {
            p.draw(ctx);
        }
        shots.update();
        moveables.update(deltaTime / 10);
        moveables.draw();
        shots.draw();
        logic.draw(ctx);
    }
    graphics.setDrawCallback(draw);
    graphics.mainloop();
}

