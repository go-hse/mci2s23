import * as THREE from '../99_Lib/three.module.min.js';
console.log("ThreeJs " + THREE.REVISION);

let geometries = [
    new THREE.BoxBufferGeometry(0.25, 0.25, 0.25),
    new THREE.ConeBufferGeometry(0.2, 0.4, 64),
    new THREE.CylinderBufferGeometry(0.2, 0.2, 0.2, 64),
    new THREE.IcosahedronBufferGeometry(0.2, 3),
    new THREE.TorusKnotGeometry(.2, .03, 50, 16),
    new THREE.TorusBufferGeometry(0.2, 0.04, 64, 32)
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
    let box = new THREE.Mesh(new THREE.BoxBufferGeometry(0.2, 0.2, 0.2), new THREE.MeshStandardMaterial({
        color: 0xff3333,
        roughness: 0.7,
        metalness: 0.0,
    }));
    scene.add(box);
    // 

    let renderer = new THREE.WebGLRenderer({
        antialias: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    function render() {
        box.rotation.x += 0.01;
        box.rotation.y += 0.01;
        renderer.render(scene, camera);
    }
    renderer.setAnimationLoop(render);
};
