export function initInteraction(ctx) {
    const canvas = ctx.canvas;
    let touches = {};
    let interactiveObjects = [];

    // Event-Handling
    canvas.addEventListener("touchstart", (evt) => {
        evt.preventDefault();

        // changedTouches: array; for X of Array: X: content;
        for (let t of evt.changedTouches) {
            // console.log(`start ${t.identifier} at ${t.pageX}, ${t.pageY}`);
            touches[t.identifier] = { x: t.pageX, y: t.pageY };
            for (let io of interactiveObjects) {
                io.isInside(ctx, t.identifier, t.pageX, t.pageY);
            }
        }
    }, { passive: false });

    canvas.addEventListener("touchmove", (evt) => {
        evt.preventDefault();
        for (let t of evt.changedTouches) {
            // console.log(`move ${t.identifier} at ${t.pageX}, ${t.pageY}`);
            touches[t.identifier] = { x: t.pageX, y: t.pageY };
            for (let io of interactiveObjects) {
                io.move(t.identifier, t.pageX, t.pageY);
            }
        }
    }, { passive: false });

    canvas.addEventListener("touchend", (evt) => {
        evt.preventDefault();
        for (let t of evt.changedTouches) {
            // console.log(`end ${t.identifier} at ${t.pageX}, ${t.pageY}`);
            delete touches[t.identifier];
            for (let io of interactiveObjects) {
                io.reset(t.identifier);
            }
        }
    }, { passive: false });

    function addInteractiveObject(o) {
        interactiveObjects.push(o);
    }

    // cb (übergebene Funktion): Aufruf für jeden Touch-Punkt 
    function forEachTouchFunction(cb) {
        // touches ist Object; for X of Object: X: ist Attribut
        for (let t in touches) {
            // Übergabe an Callback: t: identifier, x/y-Koordinaten
            cb(t, touches[t].x, touches[t].y);
        }
    }

    return { addInteractiveObject, forEachTouchFunction };
}