// import * as THREE from '../99_Lib/three.module.min.js';
import * as THREE from 'three';

import { mousecursor } from './mousecursor.mjs';
import { Interaction } from './interaction.mjs';
import { createScene, addGeometry, createArrow } from './environment.mjs';
import { Billboard } from './billboard.mjs';


console.log("ThreeJs mit VR Vorlesung", THREE.REVISION, new Date());



window.onload = function () {
    const { scene, camera, renderer, world } = createScene();
    const bill = Billboard(scene, "./background.png");
    bill.addLine(`ThreeJs ${THREE.REVISION}`)

    let cursor = addGeometry(1, scene);
    mousecursor(cursor);

    let objects = [];
    let x = -0.5, y = 0, z = 0, delta = 0.3;
    for (let i = 0; i < 5; ++i) {
        objects.push(addGeometry(i, world, x, y, z)); x += delta;
    }

    const UI = Interaction(renderer, scene, world, cursor, objects, bill);

    function render() {
        UI.interact();
        bill.printLines();
        renderer.render(scene, camera);
    }
    renderer.setAnimationLoop(render);
};
