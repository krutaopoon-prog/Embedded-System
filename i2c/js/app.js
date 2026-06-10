class App {
    constructor() {
        this.currentMode = 'learning-mode';
        this.setupModeSwitcher();
        this.restoreFromHash();
        try { this.learningMode = new LearningMode(); } catch(e) { console.error('LearningMode:', e); }
        try { this.practiceMode = new PracticeMode(); } catch(e) { console.error('PracticeMode:', e); }
    }

    switchMode(mode) {
        const target = document.getElementById(mode);
        if (!target || mode === this.currentMode) return;

        document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
        document.querySelectorAll('.mode-section').forEach(s => s.classList.remove('active'));
        target.classList.add('active');

        document.body.dataset.mode = mode;
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
        const hash  = window.location.hash.replace('#', '');
        const valid = ['learning-mode', 'exercise-mode', 'practice-mode'];
        if (hash && valid.includes(hash)) {
            this.switchMode(hash);
        } else {
            document.body.dataset.mode = 'learning-mode';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
