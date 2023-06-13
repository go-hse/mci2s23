import * as THREE from '../99_Lib/three.module.min.js';
import { keyboard } from './keyboard.mjs';
import { createVRcontrollers } from './vr.mjs';
import { createLine, createArrow } from './environment.mjs';

function fmt(n) {
    return n % 1 === 0 ? n : n.toFixed(1);
}

export function Interaction(renderer, scene, world, cursor, objects, bill) {

    let position = new THREE.Vector3();
    let rotation = new THREE.Quaternion();
    let scale = new THREE.Vector3();
    let endRay = new THREE.Vector3();
    let direction = new THREE.Vector3();

    const raycaster = new THREE.Raycaster();

    let grabbed = false, squeezed = false;
    keyboard(" ", (state) => {
        console.log("grabbed", state);
        grabbed = state;
    });

    keyboard("s", (state) => {
        console.log("squeezed", state);
        squeezed = state;
    });

    let last_active_controller, last_active_inputsource;
    let { controller1, controller2 } = createVRcontrollers(scene, renderer, (current, src) => {
        // called if/when controllers connect
        cursor.matrixAutoUpdate = false;
        cursor.visible = false;
        last_active_controller = current;
        last_active_inputsource = src;
        console.log(`connected ${src.handedness} device`);
        renderer.xr.enabled = true;
    });

    let cursorFly = createArrow(scene, 0xff0000, 0.01, false);
    let cursorMove = createArrow(scene, 0x00ff00, 0.012, false);

    const lineFunc = createLine(scene);
    const flySpeedRotationFactor = 0.01;
    const flySpeedTranslationFactor = -0.02;


    let initialGrabbed, grabbedObject, hitObject, distance, inverseHand, inverseWorld;
    let differenceMatrix = new THREE.Matrix4();

    let deltaFlyRotation = new THREE.Quaternion();
    let buttonStr = "";

    function interact() {
        if (last_active_controller) {
            cursor.matrix.copy(last_active_controller.matrix);
            grabbed = controller1.controller.userData.isSelecting || controller2.controller.userData.isSelecting;
            squeezed = controller1.controller.userData.isSqueezeing || controller2.controller.userData.isSqueezeing;
            const gamepad = last_active_inputsource.gamepad;

            if (gamepad.buttons) {
                let bs = "";
                for (let i = 0; i < gamepad.buttons.length; ++i) {
                    const btn = gamepad.buttons[i].value;
                    bs += `${i}: ${fmt(btn)} `;
                }
                if (bs != buttonStr) {
                    buttonStr = bs;
                    bill.addLine(buttonStr);
                }

                if (gamepad.buttons[4].value) {
                    world.matrix.identity();
                }
            }

            bill.touch(gamepad.axes[2], gamepad.axes[3]);
            direction.set(0, 0, -1);
        } else {
            cursor.updateMatrix();
            direction.set(0, 1, 0);
        }

        // Zerlegung der Matrix des Cursors in Translation, Rotation und Skalierung
        cursor.matrix.decompose(position, rotation, scale);
        // Anwendung der CursorRotation auf Richtung
        direction.applyQuaternion(rotation);

        // Startpunkt des "Laserstrahls" im Cursor        
        lineFunc(0, position);

        if (grabbedObject === undefined) {
            raycaster.set(position, direction);
            const intersects = raycaster.intersectObjects(objects);

            if (intersects.length) {
                lineFunc(1, intersects[0].point);
                hitObject = intersects[0].object;
                distance = intersects[0].distance;
            } else {
                // Endpunkt des "Laserstrahls": Startpunkt ist Cursor-Position, 
                // Endpunkt berechnet aus Richtung und Startpunkt
                endRay.addVectors(position, direction.multiplyScalar(20));
                lineFunc(1, endRay);
                hitObject = undefined;
            }
        }

        if (grabbed) {
            if (grabbedObject) {
                endRay.addVectors(position, direction.multiplyScalar(distance));
                lineFunc(1, endRay);
                // grabbedObject.matrix.copy(cursor.matrix.clone().multiply(initialGrabbed));
                grabbedObject.matrix.copy(inverseWorld.clone().multiply(cursor.matrix).multiply(initialGrabbed));

            } else if (hitObject) {
                grabbedObject = hitObject;
                // initialGrabbed = cursor.matrix.clone().invert().multiply(grabbedObject.matrix);

                inverseWorld = world.matrix.clone().invert();
                initialGrabbed = cursor.matrix.clone().invert().multiply(world.matrix).multiply(grabbedObject.matrix);
            }
        } else {
            grabbedObject = undefined;
        }

        if (squeezed) {
            if (inverseHand !== undefined) {
                cursorMove.matrix.copy(cursor.matrix);
                let differenceHand = cursor.matrix.clone().multiply(inverseHand);
                differenceHand.decompose(position, rotation, scale);
                deltaFlyRotation.set(0, 0, 0, 1);
                deltaFlyRotation.slerp(rotation.conjugate(), flySpeedRotationFactor);
                differenceMatrix.compose(position.multiplyScalar(flySpeedTranslationFactor), deltaFlyRotation, scale);
                world.matrix.premultiply(differenceMatrix);
            } else {
                cursorFly.matrix.copy(cursor.matrix);
                inverseHand = cursor.matrix.clone().invert();
                cursorMove.visible = true;
                cursorFly.visible = true;
            }


        } else {
            inverseHand = undefined;
            cursorMove.visible = false;
            cursorFly.visible = false;
        }

    }

    return { interact };

}