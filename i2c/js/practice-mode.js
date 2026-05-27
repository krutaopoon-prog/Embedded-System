/**
 * Practice Mode - I2C Quiz Controller
 * - กรอกชื่อก่อนเริ่ม
 * - 10 คำถาม ตรงกับเนื้อหาทฤษฎี
 * - แสดงชื่อ + คะแนน + เกรดเมื่อเสร็จ
 * - ดูข้อที่ผิดได้
 */

class PracticeMode {
    constructor() {
        this.studentName = '';
        this.currentQuestion = 1;
        this.totalQuestions = 10;
        this.score = 0;
        this.answered = {};
        this.wrongAnswers = [];

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
            reviewBtn: document.getElementById('review-wrong'),
            reviewSection: document.getElementById('review-section'),
            reviewList: document.getElementById('review-list'),
            restartBtn: document.getElementById('restart-quiz')
        };

        this.init();
    }

    init() {
        this.setupNameEntry();
        this.setupEventListeners();
    }

    setupNameEntry() {
        const nameInput = this.elements.nameInput;
        const startBtn = this.elements.startBtn;

        if (nameInput && startBtn) {
            nameInput.addEventListener('input', () => {
                startBtn.disabled = nameInput.value.trim().length < 2;
            });
            startBtn.addEventListener('click', () => this.startQuiz());
            nameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !startBtn.disabled) this.startQuiz();
            });
        }
    }

    startQuiz() {
        this.studentName = this.elements.nameInput.value.trim();
        this.elements.nameEntry.classList.add('hidden');
        this.elements.quizArea.classList.remove('hidden');
        if (this.elements.nameDisplay) {
            this.elements.nameDisplay.textContent = '👤 ' + this.studentName;
        }
        this.showQuestion(1);
        this.updateNavigation();
    }

    setupEventListeners() {
        if (this.elements.prevBtn) this.elements.prevBtn.addEventListener('click', () => this.prevQuestion());
        if (this.elements.nextBtn) this.elements.nextBtn.addEventListener('click', () => this.nextQuestion());
        if (this.elements.restartBtn) this.elements.restartBtn.addEventListener('click', () => this.restart());
        if (this.elements.reviewBtn) this.elements.reviewBtn.addEventListener('click', () => this.showReview());

        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleAnswer(e.target));
        });
    }

    handleAnswer(button) {
        const questionEl = button.closest('.quiz-question');
        const questionNum = parseInt(questionEl.dataset.question);
        if (this.answered[questionNum]) return;

        const isCorrect = button.dataset.correct === 'true';
        const buttons = questionEl.querySelectorAll('.answer-btn');
        buttons.forEach(btn => {
            btn.disabled = true;
            if (btn.dataset.correct === 'true') btn.classList.add('correct');
            else if (btn === button && !isCorrect) btn.classList.add('incorrect');
        });

        if (isCorrect) {
            this.score++;
        } else {
            const questionText = questionEl.querySelector('h3').textContent;
            const correctBtn = questionEl.querySelector('.answer-btn[data-correct="true"]');
            this.wrongAnswers.push({
                num: questionNum,
                question: questionText,
                userAnswer: button.textContent,
                correctAnswer: correctBtn ? correctBtn.textContent : ''
            });
        }
        this.answered[questionNum] = true;
        this.updateScore();
        this.showExplanation(questionNum);
    }

    showExplanation(questionNum) {
        const el = document.querySelector(`.quiz-question[data-question="${questionNum}"]`);
        if (el) {
            const exp = el.querySelector('.question-explanation');
            if (exp) exp.classList.remove('hidden');
        }
    }

    showQuestion(num) {
        document.querySelectorAll('.quiz-question').forEach(q => q.classList.remove('active'));
        const target = document.querySelector(`.quiz-question[data-question="${num}"]`);
        if (target) target.classList.add('active');
        this.currentQuestion = num;
        this.updateNavigation();
    }

    prevQuestion() { if (this.currentQuestion > 1) this.showQuestion(this.currentQuestion - 1); }

    nextQuestion() {
        if (this.currentQuestion < this.totalQuestions) this.showQuestion(this.currentQuestion + 1);
        else this.completeQuiz();
    }

    updateNavigation() {
        if (!this.elements.prevBtn || !this.elements.nextBtn || !this.elements.questionNumber) return;
        this.elements.prevBtn.disabled = this.currentQuestion === 1;
        this.elements.nextBtn.disabled = false;
        this.elements.nextBtn.textContent = this.currentQuestion === this.totalQuestions ? 'เสร็จสิ้น ✅' : 'ข้อถัดไป ➡️';
        this.elements.questionNumber.textContent = `คำถาม ${this.currentQuestion}/${this.totalQuestions}`;
    }

    updateScore() {
        if (this.elements.scoreDisplay) this.elements.scoreDisplay.textContent = this.score;
    }

    completeQuiz() {
        const percent = Math.round((this.score / this.totalQuestions) * 100);
        let grade, gradeColor;

        if (percent >= 80) { grade = '🌟 ดีเยี่ยม (Excellent)'; gradeColor = '#16a34a'; }
        else if (percent >= 60) { grade = '👍 ดี (Good)'; gradeColor = '#7c3aed'; }
        else if (percent >= 40) { grade = '📖 พอใช้ — ลองอ่านทฤษฎีอีกครั้ง'; gradeColor = '#f97316'; }
        else { grade = '💪 ต้องปรับปรุง — กลับไปอ่านทฤษฎีใหม่'; gradeColor = '#ef4444'; }

        if (this.elements.finalScore) this.elements.finalScore.textContent = this.score;
        if (this.elements.resultName) this.elements.resultName.textContent = this.studentName;
        if (this.elements.resultPercent) this.elements.resultPercent.textContent = `${percent}%`;
        if (this.elements.resultGrade) {
            this.elements.resultGrade.textContent = grade;
            this.elements.resultGrade.style.color = gradeColor;
        }

        if (this.elements.quizComplete) this.elements.quizComplete.classList.remove('hidden');
        if (this.elements.quizContent) this.elements.quizContent.style.display = 'none';
        document.querySelector('.quiz-navigation').style.display = 'none';
    }

    showReview() {
        if (!this.elements.reviewSection || !this.elements.reviewList) return;

        if (this.wrongAnswers.length === 0) {
            this.elements.reviewList.innerHTML = '<p class="review-all-correct">🎉 ตอบถูกทุกข้อ! ไม่มีข้อที่ผิด</p>';
        } else {
            let html = '';
            this.wrongAnswers.forEach(item => {
                html += `<div class="review-item">
                    <div class="review-question">${item.question}</div>
                    <div class="review-answers">
                        <div class="review-wrong-answer">❌ คำตอบของคุณ: ${item.userAnswer}</div>
                        <div class="review-correct-answer">✅ คำตอบที่ถูก: ${item.correctAnswer}</div>
                    </div>
                </div>`;
            });
            this.elements.reviewList.innerHTML = html;
        }

        this.elements.reviewSection.classList.remove('hidden');
        this.elements.reviewBtn.style.display = 'none';
    }

    restart() {
        this.currentQuestion = 1;
        this.score = 0;
        this.answered = {};
        this.wrongAnswers = [];

        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('correct', 'incorrect');
        });
        document.querySelectorAll('.question-explanation').forEach(exp => exp.classList.add('hidden'));

        if (this.elements.quizComplete) this.elements.quizComplete.classList.add('hidden');
        if (this.elements.quizContent) this.elements.quizContent.style.display = 'block';
        if (this.elements.reviewSection) this.elements.reviewSection.classList.add('hidden');
        if (this.elements.reviewBtn) this.elements.reviewBtn.style.display = '';

        const nav = document.querySelector('.quiz-navigation');
        if (nav) nav.style.display = 'flex';

        this.elements.quizArea.classList.add('hidden');
        this.elements.nameEntry.classList.remove('hidden');
        this.elements.nameInput.value = '';
        this.elements.startBtn.disabled = true;
        this.updateScore();
    }

    activate() {}
}
