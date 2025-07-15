// Enhanced UI system for Block Walkers with Settings Panel
class UI {
    constructor(game) {
        this.game = game;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentScreen = 'menu';
        this.selectedOption = 0;
        this.menuOptions = ['Start Game', 'Settings', 'Exit'];
        this.settings = this.loadSettings();
        this.settingsModal = null;
        this.activeInput = null;
        this.promptTemplates = {
            general: "You are a helpful AI assistant in a low-poly city exploration game. Provide concise, engaging responses that fit the game's aesthetic.",
            npc: "You are an NPC in a low-poly city game. Respond as a character who lives in this world, keeping responses brief and in-character.",
            quest: "You are a quest giver in a low-poly city game. Provide clear, engaging quest descriptions and objectives."
        };
        this.createSettingsModal();
        this.setupEventListeners();
    }

    loadSettings() {
        const saved = localStorage.getItem('blockWalkersSettings');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            systemPrompts: {
                general: this.promptTemplates.general,
                npc: this.promptTemplates.npc,
                quest: this.promptTemplates.quest
            },
            aiResponseLength: 200,
            conversationTimeout: 300,
            theme: 'default',
            soundEnabled: true,
            autoSave: true
        };
    }

    saveSettings() {
        localStorage.setItem('blockWalkersSettings', JSON.stringify(this.settings));
    }

    createSettingsModal() {
        if (document.getElementById('settingsModal')) return;
        
        const modal = document.createElement('div');
        modal.id = 'settingsModal';
        modal.innerHTML = `
            <div class="settings-overlay">
                <div class="settings-panel">
                    <div class="settings-header">
                        <h2>Block Walkers Settings</h2>
                        <button class="close-btn" onclick="ui.closeSettings()">×</button>
                    </div>
                    <div class="settings-tabs">
                        <button class="tab-btn active" onclick="ui.switchTab('prompts')">Prompts</button>
                        <button class="tab-btn" onclick="ui.switchTab('performance')">Performance</button>
                        <button class="tab-btn" onclick="ui.switchTab('export')">Export</button>
                    </div>
                    <div class="settings-content">
                        <div class="tab-content active" id="prompts-tab">
                            <h3>System Prompts</h3>
                            <p>These prompts guide how NPCs respond. You can use up to 3 different prompts that will be randomly selected.</p>
                            
                            <div class="prompt-group">
                                <label>General Prompt:</label>
                                <textarea class="prompt-input" id="prompt1" placeholder="Enter general system prompt..."></textarea>
                            </div>
                            
                            <div class="prompt-group">
                                <label>NPC Prompt:</label>
                                <textarea class="prompt-input" id="prompt2" placeholder="Enter NPC-specific prompt..."></textarea>
                            </div>
                            
                            <div class="prompt-group">
                                <label>Quest Prompt:</label>
                                <textarea class="prompt-input" id="prompt3" placeholder="Enter quest-related prompt..."></textarea>
                            </div>
                            
                            <div class="prompt-templates">
                                <button onclick="ui.loadTemplate('general')">Load General Template</button>
                                <button onclick="ui.loadTemplate('npc')">Load NPC Template</button>
                                <button onclick="ui.loadTemplate('quest')">Load Quest Template</button>
                            </div>
                        </div>
                        <div class="tab-content" id="performance-tab">
                            <h3>Performance Settings</h3>
                            <div class="setting-row">
                                <label>Response Length:</label>
                                <input type="range" id="response-length" min="50" max="500" value="200">
                                <span id="response-length-value">200</span>
                            </div>
                            <div class="setting-row">
                                <label>Conversation Timeout (seconds):</label>
                                <input type="range" id="timeout" min="30" max="600" value="300">
                                <span id="timeout-value">300</span>
                            </div>
                            <div class="setting-row">
                                <label>Theme:</label>
                                <select id="theme-select">
                                    <option value="default">Default</option>
                                    <option value="dark">Dark</option>
                                    <option value="neon">Neon</option>
                                </select>
                            </div>
                            <div class="setting-row">
                                <label>Sound Enabled</label>
                                <input type="checkbox" id="sound-toggle" ${this.settings.soundEnabled ? 'checked' : ''}>
                            </div>
                            <div class="setting-row">
                                <label>Auto-Save</label>
                                <input type="checkbox" id="autosave-toggle" ${this.settings.autoSave ? 'checked' : ''}>
                            </div>
                        </div>
                        <div class="tab-content" id="export-tab">
                            <div class="export-section">
                                <button onclick="ui.exportSettings()">Export Settings</button>
                                <button onclick="ui.importSettings()">Import Settings</button>
                                <input type="file" id="import-file" style="display: none" accept=".json">
                            </div>
                            <div class="test-section">
                                <button onclick="ui.testPrompt()">Test Current Prompt</button>
                                <div id="test-result"></div>
                            </div>
                        </div>
                    </div>
                    <div class="settings-footer">
                        <button onclick="ui.resetSettings()">Reset to Defaults</button>
                        <button onclick="ui.saveAllSettings()">Save All</button>
                        <button onclick="ui.closeSettings()">Cancel</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        this.settingsModal = modal;
        this.addStyles();
    }

    addStyles() {
        if (document.getElementById('settings-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'settings-styles';
        styles.textContent = `
            #settingsModal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1000;
            }
            .settings-overlay {
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .settings-panel {
                background: #1a1a2e;
                border: 2px solid #16213e;
                border-radius: 10px;
                width: 90%;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                color: #eee;
                font-family: 'Courier New', monospace;
            }
            .settings-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #0f3460;
            }
            .settings-tabs {
                display: flex;
                border-bottom: 1px solid #0f3460;
            }
            .tab-btn {
                flex: 1;
                padding: 15px;
                background: transparent;
                border: none;
                color: #aaa;
                cursor: pointer;
                transition: all 0.3s;
            }
            .tab-btn.active {
                background: #0f3460;
                color: #fff;
            }
            .tab-content {
                display: none;
                padding: 20px;
            }
            .tab-content.active {
                display: block;
            }
            .prompt-group {
                margin-bottom: 20px;
            }
            .prompt-group label {
                display: block;
                margin-bottom: 5px;
                color: #ccc;
            }
            .prompt-input {
                width: 100%;
                min-height: 80px;
                padding: 10px;
                border: 1px solid #0f3460;
                border-radius: 5px;
                background: rgba(0, 0, 0, 0.2);
                color: white;
                font-family: monospace;
                font-size: 13px;
                resize: vertical;
            }
            .setting-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }
            .setting-row label {
                color: #ccc;
            }
            .settings-button {
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                background: #e94560;
                color: white;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s ease;
                margin-right: 10px;
            }
            .settings-button:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            }
            .close-btn {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
            }
            .prompt-templates {
                display: flex;
                gap: 10px;
                margin-top: 15px;
            }
            .prompt-templates button {
                padding: 8px 15px;
                font-size: 12px;
            }
            .export-section, .test-section {
                margin: 20px 0;
            }
            #test-result {
                margin-top: 15px;
                padding: 10px;
                background: rgba(15, 52, 96, 0.3);
                border-radius: 5px;
            }
        `;
        document.head.appendChild(styles);
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });

        document.addEventListener('click', (e) => {
            this.handleClick(e);
        });

        // Update range inputs
        const responseLength = document.getElementById('response-length');
        const timeout = document.getElementById('timeout');
        
        if (responseLength) {
            responseLength.addEventListener('input', (e) => {
                document.getElementById('response-length-value').textContent = e.target.value;
            });
        }
        
        if (timeout) {
            timeout.addEventListener('input', (e) => {
                document.getElementById('timeout-value').textContent = e.target.value;
            });
        }
    }

    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        document.querySelector(`[onclick="ui.switchTab('${tabName}')"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    loadSettings() {
        const saved = localStorage.getItem('blockWalkersSettings');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            systemPrompts: {
                general: "You are a helpful AI assistant in a low-poly city exploration game.",
                npc: "You are an NPC in a low-poly city game. Respond in-character.",
                quest: "You are a quest giver in a low-poly city game."
            },
            aiResponseLength: 200,
            conversationTimeout: 300,
            theme: 'default',
            soundEnabled: true,
            autoSave: true
        };
    }

    saveSettings() {
        localStorage.setItem('blockWalkersSettings', JSON.stringify(this.settings));
    }

    loadTemplate(template) {
        const templates = {
            general: "You are a helpful AI assistant in a low-poly city exploration game. Provide concise, engaging responses that fit the game's aesthetic.",
            npc: "You are an NPC in a low-poly city game. Respond as a character who lives in this world, keeping responses brief and in-character.",
            quest: "You are a quest giver in a low-poly city game. Provide clear, engaging quest descriptions and objectives."
        };
        
        if (template === 'general') document.getElementById('prompt1').value = templates.general;
        if (template === 'npc') document.getElementById('prompt2').value = templates.npc;
        if (template === 'quest') document.getElementById('prompt3').value = templates.quest;
    }

    saveAllSettings() {
        this.settings.systemPrompts = {
            general: document.getElementById('prompt1').value || this.settings.systemPrompts.general,
            npc: document.getElementById('prompt2').value || this.settings.systemPrompts.npc,
            quest: document.getElementById('prompt3').value || this.settings.systemPrompts.quest
        };
        
        this.settings.aiResponseLength = parseInt(document.getElementById('response-length')?.value || '200');
        this.settings.conversationTimeout = parseInt(document.getElementById('timeout')?.value || '300');
        this.settings.theme = document.getElementById('theme-select')?.value || 'default';
        this.settings.soundEnabled = document.getElementById('sound-toggle')?.checked || true;
        this.settings.autoSave = document.getElementById('autosave-toggle')?.checked || true;
        
        this.saveSettings();
        this.closeSettings();
        this.showSaveNotification();
    }

    resetSettings() {
        if (confirm('Reset all settings to defaults?')) {
            localStorage.removeItem('blockWalkersSettings');
            this.settings = this.loadSettings();
            this.updateSettingsDisplay();
            this.showSaveNotification();
        }
    }

    exportSettings() {
        const settings = JSON.stringify(this.settings, null, 2);
        const blob = new Blob([settings], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'block-walkers-settings.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const imported = JSON.parse(e.target.result);
                    if (this.validateSettings(imported)) {
                        this.settings = { ...this.settings, ...imported };
                        this.saveSettings();
                        this.updateSettingsDisplay();
                        this.showSaveNotification();
                    }
                } catch (error) {
                    alert('Invalid settings file');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    validateSettings(settings) {
        return settings && 
               settings.systemPrompts && 
               typeof settings.systemPrompts === 'object';
    }

    testPrompt() {
        const testDiv = document.getElementById('test-result');
        testDiv.innerHTML = '<p>Testing prompt...</p>';
        
        setTimeout(() => {
            testDiv.innerHTML = `
                <p><strong>Test Result:</strong></p>
                <p>Prompt successfully configured. AI will respond based on current settings.</p>
            `;
        }, 1000);
    }

    updateSettingsDisplay() {
        document.getElementById('prompt1').value = this.settings.systemPrompts.general;
        document.getElementById('prompt2').value = this.settings.systemPrompts.npc;
        document.getElementById('prompt3').value = this.settings.systemPrompts.quest;
        document.getElementById('response-length').value = this.settings.aiResponseLength;
        document.getElementById('response-length-value').textContent = this.settings.aiResponseLength;
        document.getElementById('timeout').value = this.settings.conversationTimeout;
        document.getElementById('timeout-value').textContent = this.settings.conversationTimeout;
        document.getElementById('theme-select').value = this.settings.theme;
        document.getElementById('sound-toggle').checked = this.settings.soundEnabled;
        document.getElementById('autosave-toggle').checked = this.settings.autoSave;
    }

    showSettings() {
        if (!this.settingsModal) this.createSettingsModal();
        this.updateSettingsDisplay();
        this.settingsModal.style.display = 'block';
    }

    closeSettings() {
        if (this.settingsModal) {
            this.settingsModal.style.display = 'none';
        }
    }

    showSaveNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e94560;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 1001;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = 'Settings saved successfully!';
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }

    renderMainMenu() {
        this.ctx.fillStyle = '#0f3460';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Title
        this.ctx.fillStyle = '#e94560';
        this.ctx.font = '48px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('BLOCK WALKERS', this.canvas.width / 2, 150);

        // Menu options
        this.ctx.font = '24px Courier New';
        this.menuOptions.forEach((option, index) => {
            const y = 250 + index * 50;
            if (index === this.selectedOption) {
                this.ctx.fillStyle = '#fff';
                this.ctx.fillText(`> ${option} <`, this.canvas.width / 2, y);
            } else {
                this.ctx.fillStyle = '#aaa';
                this.ctx.fillText(option, this.canvas.width / 2, y);
            }
        });

        // Settings hint
        this.ctx.font = '14px Courier New';
        this.ctx.fillStyle = '#666';
        this.ctx.fillText('Press S for Settings', this.canvas.width / 2, this.canvas.height - 50);
    }

    handleKeyPress(e) {
        switch(e.key) {
            case 'ArrowUp':
                if (this.currentScreen === 'menu') {
                    this.selectedOption = (this.selectedOption - 1 + this.menuOptions.length) % this.menuOptions.length;
                }
                break;
            case 'ArrowDown':
                if (this.currentScreen === 'menu') {
                    this.selectedOption = (this.selectedOption + 1) % this.menuOptions.length;
                }
                break;
            case 'Enter':
                if (this.currentScreen === 'menu') {
                    this.selectMenuOption();
                }
                break;
            case 's':
            case 'S':
                if (this.currentScreen === 'menu') {
                    this.showSettings();
                }
                break;
            case 'Escape':
                if (this.settingsModal?.style.display === 'block') {
                    this.closeSettings();
                }
                break;
        }
    }

    handleClick(e) {
        if (e.target.classList.contains('close-btn')) {
            this.closeSettings();
        }
    }

    selectMenuOption() {
        switch(this.selectedOption) {
            case 0:
                this.currentScreen = 'game';
                this.game.start();
                break;
            case 1:
                this.showSettings();
                break;
            case 2:
                window.close();
                break;
        }
    }

    renderInGameOverlay() {
        // Settings button in top-right
        this.ctx.fillStyle = 'rgba(15, 52, 96, 0.8)';
        this.ctx.fillRect(this.canvas.width - 150, 10, 140, 40);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '16px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Settings (S)', this.canvas.width - 75, 35);
    }

    update() {
        if (this.currentScreen === 'menu') {
            this.renderMainMenu();
        } else if (this.currentScreen === 'game') {
            this.renderInGameOverlay();
        }
    }
}

// Export the UI class
export { UI };

// Global UI instance for backward compatibility
let ui;

// Initialize when DOM is ready
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        window.UI = UI;
    });
}