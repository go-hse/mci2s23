import * as THREE from '../99_Lib/three.module.min.js';
console.log("ThreeJs " + THREE.REVISION);

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

function add(i, parent, x = 0, y = 0, z = 0) {
    let object = new THREE.Mesh(geometries[i], randomMaterial());
    object.position.set(x, y, z);
    parent.add(object);
    return object;
}


window.onload = function () {
    let scene = new THREE.Scene();
    // 
    scene.add(new THREE.HemisphereLight(0x808080, 0x606060));
    let light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 2, 0);
    scene.add(light);
    //
    let camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 1);
    scene.add(camera);
    // 

    let cursor = add(1, scene);
    let mousebuttons = [false, false, false, false, false];

    const movescale = 0.002;
    // event listener
    function onMouseMove(ev) {
        const dx = ev.movementX * movescale;
        const dy = ev.movementY * movescale;

        const rot = ev.ctrlKey;

        if (!rot && mousebuttons[0]) {
            cursor.position.x += dx;
            cursor.position.y -= dy;
        }

        if (rot && mousebuttons[0]) {
            cursor.rotation.z += dx;
            cursor.rotation.x += dy;
        }


        if (mousebuttons[2]) {
            cursor.position.x += dx;
            cursor.position.z += dy;
        }

        // console.log(mousebuttons);
    }

    function onMouseDown(ev) {
        ev.preventDefault();
        mousebuttons[ev.button] = true;
    }

    function onMouseUp(ev) {
        ev.preventDefault();
        mousebuttons[ev.button] = false;
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("contextmenu", ev => {
        ev.preventDefault();
        ev.stopPropagation();
        return false;
    }, false);





    let renderer = new THREE.WebGLRenderer({
        antialias: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    function render() {
        renderer.render(scene, camera);
    }
    renderer.setAnimationLoop(render);
};
