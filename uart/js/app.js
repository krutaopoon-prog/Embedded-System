/**
 * App - Main entry point for UART Simulator
 * Handles mode switching between Learning and Practice
 */

class App {
    constructor() {
        this.currentMode = 'learning-mode';
        this.learningMode = null;
        this.practiceMode = null;

        this.init();
    }

    init() {
        this.setupModeSwitcher();
        this.learningMode = new LearningMode();
        this.practiceMode = new PracticeMode();
    }

    setupModeSwitcher() {
        const buttons = document.querySelectorAll('.mode-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                if (mode === this.currentMode) return;

                // Update button states
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Switch sections
                document.querySelectorAll('.mode-section').forEach(section => {
                    section.classList.remove('active');
                });

                const targetSection = document.getElementById(mode);
                if (targetSection) {
                    targetSection.classList.add('active');
                }

                this.currentMode = mode;
            });
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
