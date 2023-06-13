import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';


let geometries = [
    new THREE.BoxGeometry(0.25, 0.25, 0.25),
    new THREE.ConeGeometry(0.1, 0.4, 64),
    new THREE.CylinderGeometry(0.2, 0.2, 0.2, 64),
    new THREE.IcosahedronGeometry(0.2, 3),
    new THREE.TorusKnotGeometry(.2, .03, 50, 16),
    new THREE.TorusGeometry(0.2, 0.04, 64, 32)
];

function randomMaterial() {
    return new THREE.MeshStandardMaterial({
        color: Math.random() * 0xff3333,
        roughness: 0.7,
        metalness: 0.0
    });
}

export function addGeometry(i, parent, x = 0, y = 0, z = 0, matrixAutoUpdate = false) {
    let object = new THREE.Mesh(geometries[i], randomMaterial());
    object.position.set(x, y, z);
    object.updateMatrix();
    object.matrixAutoUpdate = matrixAutoUpdate;
    parent.add(object);
    return object;
}



export function createScene() {
    let scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0x808080, 0x606060));
    let light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(4, 16, 5);
    light.castShadow = true;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    scene.add(light);

    let camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 2);
    scene.add(camera);

    let renderer = new THREE.WebGLRenderer({
        antialias: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    document.body.appendChild(renderer.domElement);
    document.body.appendChild(VRButton.createButton(renderer));

    let world = new THREE.Group();
    world.matrixAutoUpdate = false;
    world.rotation.y = Math.PI;
    world.position.z = -1;
    world.updateMatrix();
    scene.add(world);
    boxesWithPlane(world);

    return { scene, camera, renderer, world };
}

export function boxesWithPlane(parent, noOfBoxes = 100) {
    for (let i = 0; i < noOfBoxes; ++i) {
        let height = Math.random() + 0.1;
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
    }

    let plane = new THREE.Mesh(new THREE.PlaneGeometry(20, 20, 10), new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
    plane.receiveShadow = true;
    plane.position.set(0, -1, 0);
    plane.rotation.x = Math.PI / 2;
    parent.add(plane);
}


export function createLine(scene) {
    const material = new THREE.LineBasicMaterial({ color: 0xffffff });
    const points = [];
    points.push(new THREE.Vector3(0, 0, 0));
    points.push(new THREE.Vector3(0, 1, 0));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const line = new THREE.Line(geometry, material);
    scene.add(line);

    const position = line.geometry.attributes.position.array;

    return (idx, pos) => {
        idx *= 3;
        position[idx++] = pos.x;
        position[idx++] = pos.y;
        position[idx++] = pos.z;
        line.geometry.attributes.position.needsUpdate = true;
    }
}


export function createArrow(parent, color = 0xff0000, size = 0.01, visible = true) {
    let shape = new THREE.Shape();
    shape.moveTo(-size, -4 * size);
    shape.lineTo(size, -4 * size);
    shape.lineTo(size, size);
    shape.lineTo(2 * size, size);
    shape.lineTo(0, 3 * size);
    shape.lineTo(-2 * size, size);
    shape.lineTo(-size, size);

    const config = {
        steps: 4,
        depth: size / 2,
        bevelEnabled: true,
        bevelThickness: size / 10,
        bevelSize: size,
        bevelOffset: 0,
        bevelSegments: 1
    };
    let geo = new THREE.ExtrudeGeometry(shape, config);
    let mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ color, transparent: true, opacity: 0.5 }));
    mesh.rotation.x = -Math.PI / 2;
    let grp = new THREE.Group();
    grp.matrixAutoUpdate = false;
    grp.add(mesh);
    parent.add(grp);

    grp.visible = visible;
    return grp;
}
