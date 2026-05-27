/**
 * Practice Mode - จัดการโหมดทดสอบ (Quiz)
 * - กรอกชื่อก่อนเริ่ม
 * - 8 คำถาม ตรงกับเนื้อหาทฤษฎี
 * - แสดงชื่อ + คะแนน + เกรดเมื่อเสร็จ
 */

class PracticeMode {
    constructor() {
        this.studentName = '';
        this.currentQuestion = 1;
        this.totalQuestions = 8;
        this.score = 0;
        this.answered = {};
        this.matchingState = {
            selectedItem: null,
            matches: {}
        };

        // UI Elements
        this.elements = {
            nameEntry: document.getElementById('name-entry'),
            nameInput: document.getElementById('student-name'),
            startBtn: document.getElementById('btn-start-quiz'),
            quizArea: document.getElementById('quiz-area'),
            nameDisplay: document.getElementById('student-name-display'),
            quizContent: document.getElementById('quiz-content'),
            scoreDisplay: document.getElementById('score'),
            questionNumber: document.getElementById('question-number'),
            prevBtn: document.getElementById('prev-question'),
            nextBtn: document.getElementById('next-question'),
            quizComplete: document.getElementById('quiz-complete'),
            finalScore: document.getElementById('final-score'),
            resultName: document.getElementById('result-name'),
            resultPercent: document.getElementById('result-percent'),
            resultGrade: document.getElementById('result-grade'),
            restartBtn: document.getElementById('restart-quiz')
        };

        this.init();
    }

    init() {
        this.setupNameEntry();
        this.setupEventListeners();
        this.setupMatchingGame();
    }

