import * as THREE from 'three';
import { eventbus } from './eventbus.mjs';

export function g_date(d) {
	let yyyy = d.getFullYear().toString();
	let mm = (d.getMonth() + 1).toString().padStart(2, '0'); // getMonth() is zero-based
	let dd = d.getDate().toString().padStart(2, '0');
	let hh = d.getHours().toString().padStart(2, '0');
	let mi = d.getMinutes().toString().padStart(2, '0');
	let sc = d.getSeconds().toString().padStart(2, '0');
	return `${dd}.${mm}.${yyyy} ${hh}:${mi}:${sc}`;
}

function image(context, src, sc) {
	let img = new Image();
	img.src = src;
	let ratio = 0;

	img.addEventListener('load', () => {
		ratio = img.naturalWidth / img.naturalHeight;
		eventbus.publish("addline", `image ${src}`)
	});

	return (x, y, angle) => {
		if (ratio > 0) {
			console.log("ratio", ratio);
			context.save();
			context.translate(x, y);
			context.rotate(angle);
			context.scale(sc, sc);
			context.drawImage(img, 0, 0);
			context.restore();
		}
	}
}


export function Billboard(scene, background) {
	let canvas = document.createElement("canvas");
	let context = canvas.getContext("2d");

	let drawBackground = background !== undefined ? image(context, background, 0.2) : undefined;

	const canvasSize = 256;
	canvas.width = canvasSize * 2;
	canvas.height = canvasSize;
	let touchX = 0,
		touchY = 0,
		radius = 10,
		posX = (canvasSize * 2) - (2 * radius),
		posY = 2 * radius;

	let material = new THREE.MeshBasicMaterial();
	material.map = new THREE.CanvasTexture(canvas);
	let mesh = new THREE.Mesh(new THREE.PlaneGeometry(10, 5, 1, 1), material);
	mesh.overdraw = true;
	mesh.doubleSided = true;
	mesh.position.set(0, 2, -7);

	// mesh.rotation.x = -Math.PI / 2;
	scene.add(mesh);
	const fontSize = 8;
	context.textAlign = "left";
	context.textBaseline = "middle";
	context.font = fontSize + "pt Monospace";
	context.strokeStyle = "white";
	let needsUpdate = false;
	let lines = [];
	const MAXLEN = Math.floor(canvas.height / (fontSize + 2));
	let counter = 0;

	function addLine(text) {
		let now = new Date();
		console.log(g_date(now) + ": " + text);
		needsUpdate = true;
		++counter;
		lines.unshift(counter.toString().padStart(3, '0') + ": " + text); // store in front
		if (lines.length > MAXLEN) {
			lines.pop(); // remove from back
		}
	};

	eventbus.subscribe("addline", (l) => {
		addLine(l);
	});

	function touch(x, y) {
		if (x !== touchX || y !== touchY) {
			needsUpdate = true;
			touchX = x;
			touchY = y;
		}
	};

	function clear() {
		lines = [];
		needsUpdate = true;
	};

	function printLines() {
		if (needsUpdate) {
			needsUpdate = false;
			context.fillStyle = "white";
			context.fillRect(0, 0, canvas.width, canvas.height);
			context.fillStyle = "black";

			if (drawBackground) {
				drawBackground(150, 10, 0);
			}
			for (let i = 0; i < lines.length; ++i) {
				context.fillText(lines[i], 5, fontSize + i * (fontSize + 2));
			}
			// outer circle
			context.beginPath();
			context.arc(posX, posY, radius * 2, 0, 2 * Math.PI);
			context.strokeStyle = '#000000';
			context.stroke();
			context.fillStyle = '#aaa';
			context.fill();
			// finger
			if (touchX > 0.3) context.fillStyle = '#f00';
			else if (touchX < -0.3) context.fillStyle = '#f0f';
			if (touchY > 0.3) context.fillStyle = '#0f0';
			if (touchY < -0.3) context.fillStyle = '#0ff';
			context.beginPath();
			context.arc(posX + (2 * radius * touchX), posY + (2 * radius * touchY), radius * 0.5, 0, 2 * Math.PI);
			context.strokeStyle = '#000000';
			context.stroke();
			context.fill();
			material.map.needsUpdate = true;
			material.needsUpdate = true;
		}
	};
	addLine(g_date(new Date()));
	return { addLine, touch, clear, printLines };
}
