// WebGPU Detection and Optimization Utilities
class WebGPUUtils {
    constructor() {
        this.isSupported = false;
        this.adapter = null;
        this.device = null;
        this.context = null;
        this.performanceData = {
            fps: 60,
            frameTime: 16.67,
            memoryUsage: 0,
            drawCalls: 0,
            triangles: 0
        };
        
        this.checkSupport();
        this.setupPerformanceMonitoring();
    }

    async checkSupport() {
        try {
            if (!navigator.gpu) {
                console.warn('WebGPU not supported - falling back to 2D Canvas');
                return false;
            }

            this.adapter = await navigator.gpu.requestAdapter();
            if (!this.adapter) {
                console.warn('WebGPU adapter not available - falling back to 2D Canvas');
                return false;
            }

            this.device = await this.adapter.requestDevice();
            this.isSupported = true;
            
            console.log('WebGPU supported:', {
                adapter: this.adapter.name,
                limits: this.adapter.limits
            });
            
            return true;
        } catch (error) {
            console.error('WebGPU initialization error:', error);
            return false;
        }
    }

    async createWebGPUContext(canvas) {
        if (!this.isSupported) return null;

        try {
            this.context = canvas.getContext('webgpu');
            if (!this.context) {
                console.warn('WebGPU context creation failed');
                return null;
            }

            const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
            this.context.configure({
                device: this.device,
                format: canvasFormat,
                alphaMode: 'premultiplied'
            });

            return this.context;
        } catch (error) {
            console.error('WebGPU context setup error:', error);
            return null;
        }
    }

    setupPerformanceMonitoring() {
        this.frameMetrics = {
            startTime: performance.now(),
            frameCount: 0,
            lastFrameTime: performance.now(),
            fpsHistory: [],
            maxHistoryLength: 60
        };
    }

    updatePerformanceMetrics(deltaTime) {
        const now = performance.now();
        this.frameMetrics.frameCount++;
        
        // Calculate FPS
        if (now - this.frameMetrics.lastFrameTime >= 1000) {
            const fps = this.frameMetrics.frameCount;
            this.performanceData.fps = fps;
            
            this.frameMetrics.fpsHistory.push(fps);
            if (this.frameMetrics.fpsHistory.length > this.frameMetrics.maxHistoryLength) {
                this.frameMetrics.fpsHistory.shift();
            }
            
            this.frameMetrics.frameCount = 0;
            this.frameMetrics.lastFrameTime = now;
        }
        
        // Calculate frame time
        this.performanceData.frameTime = deltaTime;
        
        // Estimate memory usage (simplified)
        if (performance.memory) {
            this.performanceData.memoryUsage = performance.memory.usedJSHeapSize / (1024 * 1024);
        }
    }

    getAverageFPS() {
        const history = this.frameMetrics.fpsHistory;
        if (history.length === 0) return 60;
        return history.reduce((a, b) => a + b, 0) / history.length;
    }

    getPerformanceGrade() {
        const avgFPS = this.getAverageFPS();
        if (avgFPS >= 60) return 'A';
        if (avgFPS >= 45) return 'B';
        if (avgFPS >= 30) return 'C';
        return 'D';
    }

    createPerformanceOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'performanceOverlay';
        overlay.innerHTML = `
            <div class="performance-container">
                <div class="perf-header">
                    <span>Performance Monitor</span>
                    <button class="perf-close">×</button>
                </div>
                <div class="perf-content">
                    <div class="perf-item">
                        <span class="perf-label">FPS:</span>
                        <span class="perf-value" id="perf-fps">60</span>
                    </div>
                    <div class="perf-item">
                        <span class="perf-label">Frame Time:</span>
                        <span class="perf-value" id="perf-frame-time">16.67ms</span>
                    </div>
                    <div class="perf-item">
                        <span class="perf-label">Memory:</span>
                        <span class="perf-value" id="perf-memory">0 MB</span>
                    </div>
                    <div class="perf-item">
                        <span class="perf-label">Draw Calls:</span>
                        <span class="perf-value" id="perf-draw-calls">0</span>
                    </div>
                    <div class="perf-item">
                        <span class="perf-label">Grade:</span>
                        <span class="perf-value" id="perf-grade">A</span>
                    </div>
                </div>
                <div class="perf-footer">
                    <button class="perf-toggle">Toggle WebGPU</button>
                    <button class="perf-reset">Reset Stats</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        this.addPerformanceStyles();
        this.setupPerformanceEvents();
    }

    addPerformanceStyles() {
        const styles = document.createElement('style');
        styles.textContent = `
            #performanceOverlay {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 200px;
                z-index: 2000;
                font-family: 'Courier New', monospace;
                font-size: 11px;
            }

            .performance-container {
                background: linear-gradient(135deg, rgba(26, 26, 46, 0.95), rgba(15, 52, 96, 0.95));
                border: 1px solid rgba(233, 69, 96, 0.5);
                border-radius: 8px;
                padding: 8px;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
                backdrop-filter: blur(10px);
            }

            .perf-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                color: #e94560;
                font-weight: bold;
                margin-bottom: 8px;
                padding-bottom: 4px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .perf-close {
                background: none;
                border: none;
                color: #fff;
                cursor: pointer;
                font-size: 16px;
                padding: 0;
                width: 16px;
                height: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .perf-content {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }

            .perf-item {
                display: flex;
                justify-content: space-between;
                color: #fff;
            }

            .perf-label {
                color: rgba(233, 69, 96, 0.9);
            }

            .perf-value {
                font-weight: bold;
            }

            .perf-footer {
                display: flex;
                gap: 4px;
                margin-top: 8px;
            }

            .perf-footer button {
                flex: 1;
                padding: 2px 4px;
                background: rgba(233, 69, 96, 0.3);
                border: 1px solid rgba(233, 69, 96, 0.5);
                border-radius: 3px;
                color: #fff;
                font-size: 9px;
                cursor: pointer;
            }

            .grade-a { color: #4caf50; }
            .grade-b { color: #ff9800; }
            .grade-c { color: #ff5722; }
            .grade-d { color: #f44336; }
        `;
        
        document.head.appendChild(styles);
    }

    setupPerformanceEvents() {
        const overlay = document.getElementById('performanceOverlay');
        const closeBtn = overlay.querySelector('.perf-close');
        const toggleBtn = overlay.querySelector('.perf-toggle');
        const resetBtn = overlay.querySelector('.perf-reset');

        closeBtn.addEventListener('click', () => {
            overlay.style.display = 'none';
        });

        toggleBtn.addEventListener('click', () => {
            this.toggleWebGPU();
        });

        resetBtn.addEventListener('click', () => {
            this.resetPerformanceStats();
        });
    }

    toggleWebGPU() {
        if (this.isSupported) {
            console.log('WebGPU is enabled');
        } else {
            console.log('WebGPU is disabled - using 2D Canvas fallback');
        }
    }

    resetPerformanceStats() {
        this.frameMetrics = {
            startTime: performance.now(),
            frameCount: 0,
            lastFrameTime: performance.now(),
            fpsHistory: []
        };
        this.performanceData.drawCalls = 0;
        this.performanceData.triangles = 0;
    }

    updatePerformanceOverlay() {
        const fps = document.getElementById('perf-fps');
        const frameTime = document.getElementById('perf-frame-time');
        const memory = document.getElementById('perf-memory');
        const drawCalls = document.getElementById('perf-draw-calls');
        const grade = document.getElementById('perf-grade');

        if (fps) fps.textContent = this.performanceData.fps;
        if (frameTime) frameTime.textContent = this.performanceData.frameTime.toFixed(2) + 'ms';
        if (memory) memory.textContent = this.performanceData.memoryUsage.toFixed(1) + ' MB';
        if (drawCalls) drawCalls.textContent = this.performanceData.drawCalls;
        
        const gradeValue = this.getPerformanceGrade();
        if (grade) {
            grade.textContent = gradeValue;
            grade.className = `perf-value grade-${gradeValue.toLowerCase()}`;
        }
    }

    showPerformanceOverlay() {
        const overlay = document.getElementById('performanceOverlay');
        if (overlay) {
            overlay.style.display = 'block';
        } else {
            this.createPerformanceOverlay();
        }
    }

    hidePerformanceOverlay() {
        const overlay = document.getElementById('performanceOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    // Resource cleanup
    cleanup() {
        if (this.device) {
            this.device.destroy();
        }
        this.hidePerformanceOverlay();
    }
}

export { WebGPUUtils };