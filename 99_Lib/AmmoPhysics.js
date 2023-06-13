
// https://pybullet.org/wordpress/
// https://github.com/kripken/ammo.js/


async function AmmoPhysics() {
	if ('Ammo' in window === false) {
		console.error('AmmoPhysics: Couldn\'t find Ammo.js');
		return;
	}

	const AmmoLib = await Ammo(); // eslint-disable-line no-undef

	const frameRate = 60;

	const collisionConfiguration = new AmmoLib.btDefaultCollisionConfiguration();
	const dispatcher = new AmmoLib.btCollisionDispatcher(collisionConfiguration);
	const broadphase = new AmmoLib.btDbvtBroadphase();
	const solver = new AmmoLib.btSequentialImpulseConstraintSolver();
	const world = new AmmoLib.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
	world.setGravity(new AmmoLib.btVector3(0, - 9.8, 0));

	const worldTransform = new AmmoLib.btTransform();
	const btVectorDirection = new Ammo.btVector3(), btVectorPosition = new Ammo.btVector3();
	const btForce = new Ammo.btVector3(), btTorque = new Ammo.btVector3();

	//

	function getShape(geometry) {

		const parameters = geometry.parameters;

		// TODO change type to is*

		if (geometry.type === 'BoxGeometry') {
			const sx = parameters.width !== undefined ? parameters.width / 2 : 0.5;
			const sy = parameters.height !== undefined ? parameters.height / 2 : 0.5;
			const sz = parameters.depth !== undefined ? parameters.depth / 2 : 0.5;
			const shape = new AmmoLib.btBoxShape(new AmmoLib.btVector3(sx, sy, sz));
			shape.setMargin(0.05);
			return shape;

		} else if (geometry.type === 'SphereGeometry' || geometry.type === 'IcosahedronGeometry') {
			const radius = parameters.radius !== undefined ? parameters.radius : 1;
			const shape = new AmmoLib.btSphereShape(radius);
			shape.setMargin(0.05);
			return shape;
		}

		return null;

	}

	const meshes = [];
	const meshMap = new WeakMap();

	function addMesh(mesh, mass = 0) {
		const shape = getShape(mesh.geometry);
		if (shape !== null) {
			if (mesh.isInstancedMesh) {
				handleInstancedMesh(mesh, mass, shape);
			} else if (mesh.isMesh) {
				handleMesh(mesh, mass, shape);
			}
		}
	}


	/*
	https://n5ro.github.io/aframe-physics-system/AmmoDriver.html
	https://github.com/bulletphysics/bullet3
	https://pybullet.org/Bullet/BulletFull/annotated.html
	https://geckos.io/
	
	body.setActivationState(4);
	
	#define ACTIVE_TAG 1
	#define ISLAND_SLEEPING 2
	#define WANTS_DEACTIVATION 3
	#define DISABLE_DEACTIVATION 4
	#define DISABLE_SIMULATION 5
	#define FIXED_BASE_MULTI_BODY 6
		
	enum CollisionFlags
		{
			CF_DYNAMIC_OBJECT = 0,
			CF_STATIC_OBJECT = 1,
			CF_KINEMATIC_OBJECT = 2,
			CF_NO_CONTACT_RESPONSE = 4,
			CF_CUSTOM_MATERIAL_CALLBACK = 8,  //this allows per-triangle material (friction/restitution)
			CF_CHARACTER_OBJECT = 16,
			CF_DISABLE_VISUALIZE_OBJECT = 32,          //disable debug drawing
			CF_DISABLE_SPU_COLLISION_PROCESSING = 64,  //disable parallel/SPU processing
			CF_HAS_CONTACT_STIFFNESS_DAMPING = 128,
			CF_HAS_CUSTOM_DEBUG_RENDERING_COLOR = 256,
			CF_HAS_FRICTION_ANCHOR = 512,
			CF_HAS_COLLISION_SOUND_TRIGGER = 1024
		};
	
	*/

	function handleMesh(mesh, mass, shape) {

		const position = mesh.position;
		const quaternion = mesh.quaternion;

		const transform = new AmmoLib.btTransform();
		transform.setIdentity();
		transform.setOrigin(new AmmoLib.btVector3(position.x, position.y, position.z));
		transform.setRotation(new AmmoLib.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w));

		const motionState = new AmmoLib.btDefaultMotionState(transform);

		const localInertia = new AmmoLib.btVector3(0, 0, 0);
		shape.calculateLocalInertia(mass, localInertia);

		const rbInfo = new AmmoLib.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
		rbInfo.m_linearDamping = 1;
		rbInfo.m_angularDamping = 1;

		const body = new AmmoLib.btRigidBody(rbInfo);
		// body.setFriction( 4 );
		world.addRigidBody(body);

		if (mass > 0) {
			body.setCollisionFlags(0);
			body.setActivationState(4);
			mesh.physicalBody = body;
			meshes.push(mesh);
			meshMap.set(mesh, body);
		}


	}

	function handleInstancedMesh(mesh, mass, shape) {

		const array = mesh.instanceMatrix.array;

		const bodies = [];

		for (let i = 0; i < mesh.count; i++) {

			const index = i * 16;

			const transform = new AmmoLib.btTransform();
			transform.setFromOpenGLMatrix(array.slice(index, index + 16));

			const motionState = new AmmoLib.btDefaultMotionState(transform);

			const localInertia = new AmmoLib.btVector3(0, 0, 0);
			shape.calculateLocalInertia(mass, localInertia);

			const rbInfo = new AmmoLib.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);

			const body = new AmmoLib.btRigidBody(rbInfo);
			world.addRigidBody(body);

			bodies.push(body);

		}

		if (mass > 0) {
			meshes.push(mesh);
			meshMap.set(mesh, bodies);
		}

	}

	//

	function setMeshPosition(mesh, position, quaternion, index = 0) {
		if (mesh.isInstancedMesh) {
			const bodies = meshMap.get(mesh);
			const body = bodies[index];

			body.setAngularVelocity(new AmmoLib.btVector3(0, 0, 0));
			body.setLinearVelocity(new AmmoLib.btVector3(0, 0, 0));

			worldTransform.setIdentity();
			worldTransform.setOrigin(new AmmoLib.btVector3(position.x, position.y, position.z));
			body.setWorldTransform(worldTransform);

		} else if (mesh.isMesh) {
			const body = meshMap.get(mesh);
			body.setAngularVelocity(new AmmoLib.btVector3(0, 0, 0));
			body.setLinearVelocity(new AmmoLib.btVector3(0, 0, 0));
			worldTransform.setIdentity();
			worldTransform.setOrigin(new AmmoLib.btVector3(position.x, position.y, position.z));
			worldTransform.setRotation(new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w));
			body.setWorldTransform(worldTransform);
		}
	}

	/*
	void applyForce(const btVector3& force, const btVector3& rel_pos)
	{
		applyCentralForce(force);
		applyTorque(rel_pos.cross(force * m_linearFactor));
	}
	*/
	function applyForceTorque(body, force, torque) {
		btForce.setValue(force.x, force.y, force.z);
		body.applyCentralForce(btForce);

		btTorque.setValue(torque.x, torque.y, torque.z);
		body.applyTorque(btTorque);
	}


	function applyForce(body, direction, position) {
		btVectorDirection.setValue(direction.x, direction.y, direction.z);
		if (position) {
			btVectorPosition.setValue(position.x, position.y, position.z);
			body.applyForce(btVectorDirection, btVectorPosition)
		} else {
			body.applyCentralForce(btVectorDirection)
		}
	}



	//

	let lastTime = 0;

	function step() {

		const time = performance.now();

		if (lastTime > 0) {
			const delta = (time - lastTime) / 1000;
			world.stepSimulation(delta, 10);
		}

		lastTime = time;
		// console.log(meshes.length);

		//

		for (let i = 0, l = meshes.length; i < l; i++) {

			const mesh = meshes[i];
			if (mesh.isInstancedMesh) {

				const array = mesh.instanceMatrix.array;
				const bodies = meshMap.get(mesh);

				for (let j = 0; j < bodies.length; j++) {

					const body = bodies[j];

					const motionState = body.getMotionState();
					motionState.getWorldTransform(worldTransform);

					const position = worldTransform.getOrigin();
					const quaternion = worldTransform.getRotation();

					compose(position, quaternion, array, j * 16);

				}

				mesh.instanceMatrix.needsUpdate = true;

			} else if (mesh.isMesh) {

				const body = meshMap.get(mesh);
				const motionState = body.getMotionState();
				motionState.getWorldTransform(worldTransform);
				const ammo_position = worldTransform.getOrigin();
				const ammo_quaternion = worldTransform.getRotation();

				if (mesh.grabbed !== undefined)
					console.log(i, ammo_position.x(), ammo_position.y(), ammo_position.z());
				else {
					// console.log("update by ammo", i, ammo_position.x(), ammo_position.y(), ammo_position.z());
					mesh.position.set(ammo_position.x(), ammo_position.y(), ammo_position.z());
					mesh.quaternion.set(ammo_quaternion.x(), ammo_quaternion.y(), ammo_quaternion.z(), ammo_quaternion.w());
					mesh.updateMatrix();
				}

				// mesh.matrix.compose(position, quaternion, scale);
			}

		}

	}

	// animate

	setInterval(step, 1000 / frameRate);

	return {
		addMesh,
		setMeshPosition,
		applyForce,
		applyForceTorque
		// addCompoundMesh
	};

}

function compose(position, quaternion, array, index) {

	const x = quaternion.x(), y = quaternion.y(), z = quaternion.z(), w = quaternion.w();
	const x2 = x + x, y2 = y + y, z2 = z + z;
	const xx = x * x2, xy = x * y2, xz = x * z2;
	const yy = y * y2, yz = y * z2, zz = z * z2;
	const wx = w * x2, wy = w * y2, wz = w * z2;

	array[index + 0] = (1 - (yy + zz));
	array[index + 1] = (xy + wz);
	array[index + 2] = (xz - wy);
	array[index + 3] = 0;

	array[index + 4] = (xy - wz);
	array[index + 5] = (1 - (xx + zz));
	array[index + 6] = (yz + wx);
	array[index + 7] = 0;

	array[index + 8] = (xz + wy);
	array[index + 9] = (yz - wx);
	array[index + 10] = (1 - (xx + yy));
	array[index + 11] = 0;

	array[index + 12] = position.x();
	array[index + 13] = position.y();
	array[index + 14] = position.z();
	array[index + 15] = 1;

}

export { AmmoPhysics };