    /**
     * ตั้งค่าหน้ากรอกชื่อ
     */
    setupNameEntry() {
        const nameInput = this.elements.nameInput;
        const startBtn = this.elements.startBtn;

        if (nameInput && startBtn) {
            nameInput.addEventListener('input', () => {
                const name = nameInput.value.trim();
                startBtn.disabled = name.length < 2;
            });

            nameInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !startBtn.disabled) {
                    this.startQuiz();
                }
            });

            startBtn.addEventListener('click', () => this.startQuiz());
        }
    }

    /**
     * เริ่มทำแบบทดสอบ (หลังกรอกชื่อ)
     */
    startQuiz() {
        this.studentName = this.elements.nameInput.value.trim();

        // ซ่อนหน้ากรอกชื่อ แสดงหน้าแบบทดสอบ
        this.elements.nameEntry.classList.add('hidden');
        this.elements.quizArea.classList.remove('hidden');

        // แสดงชื่อในหัว quiz
        if (this.elements.nameDisplay) {
            this.elements.nameDisplay.textContent = '👤 ' + this.studentName;
        }

        this.showQuestion(1);
        this.updateNavigation();
    }

    setupEventListeners() {
        if (this.elements.prevBtn) {
            this.elements.prevBtn.addEventListener('click', () => this.prevQuestion());
        }
        if (this.elements.nextBtn) {
            this.elements.nextBtn.addEventListener('click', () => this.nextQuestion());
        }
        if (this.elements.restartBtn) {
            this.elements.restartBtn.addEventListener('click', () => this.restart());
        }

        const answerButtons = document.querySelectorAll('.answer-btn');
        answerButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleAnswer(e.target));
        });
    }

    /**
     * ตั้งค่า Matching Game (คำถามที่ 5)
     */
    setupMatchingGame() {
        const matchItems = document.querySelectorAll('.match-item');
        const matchTargets = document.querySelectorAll('.match-target');

        matchItems.forEach(item => {
            item.addEventListener('click', () => {
                if (this.matchingState.matches[item.dataset.match]) return;
                matchItems.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                this.matchingState.selectedItem = item.dataset.match;
            });
        });

        matchTargets.forEach(target => {
            target.addEventListener('click', () => {
                if (!this.matchingState.selectedItem) return;
                if (target.classList.contains('matched')) return;

                const selected = this.matchingState.selectedItem;
                const targetKey = target.dataset.target;

                if (selected === targetKey) {
                    target.classList.add('matched');
                    document.querySelector(`.match-item[data-match="${selected}"]`).classList.add('matched');
                    this.matchingState.matches[selected] = true;

                    if (Object.keys(this.matchingState.matches).length === 3) {
                        this.handleMatchingComplete();
                    }
                } else {
                    target.style.animation = 'shake 0.5s';
                    setTimeout(() => { target.style.animation = ''; }, 500);
                }

                matchItems.forEach(i => i.classList.remove('selected'));
                this.matchingState.selectedItem = null;
            });
        });
    }

    handleMatchingComplete() {
        if (!this.answered[5]) {
            this.score++;
            this.answered[5] = true;
            this.updateScore();
            this.showExplanation(5);
        }
    }

    handleAnswer(button) {
        const questionEl = button.closest('.quiz-question');
        const questionNum = parseInt(questionEl.dataset.question);

        if (this.answered[questionNum]) return;

        const isCorrect = button.dataset.correct === 'true';

        const buttons = questionEl.querySelectorAll('.answer-btn');
        buttons.forEach(btn => {
            btn.disabled = true;
            if (btn.dataset.correct === 'true') {
                btn.classList.add('correct');
            } else if (btn === button && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });

        if (isCorrect) {
            this.score++;
        }
        this.answered[questionNum] = true;
        this.updateScore();
        this.showExplanation(questionNum);
    }

    showExplanation(questionNum) {
        const questionEl = document.querySelector(`.quiz-question[data-question="${questionNum}"]`);
        if (questionEl) {
            const explanation = questionEl.querySelector('.question-explanation');
            if (explanation) {
                explanation.classList.remove('hidden');
            }
        }
    }

    showQuestion(num) {
        document.querySelectorAll('.quiz-question').forEach(q => {
            q.classList.remove('active');
        });

        const target = document.querySelector(`.quiz-question[data-question="${num}"]`);
        if (target) {
            target.classList.add('active');
        }

        this.currentQuestion = num;
        this.updateNavigation();
    }

    prevQuestion() {
        if (this.currentQuestion > 1) {
            this.showQuestion(this.currentQuestion - 1);
        }
    }

    nextQuestion() {
        if (this.currentQuestion < this.totalQuestions) {
            this.showQuestion(this.currentQuestion + 1);
        } else {
            this.completeQuiz();
        }
    }

    updateNavigation() {
        if (!this.elements.prevBtn || !this.elements.nextBtn || !this.elements.questionNumber) return;

        this.elements.prevBtn.disabled = this.currentQuestion === 1;
        this.elements.nextBtn.disabled = false;
        this.elements.nextBtn.textContent =
            this.currentQuestion === this.totalQuestions ? 'เสร็จสิ้น ✅' : 'ข้อถัดไป ➡️';
        this.elements.questionNumber.textContent = `คำถาม ${this.currentQuestion}/${this.totalQuestions}`;
    }

    updateScore() {
        if (this.elements.scoreDisplay) {
            this.elements.scoreDisplay.textContent = this.score;
        }
    }

    /**
     * จบการทำแบบทดสอบ - แสดงชื่อ + คะแนน + เกรด
     */
    completeQuiz() {
        const percent = Math.round((this.score / this.totalQuestions) * 100);
        let grade = '';
        let gradeColor = '';

        if (percent >= 80) {
            grade = '🌟 ดีเยี่ยม (Excellent)';
            gradeColor = '#16a34a';
        } else if (percent >= 60) {
            grade = '👍 ดี (Good)';
            gradeColor = '#2563eb';
        } else if (percent >= 40) {
            grade = '📖 พอใช้ — ลองอ่านทฤษฎีอีกครั้ง';
            gradeColor = '#f97316';
        } else {
            grade = '💪 ต้องปรับปรุง — กลับไปอ่านทฤษฎีใหม่';
            gradeColor = '#ef4444';
        }

        // แสดงผลลัพธ์
        if (this.elements.finalScore) this.elements.finalScore.textContent = this.score;
        if (this.elements.resultName) this.elements.resultName.textContent = this.studentName;
        if (this.elements.resultPercent) this.elements.resultPercent.textContent = `${percent}%`;
        if (this.elements.resultGrade) {
            this.elements.resultGrade.textContent = grade;
            this.elements.resultGrade.style.color = gradeColor;
        }

        if (this.elements.quizComplete) {
            this.elements.quizComplete.classList.remove('hidden');
        }
        if (this.elements.quizContent) {
            this.elements.quizContent.style.display = 'none';
        }
        document.querySelector('.quiz-navigation').style.display = 'none';
    }

    /**
     * เริ่มใหม่ — กลับไปหน้ากรอกชื่อ
     */
    restart() {
        this.currentQuestion = 1;
        this.score = 0;
        this.answered = {};
        this.matchingState = { selectedItem: null, matches: {} };

        // รีเซ็ต UI
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('correct', 'incorrect');
        });

        document.querySelectorAll('.question-explanation').forEach(exp => {
            exp.classList.add('hidden');
        });

        document.querySelectorAll('.match-item, .match-target').forEach(el => {
            el.classList.remove('matched', 'selected');
        });

        if (this.elements.quizComplete) this.elements.quizComplete.classList.add('hidden');
        if (this.elements.quizContent) this.elements.quizContent.style.display = 'block';

        const nav = document.querySelector('.quiz-navigation');
        if (nav) nav.style.display = 'flex';

        // กลับไปหน้ากรอกชื่อ
        this.elements.quizArea.classList.add('hidden');
        this.elements.nameEntry.classList.remove('hidden');
        this.elements.nameInput.value = '';
        this.elements.startBtn.disabled = true;

        this.updateScore();
    }

    activate() {}
}

// CSS animation for shake effect
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        window.practiceMode = new PracticeMode();
    });
}
