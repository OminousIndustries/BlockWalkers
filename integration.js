// Final Integration Script for Block Walkers Game
// This script ensures all systems are properly connected and initialized

class GameIntegration {
    constructor() {
        this.game = null;
        this.systemsReady = false;
        this.init();
    }

    async init() {
        console.log('🎮 Initializing Block Walkers Game Integration...');
        
        // Wait for DOM to be ready
        await this.waitForDOM();
        
        // Initialize WebGPU detection
        await this.initializeWebGPU();
        
        // Initialize enhanced game
        await this.initializeGame();
        
        // Setup system integrations
        this.setupIntegrations();
        
        // Add final polish
        this.addPolishFeatures();
        this.addErrorHandling();
        
        console.log('✅ Block Walkers Game Ready!');
        this.systemsReady = true;
    }
    // Proxy notifications to the game instance
    showNotification(message) {
        if (window.game && typeof window.game.showNotification === 'function') {
            window.game.showNotification(message);
        } else {
            console.warn('Notification:', message);
        }
    }

    async waitForDOM() {
        return new Promise(resolve => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }

    async initializeWebGPU() {
        // Check for WebGPU support
        if ('gpu' in navigator) {
            console.log('🚀 WebGPU support detected');
            document.body.classList.add('webgpu-supported');
        } else {
            console.log('⚠️ WebGPU not supported, using 2D Canvas fallback');
            document.body.classList.add('webgpu-fallback');
        }
    }

    async initializeGame() {
        // Import game modules dynamically
        const gameModule = await import('./game.js');
        
        // Create game instance
        this.game = window.game || new gameModule.Game();
        
        // Make game globally accessible
        window.game = this.game;
        
        // Setup enhanced initialization
        this.enhancedInit();
    }

    enhancedInit() {
        // Show enhanced loading
        const loadingScreen = document.getElementById('loadingScreen');
        const loadingText = loadingScreen.querySelector('.loader')?.parentElement;
        
        if (loadingText) {
            loadingText.innerHTML = `
                <div class="loader"></div>
                <div style="margin-top: 10px; font-size: 14px;">
                    Initializing systems<span class="loading-dots">...</span>
                </div>
            `;
        }
        
        // Hide loading after initialization
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
        }, 1500);
    }

    setupIntegrations() {
        // Keyboard shortcuts display
        this.createKeyboardShortcuts();
        
        // System status monitor
        this.createSystemStatus();
        
        // Enhanced notifications
        this.setupEnhancedNotifications();
        
        // Responsive adjustments
        this.setupResponsiveFeatures();
    }

    createKeyboardShortcuts() {
        const shortcuts = document.createElement('div');
        shortcuts.id = 'keyboardShortcuts';
        shortcuts.className = 'keyboard-shortcuts';
        shortcuts.innerHTML = `
            <div class="shortcuts-container">
                <h3>Keyboard Shortcuts</h3>
                <div class="shortcuts-grid">
                    <div><kbd>WASD</kbd> Move</div>
                    <div><kbd>Mouse</kbd> Look</div>
                    <div><kbd>E</kbd> Interact</div>
                    <div><kbd>ESC</kbd> Menu</div>
                    <div><kbd>Ctrl+M</kbd> Mini-panel</div>
                    <div><kbd>Ctrl+P</kbd> Performance</div>
                    <div><kbd>S</kbd> Settings</div>
                    <div><kbd>Enter</kbd> Confirm</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .keyboard-shortcuts {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 3000;
            }
            
            .shortcuts-container {
                background: linear-gradient(135deg, rgba(26, 26, 46, 0.95), rgba(15, 52, 96, 0.95));
                padding: 30px;
                border-radius: 15px;
                border: 1px solid rgba(233, 69, 96, 0.5);
                max-width: 400px;
                text-align: center;
            }
            
            .shortcuts-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin: 20px 0;
            }
            
            .shortcuts-grid div {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 5px;
            }
            
            kbd {
                background: rgba(233, 69, 96, 0.3);
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 11px;
                font-family: monospace;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(shortcuts);
        
        // Add keyboard shortcut to show shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F1') {
                e.preventDefault();
                shortcuts.style.display = 'flex';
            }
            if (e.key === 'Escape' && shortcuts.style.display === 'flex') {
                shortcuts.style.display = 'none';
            }
        });
    }

    createSystemStatus() {
        const status = document.createElement('div');
        status.id = 'systemStatus';
        status.className = 'system-status';
        status.innerHTML = `
            <div class="status-item">
                <span class="status-label">WebGPU:</span>
                <span class="status-value" id="webgpu-status">Checking...</span>
            </div>
            <div class="status-item">
                <span class="status-label">AI Model:</span>
                <span class="status-value" id="ai-status">Loading...</span>
            </div>
            <div class="status-item">
                <span class="status-label">Controls:</span>
                <span class="status-value">Press F1 for help</span>
            </div>
        `;
        
        document.body.appendChild(status);
        
        // Update status indicators
        setTimeout(() => {
            const webgpuStatus = document.getElementById('webgpu-status');
            const aiStatus = document.getElementById('ai-status');
            
            webgpuStatus.textContent = 'gpu' in navigator ? 'Supported' : 'Fallback';
            aiStatus.textContent = 'Ready';
        }, 2000);
    }

    setupEnhancedNotifications() {
        // Override default notifications with enhanced ones
        const originalNotification = window.game?.showNotification;
        if (originalNotification) {
            window.game.showNotification = (message) => {
                const notification = document.createElement('div');
                notification.className = 'enhanced-notification';
                notification.innerHTML = `
                    <div class="notification-content">
                        <span>${message}</span>
                        <button onclick="this.parentElement.parentElement.remove()">×</button>
                    </div>
                `;
                
                const style = document.createElement('style');
                style.textContent = `
                    .enhanced-notification {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: linear-gradient(135deg, #e94560, #764ba2);
                        color: white;
                        padding: 12px 16px;
                        border-radius: 8px;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                        z-index: 2000;
                        animation: slideIn 0.3s ease-out;
                        max-width: 300px;
                    }
                    
                    .notification-content {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                    
                    .notification-content button {
                        background: none;
                        border: none;
                        color: white;
                        cursor: pointer;
                        font-size: 16px;
                    }
                    
                    @keyframes slideIn {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                `;
                
                document.head.appendChild(style);
                document.body.appendChild(notification);
                
                setTimeout(() => notification.remove(), 4000);
            };
        }
    }

    setupResponsiveFeatures() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.adjustForScreenSize();
        });
        
        this.adjustForScreenSize();
    }

    adjustForScreenSize() {
        const isMobile = window.innerWidth <= 768;
        document.body.classList.toggle('mobile', isMobile);
        
        // Adjust mini-panel position on mobile
        if (this.game?.miniPanel) {
            const panel = document.getElementById('miniPanel');
            if (panel && isMobile) {
                panel.style.left = '10px';
                panel.style.top = '10px';
            }
        }
    }

    addPolishFeatures() {
        // Add smooth page transitions
        this.addPageTransitions();
        
        // Add loading states
        this.addLoadingStates();
        
        // Add error handling
        this.addErrorHandling();
        
        // Add accessibility features
        this.addAccessibilityFeatures();
    }

    addPageTransitions() {
        // Fade in animation
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.5s ease-in-out';
        
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 100);
    }

    addLoadingStates() {
        // Add loading indicators for async operations
        const originalGenerateResponse = window.game?.chatManager?.generateResponse;
        if (originalGenerateResponse) {
            window.game.chatManager.generateResponse = async function(...args) {
                const modelLoading = document.getElementById('modelLoading');
                if (modelLoading) modelLoading.style.display = 'flex';
                
                try {
                    const result = await originalResponse.apply(this, args);
        
                    return result;
                } finally {
                    if (modelLoading) modelLoading.style.display = 'none';
                }
            };
        }
    }

    addErrorHandling() {
        // Global error handler
        window.addEventListener('error', (e) => {
            console.error('Game Error:', e.error);
            self.showNotification('An error occurred. Please refresh the page.');
        });
        
        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled Promise Rejection:', e.reason);
            self.showNotification('A network error occurred. Please check your connection.');
        });
    }

    addAccessibilityFeatures() {
        // Add ARIA labels
        document.querySelectorAll('button').forEach(btn => {
            if (!btn.getAttribute('aria-label')) {
                btn.setAttribute('aria-label', btn.textContent || 'Button');
            }
        });
        
        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }
}

// Initialize the integration when DOM is ready
new GameIntegration();

// Export for global access
window.GameIntegration = GameIntegration;