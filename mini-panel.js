export class MiniPanel {
    constructor(game) {
        this.game = game;
        this.isVisible = false;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.createPanel();
        this.setupEventListeners();
    }

    createPanel() {
        const panel = document.createElement('div');
        panel.id = 'miniPanel';
        panel.style.cssText = `
            position: fixed; top: 20px; left: 20px; width: 250px; background: rgba(0,0,0,0.8);
            color: white; border-radius: 8px; font-family: monospace; font-size: 12px;
            z-index: 1001; user-select: none; display: none; backdrop-filter: blur(5px);
        `;

        panel.innerHTML = `
            <div id="miniPanelHeader" style="padding: 8px; background: rgba(255,255,255,0.2); cursor: move; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                Block Walkers Status
            </div>
            <div style="padding: 8px;">
                <div>FPS: <span id="mp-fps">0</span></div>
                <div>Pos: <span id="mp-player-pos">X:0, Y:0, Z:0</span></div>
                <div>Nearby NPC: <span id="mp-npc-status">None</span></div>
                <div>Game State: <span id="mp-game-state">Menu</span></div>
            </div>
        `;
        document.body.appendChild(panel);
        this.panel = panel;

        // Cache DOM elements
        this.fpsEl = document.getElementById('mp-fps');
        this.posEl = document.getElementById('mp-player-pos');
        this.npcEl = document.getElementById('mp-npc-status');
        this.stateEl = document.getElementById('mp-game-state');
    }

    setupEventListeners() {
        const header = document.getElementById('miniPanelHeader');
        header.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.dragOffset.x = e.clientX - this.panel.offsetLeft;
            this.dragOffset.y = e.clientY - this.panel.offsetTop;
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.panel.style.left = `${e.clientX - this.dragOffset.x}px`;
                this.panel.style.top = `${e.clientY - this.dragOffset.y}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
    }

    show() {
        this.isVisible = true;
        this.panel.style.display = 'block';
    }

    hide() {
        this.isVisible = false;
        this.panel.style.display = 'none';
    }

    update(frameCount) {
        if (!this.isVisible) return;
        
        // FPS
        this.fpsEl.textContent = frameCount;

        // Player Position
        const pos = this.game.player.getPosition();
        this.posEl.textContent = `X:${pos.x.toFixed(0)}, Y:${pos.y.toFixed(0)}, Z:${pos.z.toFixed(0)}`;
        
        // Game State
        this.stateEl.textContent = this.game.gameState;

        // NPC Status
        let nearestNPC = 'None';
        let minDistance = Infinity;
        const playerPos = this.game.player.getPosition();

        for (const npc of this.game.npcs) {
            const distance = playerPos.distanceTo(npc.position);
            if (distance < minDistance) {
                minDistance = distance;
                nearestNPC = npc.id;
            }
        }
        
        if (minDistance < 3) {
             this.npcEl.textContent = `${nearestNPC} (Interact 'E')`;
        } else {
            this.npcEl.textContent = 'None';
        }
    }
}
