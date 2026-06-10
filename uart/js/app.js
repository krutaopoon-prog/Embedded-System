class App {
    constructor() {
        this.currentMode = 'learning-mode';
        this.init();
    }

    init() {
        this.setupModeSwitcher();
        this.learningMode = new LearningMode();
        this.practiceMode = new PracticeMode();
        this.restoreFromHash();
    }

    switchMode(mode) {
        const buttons = document.querySelectorAll('.mode-btn');
        const target  = document.getElementById(mode);
        if (!target || mode === this.currentMode) return;

        buttons.forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
        document.querySelectorAll('.mode-section').forEach(s => s.classList.remove('active'));
        target.classList.add('active');

        this.currentMode = mode;
        history.pushState({ mode }, '', `#${mode}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    setupModeSwitcher() {
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchMode(btn.dataset.mode));
        });

        window.addEventListener('popstate', (e) => {
            const mode = (e.state && e.state.mode) || 'learning-mode';
            this.switchMode(mode);
        });
    }

    restoreFromHash() {
        const hash = window.location.hash.replace('#', '');
        const valid = ['learning-mode', 'exercise-mode', 'practice-mode'];
        if (hash && valid.includes(hash)) {
            this.switchMode(hash);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
