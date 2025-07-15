import { CONSTANTS, Utils } from './utils.js';

export class City {
    constructor(scene) {
        this.scene = scene;
        this.buildings = [];
        this.roads = [];
    }

    generate() {
        this.clearCity();
        this.createGroundPlane();

        const gridSize = CONSTANTS.CITY_SIZE / CONSTANTS.BLOCK_SIZE;

        for (let i = -gridSize; i <= gridSize; i++) {
            for (let j = -gridSize; j <= gridSize; j++) {
                const x = i * CONSTANTS.BLOCK_SIZE;
                const z = j * CONSTANTS.BLOCK_SIZE;

                // Create roads on a grid pattern
                if (i % 3 === 0 || j % 3 === 0) {
                    // This space is for roads, no building
                } else {
                     if (Math.random() > 0.1) { // 90% chance of a building
                        this.createBuilding(x, z);
                    }
                }
            }
        }
    }

    createGroundPlane() {
        const groundSize = CONSTANTS.CITY_SIZE * 2;
        const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize);
        const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x556B2F });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.05;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Simple road grid texture
        const roadTexture = new THREE.GridHelper(groundSize, groundSize / CONSTANTS.BLOCK_SIZE, 0x000000, 0x000000);
        roadTexture.position.y = 0;
        this.scene.add(roadTexture);
    }

    createBuilding(x, z) {
        const height = Math.random() * 20 + 10;
        const width = CONSTANTS.BLOCK_SIZE * (0.6 + Math.random() * 0.3);
        const depth = CONSTANTS.BLOCK_SIZE * (0.6 + Math.random() * 0.3);

        const geometry = new THREE.BoxGeometry(width, height, depth);
        const color = Utils.getRandomColor(CONSTANTS.BUILDING_COLORS);
        const material = new THREE.MeshLambertMaterial({ color: color });
        const building = new THREE.Mesh(geometry, material);

        building.position.set(x, height / 2, z);
        building.castShadow = true;
        building.receiveShadow = true;

        this.scene.add(building);
        this.buildings.push(building);
    }

    clearCity() {
        this.buildings.forEach(building => this.scene.remove(building));
        this.roads.forEach(road => this.scene.remove(road));
        this.buildings = [];
        this.roads = [];
    }

    getBuildings() {
        return this.buildings;
    }

    findValidPositions(count) {
        const positions = [];
        const attempts = count * 5; // Try more times than needed

        for (let i = 0; i < attempts && positions.length < count; i++) {
            const x = (Math.random() - 0.5) * (CONSTANTS.CITY_SIZE * 1.8);
            const z = (Math.random() - 0.5) * (CONSTANTS.CITY_SIZE * 1.8);
            const position = new THREE.Vector3(x, 0, z);

            let onBuilding = false;
            for (const building of this.buildings) {
                 const buildingBox = new THREE.Box3().setFromObject(building);
                 if (buildingBox.containsPoint(position)) {
                     onBuilding = true;
                     break;
                 }
            }
            if (!onBuilding) {
                positions.push(position);
            }
        }
        return positions;
    }
}
