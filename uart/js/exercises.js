(function () {
    const POOL = [
        ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        ...'abcdefghijklmnopqrstuvwxyz',
        ...'0123456789'
    ];

    function toBin8(n) { return n.toString(2).padStart(8, '0'); }
    function lsbFirst(n) { return toBin8(n).split('').reverse().join(''); }
    function randChar(exclude) {
        let c;
        do { c = POOL[Math.floor(Math.random() * POOL.length)]; } while (c === exclude);
        return c;
    }

    let ex1Char, ex1Correct, ex2Correct, ex3Char, submitted;

    // ── Screen helpers ──
    function show(id) { document.getElementById(id).classList.remove('hidden'); }
    function hide(id) { document.getElementById(id).classList.add('hidden'); }

    // ── Name entry ──
    function setupNameEntry() {
        const nameInput = document.getElementById('ex-student-name');
        const startBtn  = document.getElementById('btn-ex-start');
        if (!nameInput || !startBtn) return;

        nameInput.addEventListener('input', () => {
            startBtn.disabled = nameInput.value.trim().length === 0;
        });

        startBtn.addEventListener('click', () => {
            const name = nameInput.value.trim();
            const display = document.getElementById('ex-name-display');
            if (display) display.textContent = `👤 ${name}`;
            hide('ex-entry');
            show('ex-work-area');
            initExercises();
        });
    }

    // ── Build 8 bit-input boxes ──
    function buildBitInputs() {
        const wrap = document.getElementById('ex1-bits');
        if (!wrap) return;
        wrap.innerHTML = '';
        for (let i = 0; i < 8; i++) {
            const col = document.createElement('div');
            col.className = 'bit-col';

            const lbl = document.createElement('span');
            lbl.className = 'bit-pos';
            lbl.textContent = i === 0 ? 'b0\nLSB' : i === 7 ? 'b7\nMSB' : `b${i}`;

            const inp = document.createElement('input');
            inp.type = 'text';
            inp.maxLength = 1;
            inp.className = 'bit-box';
            inp.id = `ex1b${i}`;

            inp.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && inp.value === '') {
                    const prev = document.getElementById(`ex1b${i - 1}`);
                    if (prev) { prev.value = ''; prev.focus(); }
                }
            });
            inp.addEventListener('input', () => {
                if (inp.value !== '0' && inp.value !== '1') { inp.value = ''; return; }
                const next = document.getElementById(`ex1b${i + 1}`);
                if (next) next.focus();
            });

            col.appendChild(lbl);
            col.appendChild(inp);
            wrap.appendChild(col);
        }
    }

    // ── Build Ex2 option buttons ──
    function buildEx2Options() {
        const options = [
            { text: 'Data → Start → Stop',  correct: false },
            { text: 'Stop → Data → Start',  correct: false },
            { text: 'Start → Data → Stop',  correct: true  },
            { text: 'Start → Stop → Data',  correct: false },
        ].sort(() => Math.random() - 0.5);

        const wrap = document.getElementById('ex2-options');
        wrap.innerHTML = '';
        ex2Correct = null;

        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'ex2-btn';
            btn.textContent = opt.text;
            btn.addEventListener('click', () => {
                if (submitted) return;
                wrap.querySelectorAll('.ex2-btn').forEach(b => b.classList.remove('ex2-selected'));
                btn.classList.add('ex2-selected');
                ex2Correct = opt.correct;
            });
            wrap.appendChild(btn);
        });
    }

    // ── Initialise exercises (randomise) ──
    function initExercises() {
        submitted = false;

        ex1Char    = randChar(null);
        ex3Char    = randChar(ex1Char);
        ex1Correct = lsbFirst(ex1Char.charCodeAt(0));

        document.getElementById('ex1-char').textContent = `'${ex1Char}'`;
        document.getElementById('ex1-dec').textContent  = ex1Char.charCodeAt(0);
        buildBitInputs();

        buildEx2Options();

        document.getElementById('ex3-binary').textContent = lsbFirst(ex3Char.charCodeAt(0));
        const ex3Input = document.getElementById('ex3-answer');
        ex3Input.value    = '';
        ex3Input.disabled = false;

        ['ex1-fb', 'ex2-fb', 'ex3-fb'].forEach(id => {
            const el = document.getElementById(id);
            el.className = 'ex-fb hidden';
            el.innerHTML = '';
        });

        // Update step indicators
        ['ex-step-1','ex-step-2','ex-step-3'].forEach((id, i) => {
            const el = document.getElementById(id);
            if (el) el.className = 'ex-step' + (i === 0 ? ' ex-step-done' : '');
        });

        show('btn-ex-submit');
        document.getElementById('btn-ex-submit').disabled = false;
    }

    // ── Get user's bit answer ──
    function getUserBin() {
        return Array.from({ length: 8 }, (_, i) => {
            const v = (document.getElementById(`ex1b${i}`) || {}).value;
            return v === '0' || v === '1' ? v : '_';
        }).join('');
    }

    function setFeedback(id, ok, html) {
        const el = document.getElementById(id);
        el.className = `ex-fb ${ok ? 'ex-ok' : 'ex-err'}`;
        el.innerHTML = html;
    }

    // ── Check all answers ──
    function checkAll() {
        if (submitted) return;
        submitted = true;

        let score = 0;

        // Ex1
        const userBin = getUserBin();
        const ok1 = userBin === ex1Correct;
        if (ok1) score++;
        setFeedback('ex1-fb', ok1,
            ok1
            ? `✅ ถูกต้อง! <strong>'${ex1Char}'</strong> (${ex1Char.charCodeAt(0)}) = <code>${ex1Correct}</code>`
            : `❌ ผิด &nbsp;— เฉลย: <code>${ex1Correct}</code> &nbsp;|&nbsp; คุณตอบ: <code>${userBin}</code>`
        );
        markStep(1, ok1);

        // Ex2
        const ok2 = ex2Correct === true;
        if (ok2) score++;
        document.querySelectorAll('.ex2-btn').forEach(btn => {
            btn.disabled = true;
            if (btn.textContent === 'Start → Data → Stop') btn.classList.add('ex2-correct');
        });
        setFeedback('ex2-fb', ok2,
            ok2
            ? '✅ ถูกต้อง! ลำดับ UART Frame: <strong>Start → Data → Stop</strong>'
            : '❌ ผิด &nbsp;— ลำดับที่ถูกต้อง: <strong>Start → Data → Stop</strong>'
        );
        markStep(2, ok2);

        // Ex3
        const userCh = (document.getElementById('ex3-answer').value || '').trim();
        document.getElementById('ex3-answer').disabled = true;
        const ok3 = userCh === ex3Char;
        if (ok3) score++;
        setFeedback('ex3-fb', ok3,
            ok3
            ? `✅ ถูกต้อง! <code>${lsbFirst(ex3Char.charCodeAt(0))}</code> = <strong>'${ex3Char}'</strong> (ASCII ${ex3Char.charCodeAt(0)})`
            : `❌ ผิด &nbsp;— เฉลย: <strong>'${ex3Char}'</strong> (ASCII ${ex3Char.charCodeAt(0)})`
        );
        markStep(3, ok3);

        // Show result screen after short delay
        setTimeout(() => {
            hide('ex-work-area');
            showResult(score);
        }, 1200);

        // Store for PDF
        window._exPrintData = {
            name  : (document.getElementById('ex-student-name').value || '').trim() || '(ไม่ระบุ)',
            date  : new Date().toLocaleDateString('th-TH', { year:'numeric', month:'long', day:'numeric' }),
            score,
            grade : gradeText(score).replace(/[🌟👍📚❗]/g,'').trim(),
            rows  : [
                { q: `แปลงตัวอักษร '${ex1Char}' (ASCII ${ex1Char.charCodeAt(0)}) เป็น Binary 8 bit (LSB first)`,
                  user: userBin, answer: ex1Correct, ok: ok1 },
                { q: 'ลำดับการส่งข้อมูล UART 1 Frame ที่ถูกต้องคือข้อใด?',
                  user: ex2Correct === null ? '(ไม่ตอบ)' : ok2 ? 'Start → Data → Stop' : '(ผิด)',
                  answer: 'Start → Data → Stop', ok: ok2 },
                { q: `Binary (LSB first): ${lsbFirst(ex3Char.charCodeAt(0))} คือตัวอักษรอะไร?`,
                  user: userCh || '(ไม่ตอบ)', answer: ex3Char, ok: ok3 }
            ]
        };
    }

    function gradeText(score) {
        return ['❗ ลองทำใหม่อีกครั้ง', '📚 ต้องฝึกเพิ่ม', '👍 ดีมาก', '🌟 ยอดเยี่ยม!'][score];
    }

    function markStep(num, ok) {
        const el = document.getElementById(`ex-step-${num}`);
        if (el) el.className = `ex-step ${ok ? 'ex-step-ok' : 'ex-step-err'}`;
    }

    function showResult(score) {
        document.getElementById('ex-final-score').textContent = `${score}/3`;
        document.getElementById('ex-grade-text').textContent  = gradeText(score);
        show('ex-result-screen');
    }

    // ── Retry ──
    function retry() {
        hide('ex-result-screen');
        show('ex-work-area');
        initExercises();
    }

    // ── Print PDF ──
    function doPrint() {
        const d = window._exPrintData;
        if (!d) return;

        const rows = d.rows.map((r, i) => `
            <tr>
                <td class="td-no">${i + 1}</td>
                <td>${r.q}</td>
                <td class="td-mono">${r.user}</td>
                <td class="td-mono">${r.answer}</td>
                <td class="${r.ok ? 'td-ok' : 'td-err'}">${r.ok ? '✓' : '✗'}</td>
            </tr>`).join('');

        document.getElementById('print-area').innerHTML = `
            <div class="ps">
                <div class="ps-head">
                    <div class="ps-logo">🔗 UART Protocol Simulator</div>
                    <h2>ใบส่งแบบฝึกหัด</h2>
                    <p>วิชา: ระบบสมองกลฝังตัว &nbsp;|&nbsp; ระดับ ปวส.</p>
                </div>
                <div class="ps-info">
                    <span>ชื่อ-นามสกุล: <u>${d.name}</u></span>
                    <span>วันที่: <u>${d.date}</u></span>
                </div>
                <table class="ps-table">
                    <thead><tr><th>ข้อ</th><th>คำถาม</th><th>คำตอบนักเรียน</th><th>เฉลย</th><th>ผล</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
                <div class="ps-footer">
                    <div class="ps-score-box">
                        <div class="ps-score-num">${d.score}/3</div>
                        <div class="ps-score-pct">${Math.round(d.score/3*100)}%</div>
                        <div class="ps-score-grade">${d.grade}</div>
                    </div>
                    <div class="ps-sign-box">
                        <div class="ps-sign-line"></div>
                        <div>ลายเซ็นครูผู้สอน</div>
                    </div>
                    <div class="ps-sign-box">
                        <div class="ps-sign-line"></div>
                        <div>ลายเซ็นนักเรียน</div>
                    </div>
                </div>
            </div>`;

        window.print();
    }

    // ── Boot ──
    document.addEventListener('DOMContentLoaded', () => {
        setupNameEntry();
        document.getElementById('btn-ex-submit').addEventListener('click', checkAll);
        document.getElementById('btn-ex-retry').addEventListener('click', retry);
        document.getElementById('btn-ex-print').addEventListener('click', doPrint);
    });
})();
