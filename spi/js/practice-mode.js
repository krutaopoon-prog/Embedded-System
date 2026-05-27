/**
 * Practice Mode - จัดการโหมดทดสอบ (Quiz)
 */

class PracticeMode {
    constructor() {
        this.currentQuestion = 1;
        this.totalQuestions = 10;
        this.score = 0;
        this.answered = {};  // เก็บสถานะการตอบแต่ละข้อ
        this.matchingState = {
            selectedItem: null,
            matches: {}
        };
        
        // UI Elements
        this.elements = {
            quizContent: document.getElementById('quiz-content'),
            scoreDisplay: document.getElementById('score'),
            questionNumber: document.getElementById('question-number'),
            prevBtn: document.getElementById('prev-question'),
            nextBtn: document.getElementById('next-question'),
            quizComplete: document.getElementById('quiz-complete'),
            finalScore: document.getElementById('final-score'),
            restartBtn: document.getElementById('restart-quiz')
        };
        
        this.init();
    }

    /**
     * เริ่มต้น Practice Mode
     */
    init() {
        this.setupEventListeners();
        this.setupMatchingGame();
        this.showQuestion(1);
        this.updateNavigation();
    }

    /**
     * ตั้งค่า Event Listeners
     */
    setupEventListeners() {
        // Navigation buttons
        if (this.elements.prevBtn) {
            this.elements.prevBtn.addEventListener('click', () => this.prevQuestion());
        }
        if (this.elements.nextBtn) {
            this.elements.nextBtn.addEventListener('click', () => this.nextQuestion());
        }
        if (this.elements.restartBtn) {
            this.elements.restartBtn.addEventListener('click', () => this.restart());
        }

        // Answer buttons (choices)
        const answerButtons = document.querySelectorAll('.answer-btn');
        answerButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleAnswer(e.target));
        });
    }

    /**
     * ตั้งค่า Matching Game (คำถามที่ 4)
     */
    setupMatchingGame() {
        const matchItems = document.querySelectorAll('.match-item');
        const matchTargets = document.querySelectorAll('.match-target');

        matchItems.forEach(item => {
            item.addEventListener('click', () => {
                if (this.matchingState.matches[item.dataset.match]) return; // จับคู่แล้ว
                
                // ยกเลิกการเลือกเดิม
                matchItems.forEach(i => i.classList.remove('selected'));
                
                // เลือกใหม่
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
                    // จับคู่ถูกต้อง
                    target.classList.add('matched');
                    document.querySelector(`.match-item[data-match="${selected}"]`).classList.add('matched');
                    this.matchingState.matches[selected] = true;
                    
                    // เช็คว่าจับคู่ครบแล้วหรือยัง
                    if (Object.keys(this.matchingState.matches).length === 3) {
                        this.handleMatchingComplete();
                    }
                } else {
                    // จับคู่ผิด
                    target.style.animation = 'shake 0.5s';
                    setTimeout(() => {
                        target.style.animation = '';
                    }, 500);
                }

                // ยกเลิกการเลือก
                matchItems.forEach(i => i.classList.remove('selected'));
                this.matchingState.selectedItem = null;
            });
        });
    }

    /**
     * จัดการการจับคู่เสร็จสมบูรณ์
     */
    handleMatchingComplete() {
        if (!this.answered[4]) {
            this.score++;
            this.answered[4] = true;
            this.updateScore();
            this.showExplanation(4);
        }
    }

    /**
     * จัดการคำตอบ
     */
    handleAnswer(button) {
        const questionEl = button.closest('.quiz-question');
        const questionNum = parseInt(questionEl.dataset.question);
        
        // ถ้าตอบแล้วไม่ให้ตอบอีก
        if (this.answered[questionNum]) return;

        const isCorrect = button.dataset.correct === 'true';
        
        // ไฮไลท์คำตอบ
        const buttons = questionEl.querySelectorAll('.answer-btn');
        buttons.forEach(btn => {
            btn.disabled = true;
            if (btn.dataset.correct === 'true') {
                btn.classList.add('correct');
            } else if (btn === button && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });

        // อัพเดทคะแนน
        if (isCorrect) {
            this.score++;
        }
        this.answered[questionNum] = true;
        this.updateScore();

        // แสดงคำอธิบาย
        this.showExplanation(questionNum);
    }

    /**
     * แสดงคำอธิบาย
     */
    showExplanation(questionNum) {
        const questionEl = document.querySelector(`.quiz-question[data-question="${questionNum}"]`);
        if (questionEl) {
            const explanation = questionEl.querySelector('.question-explanation');
            if (explanation) {
                explanation.classList.remove('hidden');
            }
        }
    }

    /**
     * แสดงคำถาม
     */
    showQuestion(num) {
        // ซ่อนทั้งหมด
        document.querySelectorAll('.quiz-question').forEach(q => {
            q.classList.remove('active');
        });

        // แสดงคำถามปัจจุบัน
        const target = document.querySelector(`.quiz-question[data-question="${num}"]`);
        if (target) {
            target.classList.add('active');
        }

        this.currentQuestion = num;
        this.updateNavigation();
    }

    /**
     * ไปคำถามก่อนหน้า
     */
    prevQuestion() {
        if (this.currentQuestion > 1) {
            this.showQuestion(this.currentQuestion - 1);
        }
    }

    /**
     * ไปคำถามถัดไป
     */
    nextQuestion() {
        if (this.currentQuestion < this.totalQuestions) {
            this.showQuestion(this.currentQuestion + 1);
        } else {
            this.completeQuiz();
        }
    }

    /**
     * อัพเดทการนำทาง
     */
    updateNavigation() {
        if (!this.elements.prevBtn || !this.elements.nextBtn || !this.elements.questionNumber) return;

        this.elements.prevBtn.disabled = this.currentQuestion === 1;
        this.elements.nextBtn.disabled = false;
        this.elements.nextBtn.textContent = 
            this.currentQuestion === this.totalQuestions ? 'เสร็จสิ้น ✅' : 'ข้อถัดไป ➡️';
        this.elements.questionNumber.textContent = `คำถาม ${this.currentQuestion}/${this.totalQuestions}`;
    }

    /**
     * อัพเดทคะแนน
     */
    updateScore() {
        if (this.elements.scoreDisplay) {
            this.elements.scoreDisplay.textContent = this.score;
        }
    }

    /**
     * จบการทำแบบทดสอบ
     */
    completeQuiz() {
        if (this.elements.quizComplete && this.elements.finalScore) {
            this.elements.finalScore.textContent = this.score;
            this.elements.quizComplete.classList.remove('hidden');
            
            // ซ่อน quiz content
            if (this.elements.quizContent) {
                this.elements.quizContent.style.display = 'none';
            }
            
            // ซ่อน navigation
            document.querySelector('.quiz-navigation').style.display = 'none';
        }
    }

    /**
     * เริ่มใหม่
     */
    restart() {
        this.currentQuestion = 1;
        this.score = 0;
        this.answered = {};
        this.matchingState = {
            selectedItem: null,
            matches: {}
        };

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

        if (this.elements.quizComplete) {
            this.elements.quizComplete.classList.add('hidden');
        }
        if (this.elements.quizContent) {
            this.elements.quizContent.style.display = 'block';
        }
        
        const nav = document.querySelector('.quiz-navigation');
        if (nav) {
            nav.style.display = 'flex';
        }

        this.updateScore();
        this.showQuestion(1);
    }

    /**
     * เปิดใช้งาน Practice Mode
     */
    activate() {
        // รีเซ็ตถ้าต้องการ
    }
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
