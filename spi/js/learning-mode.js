/**
 * Learning Mode - จัดการโหมดเรียนรู้
 */

class LearningMode {
    constructor() {
        this.spiEngine = new SPIEngine();
        this.animator = new AnimationController(this.spiEngine);
        
        // UI Elements
        this.elements = {
            dataInput: document.getElementById('data-input'),
            binaryDisplay: document.getElementById('binary-display'),
            spiMode: document.getElementById('spi-mode'),
            modeExplanation: document.getElementById('mode-exp'),
            speedSlider: document.getElementById('speed-slider'),
            btnPlay: document.getElementById('btn-play'),
            btnPause: document.getElementById('btn-pause'),
            btnStep: document.getElementById('btn-step'),
            btnReset: document.getElementById('btn-reset')
        };
        
        // Code tabs
        this.codeTabs = document.querySelectorAll('.code-tab');
        this.codeContents = document.querySelectorAll('.code-content');
        
        this.init();
    }

    /**
     * เริ่มต้น Learning Mode
     */
    init() {
        this.setupEventListeners();
        this.setupCodeTabs();
        this.setupSPIEngine();
        this.setupTheoryToggle();
        this.updateBinaryDisplay();
    }

    /**
     * ตั้งค่า Event Listeners
     */
    setupEventListeners() {
        // Data input
        if (this.elements.dataInput) {
            this.elements.dataInput.addEventListener('input', () => {
                this.updateBinaryDisplay();
                this.updateTransmitData();
            });
        }

        // SPI Mode
        if (this.elements.spiMode) {
            this.elements.spiMode.addEventListener('change', (e) => {
                const mode = parseInt(e.target.value);
                this.spiEngine.setMode(mode);
                this.updateModeExplanation(mode);
                this.animator.reset();
                this.updateButtons();
            });
        }

        // Speed slider
        if (this.elements.speedSlider) {
            this.elements.speedSlider.addEventListener('input', (e) => {
                this.animator.setSpeed(parseInt(e.target.value));
            });
        }

        // Control buttons
        if (this.elements.btnPlay) {
            this.elements.btnPlay.addEventListener('click', () => this.play());
        }
        if (this.elements.btnPause) {
            this.elements.btnPause.addEventListener('click', () => this.pause());
        }
        if (this.elements.btnStep) {
            this.elements.btnStep.addEventListener('click', () => this.step());
        }
        if (this.elements.btnReset) {
            this.elements.btnReset.addEventListener('click', () => this.reset());
        }
    }

    /**
     * ตั้งค่า Code Tabs
     */
    setupCodeTabs() {
        this.codeTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;
                
                // Update tab styles
                this.codeTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Update content visibility
                this.codeContents.forEach(c => {
                    c.classList.remove('active');
                    if (c.id === `${targetTab}-code`) {
                        c.classList.add('active');
                    }
                });
            });
        });
    }

    /**
     * ตั้งค่า Theory Section Toggle
     */
    setupTheoryToggle() {
        const toggleBtn = document.getElementById('toggle-theory');
        const theoryContent = document.getElementById('theory-content');
        
        if (toggleBtn && theoryContent) {
            toggleBtn.addEventListener('click', () => {
                theoryContent.classList.toggle('collapsed');
                toggleBtn.textContent = theoryContent.classList.contains('collapsed') 
                    ? 'แสดงเนื้อหา' 
                    : 'ซ่อนเนื้อหา';
            });
        }
    }

    /**
     * ตั้งค่า SPI Engine Callbacks
     */
    setupSPIEngine() {
        this.spiEngine.onStateChange = (state) => {
            this.animator.handleSPIEvent(state);
        };
        
        this.spiEngine.onComplete = () => {
            this.updateButtons();
        };
        
        // อัพเดท explanation เริ่มต้น
        this.animator.updateExplanation('reset');
    }

    /**
     * อัพเดท binary display
     */
    updateBinaryDisplay() {
        if (!this.elements.dataInput || !this.elements.binaryDisplay) return;
        
        let value = parseInt(this.elements.dataInput.value) || 0;
        // Clamp to 0-255
        value = Math.max(0, Math.min(255, value));
        
        if (value !== parseInt(this.elements.dataInput.value)) {
            this.elements.dataInput.value = value;
        }
        
        const binary = value.toString(2).padStart(8, '0');
        this.elements.binaryDisplay.textContent = binary;
    }

    /**
     * อัพเดทข้อมูลที่จะส่ง
     */
    updateTransmitData() {
        if (!this.elements.dataInput) return;
        
        const value = parseInt(this.elements.dataInput.value) || 0;
        this.spiEngine.setTransmitData(value);
    }

    /**
     * อัพเดทคำอธิบายโหมด
     */
    updateModeExplanation(mode) {
        if (!this.elements.modeExplanation) return;
        
        const explanations = {
            0: `CPOL=0: นาฬิกาเริ่มต้นที่ LOW<br>
                CPHA=0: อ่านข้อมูลที่ rising edge (ขอบขึ้น) <br>
                <em>โหมดที่ใช้กันมากที่สุด</em>`,
            3: `CPOL=1: นาฬิกาเริ่มต้นที่ HIGH<br>
                CPHA=1: อ่านข้อมูลที่ falling edge (ขอบลง)<br>
                <em>เหมาะกับบางอุปกรณ์ SD Card</em>`
        };
        
        this.elements.modeExplanation.innerHTML = explanations[mode] || '';
    }

    /**
     * เริ่มการเล่น animation
     */
    play() {
        this.updateTransmitData();
        this.animator.play();
        this.updateButtons();
    }

    /**
     * หยุด animation
     */
    pause() {
        this.animator.pause();
        this.updateButtons();
    }

    /**
     * ดำเนินการทีละขั้น
     */
    step() {
        this.updateTransmitData();
        const complete = this.animator.step();
        this.updateButtons();
        return complete;
    }

    /**
     * รีเซ็ต
     */
    reset() {
        this.animator.reset();
        this.updateButtons();
    }

    /**
     * อัพเดทสถานะปุ่ม
     */
    updateButtons() {
        if (!this.elements.btnPlay || !this.elements.btnPause) return;
        
        const isRunning = this.spiEngine.isRunning;
        const isPaused = this.spiEngine.isPaused;
        const isComplete = this.spiEngine.isComplete;
        
        this.elements.btnPlay.disabled = (isRunning && !isPaused) || isComplete;
        this.elements.btnPause.disabled = !isRunning || isPaused || isComplete;
        
        if (isComplete) {
            this.elements.btnPlay.textContent = '▶️ เริ่ม';
        }
    }

    /**
     * เปิดใช้งาน Learning Mode
     */
    activate() {
        this.updateBinaryDisplay();
        this.updateTransmitData();
        this.animator.drawOscilloscope();
    }
}

// Initialize when DOM is ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        window.learningMode = new LearningMode();
    });
}
