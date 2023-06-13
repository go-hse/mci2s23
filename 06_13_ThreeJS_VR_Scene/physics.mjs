import * as THREE from '../99_Lib/three.module.min.js';
import { AmmoPhysics } from '../99_Lib/AmmoPhysics.js';

function load(filepath) {
    return new Promise(function (resolve, reject) {
        const script = document.createElement('script');
        script.src = filepath;
        script.async = true;
        script.onload = () => { console.log('Script loaded successfuly', script.src); resolve(); };
        script.onerror = () => { reject(`could not load ${filepath}`) };
        document.body.appendChild(script);
    });
}

export async function initPhysics() {
    try {
        await load('../99_Lib/ammo.wasm.js');
        let physics = await AmmoPhysics();
        console.log("Loaded physics")
        return physics;
    } catch (ex) {
        console.log(`error: ${ex.message}`)
    }
}


export function boxesWithPlane(parent, physics, noOfBoxes = 100) {
    for (let i = 0; i < noOfBoxes; ++i) {
        let height = Math.random() + 0.1;
        // let height = 0.8;
        let box = new THREE.Mesh(new THREE.BoxGeometry(0.1, height, 0.1), new THREE.MeshStandardMaterial({
            color: 0x1e13f0,
            roughness: 0.7,
            metalness: 0.0,
        }));
        box.position.x = Math.random() * 5 - 2.5;
        box.position.y = Math.random() * 0.1 - 1.01;
        box.position.z = Math.random() * 5 - 2.5;
        box.castShadow = true;
        parent.add(box);
        physics.addMesh(box);
    }

    const floor = new THREE.Mesh(
        new THREE.BoxGeometry(5, 3, 5),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    floor.position.y = - 2.5;
    floor.receiveShadow = true;
    parent.add(floor);
    physics.addMesh(floor);
}


export function boxes2Grab(parent, physics, noOfBoxes = 100) {
    let boxes = [];

    for (let i = 0; i < noOfBoxes; i++) {
        let height = Math.random() + 0.1;
        let box = new THREE.Mesh(new THREE.BoxGeometry(0.1, height, 0.1), new THREE.MeshStandardMaterial({
            color: 0x1e13f0,
            roughness: 0.7,
            metalness: 0.0,
        }));
        box.castShadow = true;
        box.receiveShadow = true;
        box.position.x = Math.random() - 0.5;
        box.position.y = Math.random() * 0.5;
        box.position.z = Math.random() - 0.5;
        box.rotation.x = Math.random() * Math.PI;
        box.rotation.z = Math.random() * Math.PI;

        box.updateMatrix();
        box.matrixAutoUpdate = false;

        // box.material.color.setHex(0xffffff * Math.random());
        box.material.color.setHex(0xffff00);
        parent.add(box);
        physics.addMesh(box, 0.5);
        boxes.push(box);
    }

    return boxes;
}

