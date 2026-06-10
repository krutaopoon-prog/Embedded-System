(function () {
    const POOL = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'];

    function toBin8(n) { return n.toString(2).padStart(8, '0'); }
    function lsbFirst(n) { return toBin8(n).split('').reverse().join(''); }
    function randChar(exclude) {
        let c;
        do { c = POOL[Math.floor(Math.random() * POOL.length)]; } while (c === exclude);
        return c;
    }

    // 10 card colors — one per question
    const COLORS = [
        'linear-gradient(135deg, #0891b2, #0e7490)',
        'linear-gradient(135deg, #8b5cf6, #7c3aed)',
        'linear-gradient(135deg, #f59e0b, #d97706)',
        'linear-gradient(135deg, #f97316, #ea580c)',
        'linear-gradient(135deg, #06b6d4, #0891b2)',
        'linear-gradient(135deg, #22c55e, #16a34a)',
        'linear-gradient(135deg, #ef4444, #dc2626)',
        'linear-gradient(135deg, #10b981, #059669)',
        'linear-gradient(135deg, #6366f1, #4f46e5)',
        'linear-gradient(135deg, #ec4899, #db2777)',
    ];

    // MCQ pool — 2 variants per section (8 sections = 8 groups)
    const MCQ_GROUPS = [
        // Section 1: UART คืออะไร?
        [
            {
                section: 'Section 1: UART คืออะไร?',
                q: 'UART ย่อมาจากคำเต็มว่าอะไร?',
                opts: ['Universal Asynchronous Receiver-Transmitter', 'Universal Automatic Radio Transmitter', 'Unified Asynchronous Relay Terminal', 'Universal Analog Radio Transmitter'],
                answer: 0
            },
            {
                section: 'Section 1: UART คืออะไร?',
                q: 'UART เป็นการสื่อสารแบบใด?',
                opts: ['Synchronous Serial (มีสัญญาณ Clock)', 'Asynchronous Serial (ไม่มีสัญญาณ Clock)', 'Parallel Communication (ส่งหลายบิตพร้อมกัน)', 'Wireless Communication (ไร้สาย)'],
                answer: 1
            }
        ],
        // Section 2: สายสัญญาณ
        [
            {
                section: 'Section 2: สายสัญญาณ UART',
                q: 'UART ใช้สายสัญญาณหลักกี่เส้น (ไม่นับ GND)?',
                opts: ['1 เส้น', '2 เส้น (TX และ RX)', '3 เส้น (TX, RX, CLK)', '4 เส้น (TX, RX, CS, CLK)'],
                answer: 1
            },
            {
                section: 'Section 2: สายสัญญาณ UART',
                q: 'การต่อสาย UART ระหว่าง 2 อุปกรณ์ที่ถูกต้องคือข้อใด?',
                opts: ['TX ต่อ TX, RX ต่อ RX (ตรง)', 'TX ต่อ RX, RX ต่อ TX (ไขว้)', 'TX และ RX รวมเป็นสายเดียว', 'ต่อผ่านสาย Clock'],
                answer: 1
            }
        ],
        // Section 3: Baud Rate
        [
            {
                section: 'Section 3: Baud Rate',
                q: 'Baud Rate มีหน่วยวัดเป็นอะไร?',
                opts: ['Hertz (Hz)', 'Volts (V)', 'bits per second (bps)', 'Bytes per second (Bps)'],
                answer: 2
            },
            {
                section: 'Section 3: Baud Rate',
                q: 'ถ้า Baud Rate ทั้ง 2 ฝ่ายไม่ตรงกัน จะเกิดอะไรขึ้น?',
                opts: ['ระบบปรับ Baud Rate ให้อัตโนมัติ', 'ข้อมูลที่รับได้จะผิดพลาด (Garbage Data)', 'ส่งข้อมูลได้ปกติ แต่ช้าลง', 'อุปกรณ์จะดับทันที'],
                answer: 1
            }
        ],
        // Section 4: ASCII (MCQ)
        [
            {
                section: "Section 4: ASCII",
                q: "ตัวอักษร 'A' มีค่า ASCII Decimal เท่าใด?",
                opts: ['64', '65', '66', '97'],
                answer: 1
            },
            {
                section: "Section 4: ASCII",
                q: 'ASCII ย่อมาจากอะไร?',
                opts: [
                    'American Standard Code for Information Interchange',
                    'Advanced System Code for Interface Input',
                    'Automatic Serial Code for Information Input',
                    'American Signal Code for Integer Interchange'
                ],
                answer: 0
            }
        ],
        // Section 5: Data Frame
        [
            {
                section: 'Section 5: Data Frame',
                q: 'Start Bit ใน UART มีค่าเป็นอะไร?',
                opts: ['HIGH (Logic 1)', 'LOW (Logic 0)', 'ขึ้นกับข้อมูลที่ส่ง', 'สลับ HIGH-LOW'],
                answer: 1
            },
            {
                section: 'Section 5: Data Frame',
                q: 'UART ส่ง Data Bits ในลำดับใดก่อน?',
                opts: ['MSB first (บิตค่ามากสุดก่อน)', 'LSB first (บิตค่าน้อยสุดก่อน)', 'ส่งทุกบิตพร้อมกัน', 'สุ่มลำดับ'],
                answer: 1
            },
            {
                section: 'Section 5: Data Frame',
                q: 'Stop Bit ใน UART มีค่าเป็นอะไร?',
                opts: ['LOW (Logic 0)', 'HIGH (Logic 1)', 'ขึ้นกับข้อมูลที่ส่ง', 'ไม่มีค่า'],
                answer: 1
            }
        ],
        // Section 6: Idle State
        [
            {
                section: 'Section 6: Idle State',
                q: 'เมื่อ UART ไม่ได้ส่งข้อมูล (Idle State) สายจะอยู่ในสถานะอะไร?',
                opts: ['LOW (0)', 'HIGH (1)', 'ลอยตัว (Hi-Z)', 'สลับ HIGH-LOW'],
                answer: 1
            },
            {
                section: 'Section 6: Idle State',
                q: 'Falling Edge ใน UART เกิดขึ้นเมื่อใด?',
                opts: ['เมื่อส่ง Stop Bit เสร็จ', 'เมื่อเริ่ม Start Bit (Idle HIGH → LOW)', 'เมื่อส่ง Data Bit ที่มีค่า 0', 'เมื่อเปลี่ยน Baud Rate'],
                answer: 1
            }
        ],
        // Section 7: Full-Duplex
        [
            {
                section: 'Section 7: Full-Duplex',
                q: 'UART สามารถส่งและรับข้อมูลพร้อมกันได้ เรียกว่าอะไร?',
                opts: ['Simplex', 'Half-Duplex', 'Full-Duplex', 'Multi-plex'],
                answer: 2
            },
            {
                section: 'Section 7: Full-Duplex',
                q: 'UART เชื่อมต่อแบบ Point-to-Point ได้กี่อุปกรณ์?',
                opts: ['1 อุปกรณ์', '2 อุปกรณ์', 'หลายอุปกรณ์ (Multi-drop)', 'ไม่จำกัด'],
                answer: 1
            }
        ],
        // Section 8: ขั้นตอนการส่งข้อมูล
        [
            {
                section: 'Section 8: ขั้นตอนการส่งข้อมูล',
                q: 'ที่ Baud Rate 9600 bps เวลาส่ง 1 bit ≈ เท่าใด?',
                opts: ['10 μs', '52 μs', '104 μs', '1000 μs'],
                answer: 2
            },
            {
                section: 'Section 8: ขั้นตอนการส่งข้อมูล',
                q: 'ที่ Baud Rate 9600 เวลาส่ง 1 Frame (10 bits) ≈ เท่าใด?',
                opts: ['0.1 ms', '1.04 ms', '10.4 ms', '104 ms'],
                answer: 1
            }
        ]
    ];

    let questions = [];
    let submitted = false;

    function show(id) { document.getElementById(id).classList.remove('hidden'); }
    function hide(id) { document.getElementById(id).classList.add('hidden'); }

    // ── Name entry ──
    function setupNameEntry() {
        const nameInput = document.getElementById('ex-student-name');
        const startBtn  = document.getElementById('btn-ex-start');
        if (!nameInput || !startBtn) return;
        nameInput.addEventListener('input', () => { startBtn.disabled = nameInput.value.trim().length === 0; });
        startBtn.addEventListener('click', () => {
            const name = nameInput.value.trim();
            const display = document.getElementById('ex-name-display');
            if (display) display.textContent = `👤 ${name}`;
            hide('ex-entry');
            show('ex-work-area');
            buildSession();
        });
    }

    // ── Build session: 8 MCQ (1 per section) + 2 hands-on = 10 questions ──
    function buildSession() {
        submitted = false;
        questions = [];

        // 1 random MCQ from each of the 8 section groups
        MCQ_GROUPS.forEach(group => {
            const raw = group[Math.floor(Math.random() * group.length)];
            const shuffled = raw.opts
                .map((text, i) => ({ text, isCorrect: i === raw.answer }))
                .sort(() => Math.random() - 0.5);
            questions.push({ type: 'mcq', section: raw.section, q: raw.q, opts: shuffled });
        });

        // Insert 2 hands-on exercises: char→binary at slot 3, binary→char at slot 7
        const c1 = randChar(null);
        const c2 = randChar(c1);
        questions.splice(3, 0, { type: 'binary',  char: c1, section: 'Section 4: ASCII (ปฏิบัติ)' });
        questions.splice(7, 0, { type: 'reverse', char: c2, section: 'Section 4: ASCII (ปฏิบัติ)' });

        renderCards();
        updateProgress(0);
        const btn = document.getElementById('btn-ex-submit');
        btn.classList.remove('hidden');
        btn.disabled = false;
    }

    // ── Render all cards dynamically ──
    function renderCards() {
        const container = document.getElementById('ex-cards-container');
        container.innerHTML = '';

        questions.forEach((q, idx) => {
            const card = document.createElement('div');
            card.className = 'ex-card';
            card.id = `dyn-card-${idx}`;

            const top = document.createElement('div');
            top.className = 'ex-card-top';
            top.style.background = COLORS[idx % COLORS.length];
            top.innerHTML = `
                <span class="ex-card-num">ข้อ ${idx + 1}/${questions.length}</span>
                <span class="ex-card-title">${cardTitle(q)}</span>
                <span class="ex-section-tag">${q.section}</span>`;
            card.appendChild(top);

            const body = document.createElement('div');
            body.className = 'ex-card-body';
            body.appendChild(buildCardBody(q, idx));

            const fb = document.createElement('div');
            fb.className = 'ex-fb hidden';
            fb.id = `fb-${idx}`;
            body.appendChild(fb);

            card.appendChild(body);
            container.appendChild(card);
        });

        // Attach MCQ handlers after all cards are in DOM
        questions.forEach((q, idx) => {
            if (q.type !== 'mcq') return;
            document.querySelectorAll(`#opts-${idx} .ex2-btn`).forEach(btn => {
                btn.addEventListener('click', () => {
                    if (submitted) return;
                    document.querySelectorAll(`#opts-${idx} .ex2-btn`).forEach(b => b.classList.remove('ex2-selected'));
                    btn.classList.add('ex2-selected');
                });
            });
        });
    }

    function cardTitle(q) {
        if (q.type === 'binary')  return 'แปลงตัวอักษรเป็น Binary';
        if (q.type === 'reverse') return 'อ่าน Binary → ตัวอักษร';
        return 'คำถามปรนัย';
    }

    function buildCardBody(q, idx) {
        const wrap = document.createElement('div');

        if (q.type === 'binary') {
            wrap.innerHTML = `
                <p class="ex-q">ตัวอักษร <strong class="ex-hl">'${q.char}'</strong> มีค่า ASCII Decimal = <strong>${q.char.charCodeAt(0)}</strong><br>
                กรอกค่า Binary 8 bit (b0 = LSB ซ้ายสุด → b7 = MSB ขวาสุด):</p>
                <div class="bit-row" id="bits-${idx}"></div>
                <p class="ex-hint">💡 ดูตาราง ASCII ใน Section 4</p>`;
            setTimeout(() => buildBitInputs(idx), 0);

        } else if (q.type === 'reverse') {
            wrap.innerHTML = `
                <p class="ex-q">Binary (LSB first): <code class="ex3-bin">${lsbFirst(q.char.charCodeAt(0))}</code><br>
                ค่านี้คือตัวอักษรอะไร? (ใช้ตาราง ASCII ใน Section 4)</p>
                <div class="ex3-row">
                    <label>ตัวอักษร:</label>
                    <input type="text" id="rev-${idx}" maxlength="1" placeholder="?" class="ex3-input" autocomplete="off">
                </div>`;

        } else {
            const optsHtml = q.opts.map((opt, i) =>
                `<button class="ex2-btn" data-oidx="${i}">${opt.text}</button>`
            ).join('');
            wrap.innerHTML = `<p class="ex-q">${q.q}</p><div class="ex2-opts" id="opts-${idx}">${optsHtml}</div>`;
        }

        return wrap;
    }

    function buildBitInputs(idx) {
        const wrap = document.getElementById(`bits-${idx}`);
        if (!wrap) return;
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
            inp.id = `bit-${idx}-${i}`;

            inp.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && inp.value === '') {
                    const prev = document.getElementById(`bit-${idx}-${i - 1}`);
                    if (prev) { prev.value = ''; prev.focus(); }
                }
            });
            inp.addEventListener('input', () => {
                if (inp.value !== '0' && inp.value !== '1') { inp.value = ''; return; }
                const next = document.getElementById(`bit-${idx}-${i + 1}`);
                if (next) next.focus();
            });

            col.appendChild(lbl);
            col.appendChild(inp);
            wrap.appendChild(col);
        }
    }

    // ── Answer helpers ──
    function getUserAnswer(q, idx) {
        if (q.type === 'binary') {
            return Array.from({ length: 8 }, (_, i) => {
                const v = (document.getElementById(`bit-${idx}-${i}`) || {}).value;
                return (v === '0' || v === '1') ? v : '_';
            }).join('');
        }
        if (q.type === 'reverse') {
            return (document.getElementById(`rev-${idx}`) || {}).value || '';
        }
        const sel = document.querySelector(`#opts-${idx} .ex2-selected`);
        return sel ? parseInt(sel.dataset.oidx) : null;
    }

    function isCorrect(q, ans) {
        if (q.type === 'binary')  return ans === lsbFirst(q.char.charCodeAt(0));
        if (q.type === 'reverse') return ans.trim() === q.char;
        return ans !== null && q.opts[ans].isCorrect;
    }

    function correctHTML(q) {
        if (q.type === 'binary')  return `<code>${lsbFirst(q.char.charCodeAt(0))}</code>`;
        if (q.type === 'reverse') return `<strong>'${q.char}'</strong> (ASCII ${q.char.charCodeAt(0)})`;
        const c = q.opts.find(o => o.isCorrect);
        return `<strong>${c ? c.text : '-'}</strong>`;
    }

    function correctPlain(q) {
        if (q.type === 'binary')  return lsbFirst(q.char.charCodeAt(0));
        if (q.type === 'reverse') return q.char;
        const c = q.opts.find(o => o.isCorrect);
        return c ? c.text : '-';
    }

    function questionText(q) {
        if (q.type === 'binary')  return `แปลง '${q.char}' (ASCII ${q.char.charCodeAt(0)}) เป็น Binary 8 bit (LSB first)`;
        if (q.type === 'reverse') return `Binary (LSB first): ${lsbFirst(q.char.charCodeAt(0))} คือตัวอักษรอะไร?`;
        return q.q;
    }

    function userAnswerText(q, ans) {
        if (q.type === 'binary')  return typeof ans === 'string' ? ans : '?';
        if (q.type === 'reverse') return ans || '(ไม่ตอบ)';
        if (ans === null)          return '(ไม่ตอบ)';
        return q.opts[ans]?.text || '?';
    }

    function gradeText(score, total) {
        const pct = score / total;
        if (pct >= 0.9) return '🌟 ยอดเยี่ยม!';
        if (pct >= 0.7) return '👍 ดีมาก';
        if (pct >= 0.5) return '📚 พอใช้ได้ ควรทบทวน';
        return '❗ ต้องฝึกเพิ่ม';
    }

    function updateProgress(done) {
        const el = document.getElementById('ex-progress-text');
        if (el) el.textContent = `${done} / ${questions.length} ข้อ`;
    }

    // ── Check all answers ──
    function checkAll() {
        if (submitted) return;
        submitted = true;

        let score = 0;
        const rows = [];

        questions.forEach((q, idx) => {
            const ans = getUserAnswer(q, idx);
            const ok  = isCorrect(q, ans);
            if (ok) score++;

            // Disable inputs
            if (q.type === 'binary') {
                for (let i = 0; i < 8; i++) {
                    const el = document.getElementById(`bit-${idx}-${i}`);
                    if (el) el.disabled = true;
                }
            } else if (q.type === 'reverse') {
                const el = document.getElementById(`rev-${idx}`);
                if (el) el.disabled = true;
            } else {
                document.querySelectorAll(`#opts-${idx} .ex2-btn`).forEach(btn => {
                    btn.disabled = true;
                    if (q.opts[parseInt(btn.dataset.oidx)]?.isCorrect) btn.classList.add('ex2-correct');
                });
            }

            // Feedback
            const fb = document.getElementById(`fb-${idx}`);
            if (fb) {
                const uText = userAnswerText(q, ans);
                const uFmt  = q.type === 'mcq' ? `<em>${uText}</em>` : `<code>${uText}</code>`;
                fb.className = `ex-fb ${ok ? 'ex-ok' : 'ex-err'}`;
                fb.innerHTML  = ok
                    ? `✅ ถูกต้อง! ${correctHTML(q)}`
                    : `❌ ผิด — เฉลย: ${correctHTML(q)} &nbsp;|&nbsp; คุณตอบ: ${uFmt}`;
            }

            updateProgress(idx + 1);
            rows.push({ q: questionText(q), user: userAnswerText(q, ans), answer: correctPlain(q), ok });
        });

        const total = questions.length;
        window._exPrintData = {
            name : (document.getElementById('ex-student-name').value || '').trim() || '(ไม่ระบุ)',
            date : new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }),
            score, total,
            grade: gradeText(score, total).replace(/[🌟👍📚❗]/g, '').trim(),
            rows
        };

        setTimeout(() => {
            hide('ex-work-area');
            showResult(score, total);
        }, 1200);
    }

    function showResult(score, total) {
        document.getElementById('ex-final-score').textContent = `${score}/${total}`;
        document.getElementById('ex-grade-text').textContent  = gradeText(score, total);
        show('ex-result-screen');
    }

    function retry() {
        hide('ex-result-screen');
        show('ex-work-area');
        buildSession();
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
                    <thead><tr><th>ข้อ</th><th>คำถาม</th><th>คำตอบ</th><th>เฉลย</th><th>ผล</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
                <div class="ps-footer">
                    <div class="ps-score-box">
                        <div class="ps-score-num">${d.score}/${d.total}</div>
                        <div class="ps-score-pct">${Math.round(d.score / d.total * 100)}%</div>
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

    document.addEventListener('DOMContentLoaded', () => {
        setupNameEntry();
        document.getElementById('btn-ex-submit').addEventListener('click', checkAll);
        document.getElementById('btn-ex-retry').addEventListener('click', retry);
        document.getElementById('btn-ex-print').addEventListener('click', doPrint);
    });
})();
