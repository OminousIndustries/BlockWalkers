import { CONSTANTS, Utils } from './utils.js';

export class Player {
    constructor(scene, city, camera) {
        this.scene = scene;
        this.city = city;
        this.camera = camera;
        this.mesh = null;

        // Movement
        this.moveDirection = new THREE.Vector3();
        this.speed = CONSTANTS.PLAYER_SPEED;
        this.keys = {};

        // Camera
        this.cameraHeight = 1.6;
        this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
        this.minPolarAngle = 0; // radians
        this.maxPolarAngle = Math.PI; // radians
    }

    create() {
        // The mesh is an invisible group that holds the camera
        const playerGroup = new THREE.Group();
        playerGroup.position.set(0, this.cameraHeight, 5);
        this.mesh = playerGroup;
        this.scene.add(this.mesh);
        this.mesh.add(this.camera);
    }

    setKey(key, isPressed) {
        this.keys[key.toLowerCase()] = isPressed;
    }

    updateRotation(movementX, movementY) {
        const sensitivity = 0.002;
        this.euler.y -= movementX * sensitivity;
        this.euler.x -= movementY * sensitivity;
        this.euler.x = Math.max(Math.PI / 2 - this.maxPolarAngle, Math.min(Math.PI / 2 - this.minPolarAngle, this.euler.x));
        this.camera.quaternion.setFromEuler(this.euler);
    }

    update(deltaTime) {
        if (!this.mesh) return;

        // Calculate forward/backward and strafe directions
        const forward = this.keys['w'] ? 1 : (this.keys['s'] ? -1 : 0);
        // Corrected strafe logic: 'a' is -1, 'd' is 1
        const strafe = this.keys['d'] ? 1 : (this.keys['a'] ? -1 : 0);

        // Get the direction the camera is facing on the horizontal plane
        const cameraDirection = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0;
        cameraDirection.normalize();

        // Calculate the strafe direction (the "right" vector)
        const strafeDirection = new THREE.Vector3().crossVectors(this.camera.up, cameraDirection).negate();

        // Calculate the final movement vector
        this.moveDirection.set(0, 0, 0);
        this.moveDirection.add(cameraDirection.multiplyScalar(forward));
        this.moveDirection.add(strafeDirection.multiplyScalar(strafe));

        // Normalize to prevent faster diagonal movement
        if (this.moveDirection.length() > 0) {
            this.moveDirection.normalize();
        }

        // Apply movement
        const moveDistance = this.speed * deltaTime;
        this.mesh.position.add(this.moveDirection.multiplyScalar(moveDistance));
        
        // Collision detection and boundary clamping
        this.checkCollision();
        this.mesh.position.x = Utils.clamp(this.mesh.position.x, -CONSTANTS.CITY_SIZE, CONSTANTS.CITY_SIZE);
        this.mesh.position.z = Utils.clamp(this.mesh.position.z, -CONSTANTS.CITY_SIZE, CONSTANTS.CITY_SIZE);
        this.mesh.position.y = this.cameraHeight; // Ensure player doesn't fly
    }

    checkCollision() {
        const playerPosition = this.mesh.position;
        const buildings = this.city.getBuildings();
        const playerRadius = 0.5;

        for (const building of buildings) {
            const buildingBox = new THREE.Box3().setFromObject(building);
            const closestPoint = buildingBox.clampPoint(playerPosition, new THREE.Vector3());
            const distance = playerPosition.distanceTo(closestPoint);

            if (distance < playerRadius) {
                const overlap = playerRadius - distance;
                const direction = playerPosition.clone().sub(closestPoint).normalize();
                this.mesh.position.add(direction.multiplyScalar(overlap));
            }
        }
    }

    getPosition() {
        return this.mesh ? this.mesh.position : new THREE.Vector3();
    }
}
