import { Player } from './player.js';
import { City } from './city.js';
import { NPC } from './npc.js';
import { ChatManager } from './chat.js';
import { MiniPanel } from './mini-panel.js';
import { CONSTANTS } from './utils.js';

class Game {
    constructor() {
        // Core Components
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas'), antialias: true });
        this.clock = new THREE.Clock();

        // Game Systems
        this.city = new City(this.scene);
        this.player = new Player(this.scene, this.city, this.camera);
        this.npcs = [];
        this.chatManager = new ChatManager(this);
        this.miniPanel = new MiniPanel(this);

        // Game State
        this.gameState = 'menu'; // menu, playing, chatting
        this.isPointerLocked = false;

        this.init();
    }

    async init() {
        this.setupRenderer();
        this.setupLighting();
        this.setupEventListeners();
        this.loadSettings();

        // Show AI model loading screen and handle potential failure
        document.getElementById('modelLoading').style.display = 'flex';
        try {
            await this.chatManager.initialize();
        } catch (error) {
            console.error("Fatal error during AI model initialization:", error);
            // Alert the user but allow the game to proceed without chat functionality
            alert("Could not load the AI model. The game will run without NPC chat.");
        } finally {
            document.getElementById('modelLoading').style.display = 'none';
        }


        console.log("Game Initialized");
    }

    setupRenderer() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.scene.background = new THREE.Color(0x87CEEB);
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.left = -CONSTANTS.CITY_SIZE;
        directionalLight.shadow.camera.right = CONSTANTS.CITY_SIZE;
        directionalLight.shadow.camera.top = CONSTANTS.CITY_SIZE;
        directionalLight.shadow.camera.bottom = -CONSTANTS.CITY_SIZE;
        this.scene.add(directionalLight);
    }

    setupEventListeners() {
        window.addEventListener('resize', this.onWindowResize.bind(this));
        document.getElementById('startButton').addEventListener('click', this.start.bind(this));

        // Settings Panel
        document.getElementById('settingsButton').addEventListener('click', () => this.toggleSettings(true));
        document.getElementById('closeSettingsButton').addEventListener('click', () => this.toggleSettings(false));
        document.getElementById('saveSettingsButton').addEventListener('click', this.saveSettings.bind(this));
        document.getElementById('resetSettingsButton').addEventListener('click', this.resetSettings.bind(this));

        // Pointer Lock
        document.addEventListener('click', () => {
            if (this.gameState === 'playing' && !this.isPointerLocked) {
                document.body.requestPointerLock();
            }
        });

        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement === document.body;
        });

        // Keyboard and Mouse
        document.addEventListener('keydown', (e) => this.player.setKey(e.key, true));
        document.addEventListener('keyup', (e) => {
            this.player.setKey(e.key, false);
            if (e.key === 'e' || e.key === 'E') this.interactWithNPC();
            if (e.key === 'Escape') this.endConversation();
        });
        document.addEventListener('mousemove', (e) => {
            if (this.isPointerLocked) {
                this.player.updateRotation(e.movementX, e.movementY);
            }
        });
    }

    start() {
        this.gameState = 'playing';
        document.getElementById('mainMenu').classList.add('hidden');
        document.getElementById('controlsInfo').style.display = 'block';

        this.city.generate();
        this.player.create();
        this.spawnNPCs(CONSTANTS.NPC_COUNT);

        this.miniPanel.show();
        this.animate();
    }

    spawnNPCs(count) {
        const validPositions = this.city.findValidPositions(count);
        for (let i = 0; i < count; i++) {
            const id = `npc_${i}`;
            const position = validPositions[i] || new THREE.Vector3((Math.random() - 0.5) * CONSTANTS.CITY_SIZE, 0, (Math.random() - 0.5) * CONSTANTS.CITY_SIZE);
            const npc = new NPC(id, position, this.city, this.scene);
            this.npcs.push(npc);
        }
    }

    interactWithNPC() {
        if (this.gameState !== 'playing') return;

        // Check if chat is even available
        if (!this.chatManager.isModelLoaded) {
            // A subtle way to inform the player without an alert
            console.warn("AI model not loaded, cannot start conversation.");
            return;
        }

        const playerPos = this.player.getPosition();
        for (const npc of this.npcs) {
            const npcPos = npc.position;
            if (playerPos.distanceTo(npcPos) < CONSTANTS.CONVERSATION_DISTANCE) {
                this.startConversation(npc);
                break;
            }
        }
    }

    startConversation(npc) {
        this.gameState = 'chatting';
        document.exitPointerLock();
        this.chatManager.startConversation(npc);
    }

    endConversation() {
        if (this.gameState === 'chatting') {
            this.chatManager.endConversation();
            this.gameState = 'playing';
        }
    }

    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('blockWalkersSettings')) || {};
        const defaults = {
            prompt1: "You are a friendly resident of Block Walkers city. You are helpful and love to chat about the city. Keep your responses short and conversational.",
            prompt2: "You are a mysterious stranger in Block Walkers city. You speak in cryptic and thought-provoking sentences. Keep your responses brief.",
            prompt3: "You are an official city guide for Block Walkers. You are enthusiastic and knowledgeable about all the landmarks and secrets of the city. Keep your responses concise."
        };

        this.prompts = [
            settings.prompt1 || defaults.prompt1,
            settings.prompt2 || defaults.prompt2,
            settings.prompt3 || defaults.prompt3,
        ];

        document.getElementById('prompt1').value = this.prompts[0];
        document.getElementById('prompt2').value = this.prompts[1];
        document.getElementById('prompt3').value = this.prompts[2];
    }

    saveSettings() {
        const settings = {
            prompt1: document.getElementById('prompt1').value,
            prompt2: document.getElementById('prompt2').value,
            prompt3: document.getElementById('prompt3').value,
        };
        localStorage.setItem('blockWalkersSettings', JSON.stringify(settings));
        this.loadSettings();
        this.toggleSettings(false);
        alert("Settings Saved!");
    }

    resetSettings() {
        if (confirm("Are you sure you want to reset settings to default?")) {
            localStorage.removeItem('blockWalkersSettings');
            this.loadSettings();
        }
    }

    toggleSettings(show) {
        const settingsPanel = document.getElementById('settingsPanel');
        settingsPanel.style.display = show ? 'flex' : 'none';
        if (show && this.gameState === 'playing') {
             this.gameState = 'menu';
             document.exitPointerLock();
        } else if (!show && this.gameState === 'menu') {
            this.gameState = 'playing';
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        const deltaTime = this.clock.getDelta();

        if (this.gameState === 'playing') {
            this.player.update(deltaTime);
            this.npcs.forEach(npc => npc.update(deltaTime));
        }

        this.renderer.render(this.scene, this.camera);
        this.miniPanel.update(this.renderer.info.render.frame);
    }
}

// Initialize the game when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
