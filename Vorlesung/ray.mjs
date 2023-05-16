import * as THREE from '../99_Lib/three.module.min.js';


export function createLine(scene) {
    const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
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