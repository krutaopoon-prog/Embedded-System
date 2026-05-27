/**
 * Main App - จัดการการทำงานหลักของแอปพลิเคชัน
 */

class SPIApp {
    constructor() {
        this.currentMode = 'learning';
        this.learningMode = null;
        this.practiceMode = null;
        
        // UI Elements
        this.elements = {
            btnLearning: document.getElementById('btn-learning'),
            btnPractice: document.getElementById('btn-practice'),
            learningSection: document.getElementById('learning-mode'),
            practiceSection: document.getElementById('practice-mode')
        };
        
        this.init();
    }

    /**
     * เริ่มต้นแอปพลิเคชัน
     */
    init() {
        this.setupEventListeners();
        this.initModes();
        
        // เริ่มต้นด้วย Learning Mode
        this.switchMode('learning');
    }

    /**
     * ตั้งค่า Event Listeners
     */
    setupEventListeners() {
        // Mode switcher buttons
        if (this.elements.btnLearning) {
            this.elements.btnLearning.addEventListener('click', () => {
                this.switchMode('learning');
            });
        }
        
        if (this.elements.btnPractice) {
            this.elements.btnPractice.addEventListener('click', () => {
                this.switchMode('practice');
            });
        }
    }

    /**
     * เริ่มต้นโหมดต่างๆ
     */
    initModes() {
        // Learning Mode
        if (typeof LearningMode !== 'undefined') {
            this.learningMode = new LearningMode();
        }
        
        // Practice Mode
        if (typeof PracticeMode !== 'undefined') {
            this.practiceMode = new PracticeMode();
        }
    }

    /**
     * สลับโหมด
     */
    switchMode(mode) {
        this.currentMode = mode;
        
        // อัพเดทปุ่ม
        if (this.elements.btnLearning && this.elements.btnPractice) {
            this.elements.btnLearning.classList.toggle('active', mode === 'learning');
            this.elements.btnPractice.classList.toggle('active', mode === 'practice');
        }
        
        // อัพเดท section
        if (this.elements.learningSection && this.elements.practiceSection) {
            this.elements.learningSection.classList.toggle('active', mode === 'learning');
            this.elements.practiceSection.classList.toggle('active', mode === 'practice');
        }
        
        // เปิดใช้งานโหมดที่เลือก
        if (mode === 'learning' && this.learningMode) {
            this.learningMode.activate();
        } else if (mode === 'practice' && this.practiceMode) {
            this.practiceMode.activate();
        }
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Initialize App when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.spiApp = new SPIApp();
});
