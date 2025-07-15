import { CONSTANTS, Utils } from './utils.js';

export class NPC {
    constructor(id, position, city, scene) {
        this.id = id;
        this.city = city;
        this.scene = scene;
        this.position = position;

        this.speed = CONSTANTS.NPC_SPEED_MIN + Math.random() * (CONSTANTS.NPC_SPEED_MAX - CONSTANTS.NPC_SPEED_MIN);
        this.direction = new THREE.Vector3((Math.random() - 0.5) * 2, 0, (Math.random() - 0.5) * 2).normalize();
        this.lastDirectionChange = 0;
        this.directionChangeInterval = 3 + Math.random() * 7; // seconds

        this.createMesh();
    }

    createMesh() {
        const npcHeight = 1.8;
        // Use BoxGeometry instead of CapsuleGeometry to match the three.js version
        const geometry = new THREE.BoxGeometry(0.8, npcHeight, 0.5); 
        const color = Utils.getRandomColor(CONSTANTS.NPC_COLORS);
        const material = new THREE.MeshLambertMaterial({ color: color });
        this.mesh = new THREE.Mesh(geometry, material);

        this.mesh.position.copy(this.position);
        // Set position to be half the height above the ground
        this.mesh.position.y = npcHeight / 2; 
        this.mesh.castShadow = true;
        this.scene.add(this.mesh);
    }

    update(deltaTime) {
        this.lastDirectionChange += deltaTime;

        if (this.lastDirectionChange > this.directionChangeInterval) {
            this.direction.set((Math.random() - 0.5) * 2, 0, (Math.random() - 0.5) * 2).normalize();
            this.lastDirectionChange = 0;
        }

        const moveStep = this.speed * deltaTime;
        const nextPosition = this.position.clone().add(this.direction.clone().multiplyScalar(moveStep));

        if (this.isPositionValid(nextPosition)) {
            this.position.copy(nextPosition);
        } else {
            // If hitting a boundary or building, change direction
            this.direction.negate();
            this.position.add(this.direction.clone().multiplyScalar(moveStep));
        }

        // Clamp position to city bounds
        this.position.x = Utils.clamp(this.position.x, -CONSTANTS.CITY_SIZE, CONSTANTS.CITY_SIZE);
        this.position.z = Utils.clamp(this.position.z, -CONSTANTS.CITY_SIZE, CONSTANTS.CITY_SIZE);
        
        this.mesh.position.copy(this.position);
        this.mesh.position.y = 1.8 / 2; // Keep the mesh grounded correctly
    }

    isPositionValid(pos) {
        // Check city boundaries
        if (Math.abs(pos.x) > CONSTANTS.CITY_SIZE || Math.abs(pos.z) > CONSTANTS.CITY_SIZE) {
            return false;
        }

        // Check building collisions
        const buildings = this.city.getBuildings();
        for (const building of buildings) {
            const buildingBox = new THREE.Box3().setFromObject(building);
            if (buildingBox.containsPoint(pos)) {
                return false;
            }
        }
        return true;
    }
}
