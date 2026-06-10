(function () {
    // I2C Address pool for hands-on exercises
    const ADDR_POOL = [
        { hex: 0x3C, hexStr: '0x3C', name: 'OLED SSD1306',      dec: 60,  desc: 'จอ OLED' },
        { hex: 0x68, hexStr: '0x68', name: 'DS3231 RTC',         dec: 104, desc: 'นาฬิกา' },
        { hex: 0x76, hexStr: '0x76', name: 'BME280',              dec: 118, desc: 'เซนเซอร์อุณหภูมิ' },
        { hex: 0x27, hexStr: '0x27', name: 'LCD I2C (PCF8574)',  dec: 39,  desc: 'จอ LCD' },
        { hex: 0x50, hexStr: '0x50', name: 'AT24C32 EEPROM',     dec: 80,  desc: 'หน่วยความจำ' },
    ];

    function toBin7(n) { return n.toString(2).padStart(7, '0'); }
    function toBin8(n) { return n.toString(2).padStart(8, '0'); }
    function randAddr(excludeHex) {
        let a;
        do { a = ADDR_POOL[Math.floor(Math.random() * ADDR_POOL.length)]; } while (a.hex === excludeHex);
        return a;
    }

    const COLORS = [
        'linear-gradient(135deg, #0891b2, #0e7490)',
        'linear-gradient(135deg, #7c3aed, #6d28d9)',
        'linear-gradient(135deg, #f59e0b, #d97706)',
        'linear-gradient(135deg, #f97316, #ea580c)',
        'linear-gradient(135deg, #06b6d4, #0891b2)',
        'linear-gradient(135deg, #22c55e, #16a34a)',
        'linear-gradient(135deg, #ef4444, #dc2626)',
        'linear-gradient(135deg, #10b981, #059669)',
        'linear-gradient(135deg, #6366f1, #4f46e5)',
        'linear-gradient(135deg, #ec4899, #db2777)',
    ];

    // MCQ pool — 2 variants per section group
    const MCQ_GROUPS = [
        // Section 1: I2C คืออะไร?
        [
            {
                section: 'Section 1: I2C คืออะไร?',
                q: 'I2C ใช้สายสัญญาณหลักกี่เส้น (ไม่นับ GND และ VCC)?',
                opts: ['1 เส้น', '2 เส้น (SDA และ SCL)', '3 เส้น (SDA, SCL, CS)', '4 เส้น'],
                answer: 1
            },
            {
                section: 'Section 1: I2C คืออะไร?',
                q: 'I2C เป็นการสื่อสารแบบใด?',
                opts: ['Asynchronous (ไม่มี Clock)', 'Synchronous Half-Duplex (มี Clock ผลัดส่ง-รับ)', 'Full-Duplex (ส่งรับพร้อมกัน)', 'Wireless (ไร้สาย)'],
                answer: 1
            }
        ],
        // Section 2: สายสัญญาณ + Pull-up
        [
            {
                section: 'Section 2: สายสัญญาณ I2C',
                q: 'ทำไม SDA และ SCL ต้องมี Pull-up Resistor?',
                opts: ['เพื่อป้องกันไฟฟ้าสถิต', 'สายเป็น Open-drain — ดึงขึ้น HIGH เองไม่ได้', 'เพิ่มความเร็วการส่งข้อมูล', 'ลดสัญญาณรบกวน (Noise)'],
                answer: 1
            },
            {
                section: 'Section 2: สายสัญญาณ I2C',
                q: 'ค่า Pull-up Resistor ที่นิยมใช้กับ I2C มาตรฐาน คือ?',
                opts: ['100 Ω', '1 kΩ', '4.7 kΩ', '47 kΩ'],
                answer: 2
            }
        ],
        // Section 3: Master/Slave
        [
            {
                section: 'Section 3: Master และ Slave',
                q: 'ใครเป็นผู้สร้างสัญญาณ Clock (SCL) ใน I2C?',
                opts: ['Slave', 'Master', 'ทั้ง Master และ Slave สลับกัน', 'อุปกรณ์ใดก็ได้'],
                answer: 1
            },
            {
                section: 'Section 3: Master และ Slave',
                q: 'Slave แต่ละตัวใน I2C ต้องมีอะไรที่ไม่ซ้ำกันบน Bus?',
                opts: ['MAC Address', '7-bit Address เฉพาะตัว', 'Serial Number', 'Baud Rate'],
                answer: 1
            }
        ],
        // Section 4: Address 7-bit
        [
            {
                section: 'Section 4: Address ของ Slave (7-bit)',
                q: '7-bit Address รองรับ Slave ได้สูงสุดกี่ตัว (ทางทฤษฎี)?',
                opts: ['64 ตัว (2⁶)', '128 ตัว (2⁷)', '256 ตัว (2⁸)', '512 ตัว'],
                answer: 1
            },
            {
                section: 'Section 4: Address ของ Slave (7-bit)',
                q: 'OLED SSD1306 มี I2C Address (Hex) คือข้อใด?',
                opts: ['0x27', '0x3C', '0x68', '0x76'],
                answer: 1
            }
        ],
        // Section 5: Data Frame
        [
            {
                section: 'Section 5: Data Frame',
                q: 'R/W bit = 0 หมายถึงอะไร?',
                opts: ['Master อ่านข้อมูลจาก Slave (Read)', 'Master เขียนข้อมูลไปยัง Slave (Write)', 'Reset การสื่อสาร', 'ไม่มีข้อมูลส่ง'],
                answer: 1
            },
            {
                section: 'Section 5: Data Frame',
                q: 'Address byte ใน I2C ประกอบด้วยอะไร?',
                opts: ['8-bit ข้อมูลล้วน', '7-bit address + 1 R/W bit', '6-bit address + 2 control bits', '8-bit address ล้วน'],
                answer: 1
            }
        ],
        // Section 6: ACK/NACK
        [
            {
                section: 'Section 6: ACK และ NACK',
                q: 'ACK (Acknowledge) — Slave ดึง SDA เป็นค่าใด?',
                opts: ['HIGH (1)', 'LOW (0)', 'สลับ HIGH-LOW', 'ปล่อยค้าง (Hi-Z)'],
                answer: 1
            },
            {
                section: 'Section 6: ACK และ NACK',
                q: 'NACK เกิดขึ้นเมื่อใด?',
                opts: ['รับข้อมูลสำเร็จทุกครั้ง', 'Slave ไม่ตอบ / Address ไม่ตรง / รับครบแล้ว', 'Master กำลังส่งข้อมูล', 'เริ่ม Transaction ใหม่'],
                answer: 1
            }
        ],
        // Section 7: ขั้นตอน
        [
            {
                section: 'Section 7: ขั้นตอนการสื่อสาร I2C',
                q: 'Start Condition ของ I2C เกิดขึ้นอย่างไร?',
                opts: [
                    'SCL: HIGH→LOW ขณะ SDA HIGH',
                    'SDA: HIGH→LOW ขณะ SCL HIGH',
                    'SDA: LOW→HIGH ขณะ SCL HIGH',
                    'SCL: LOW→HIGH ขณะ SDA HIGH'
                ],
                answer: 1
            },
            {
                section: 'Section 7: ขั้นตอนการสื่อสาร I2C',
                q: 'Stop Condition ของ I2C เกิดขึ้นอย่างไร?',
                opts: [
                    'SDA: HIGH→LOW ขณะ SCL HIGH',
                    'SDA: LOW→HIGH ขณะ SCL HIGH',
                    'SCL: HIGH→LOW ขณะ SDA HIGH',
                    'SCL: LOW→HIGH ขณะ SDA HIGH'
                ],
                answer: 1
            }
        ],
        // Bonus: I2C vs. others
        [
            {
                section: 'I2C: ลักษณะเด่น',
                q: 'ข้อใดคือข้อดีหลักของ I2C เมื่อเทียบกับ SPI?',
                opts: [
                    'I2C ส่งข้อมูลเร็วกว่า SPI มาก',
                    'I2C ใช้สายน้อยกว่า (2 เส้น) และต่อหลายอุปกรณ์บน Bus เดียวได้',
                    'I2C ไม่ต้องมี Clock ทำให้ง่ายกว่า',
                    'I2C รองรับระยะทางไกลกว่า SPI'
                ],
                answer: 1
            },
            {
                section: 'I2C: ลักษณะเด่น',
                q: 'I2C ต่างจาก UART ตรงไหนที่สำคัญ?',
                opts: [
                    'I2C เร็วกว่าและไม่ต้องมี Clock',
                    'I2C มี Clock (Synchronous), Half-Duplex และต่อหลายอุปกรณ์บน Bus ได้',
                    'I2C ใช้สายมากกว่า UART',
                    'I2C เป็น Full-Duplex เหมือน UART'
                ],
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

    // ── Build session: 8 MCQ + 2 address hands-on = 10 questions ──
    function buildSession() {
        submitted = false;
        questions = [];

        MCQ_GROUPS.forEach(group => {
            const raw = group[Math.floor(Math.random() * group.length)];
            const shuffled = raw.opts
                .map((text, i) => ({ text, isCorrect: i === raw.answer }))
                .sort(() => Math.random() - 0.5);
            questions.push({ type: 'mcq', section: raw.section, q: raw.q, opts: shuffled });
        });

        // Hands-on: addr-bin at slot 3, addr-byte at slot 7
        const a1 = randAddr(null);
        const a2 = randAddr(a1.hex);
        const rw = Math.random() < 0.5 ? 0 : 1;
        questions.splice(3, 0, { type: 'addr-bin',  addr: a1, section: 'Section 4: Address (ปฏิบัติ)' });
        questions.splice(7, 0, { type: 'addr-byte', addr: a2, rw,   section: 'Section 5: Address Byte (ปฏิบัติ)' });

        renderCards();
        updateProgress(0);
        const btn = document.getElementById('btn-ex-submit');
        btn.classList.remove('hidden');
        btn.disabled = false;
    }

    // ── Render all cards ──
    function renderCards() {
        const container = document.getElementById('ex-cards-container');
        container.innerHTML = '';

        questions.forEach((q, idx) => {
            const card = document.createElement('div');
            card.className = 'ex-card';

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

        // Attach MCQ click handlers after DOM is ready
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
        if (q.type === 'addr-bin')  return 'แปลง I2C Address → Binary 7-bit';
        if (q.type === 'addr-byte') return 'คำนวณ Address Byte (7-bit + R/W)';
        return 'คำถามปรนัย';
    }

    function buildCardBody(q, idx) {
        const wrap = document.createElement('div');

        if (q.type === 'addr-bin') {
            wrap.innerHTML = `
                <p class="ex-q">
                    อุปกรณ์ <strong class="ex-hl">${q.addr.name}</strong> (${q.addr.desc})<br>
                    มี I2C Address = <strong>${q.addr.hexStr}</strong> (Decimal: ${q.addr.dec})<br>
                    จงแปลงเป็น <strong>Binary 7-bit</strong> (b6 = MSB ซ้ายสุด → b0 = LSB ขวาสุด):
                </p>
                <div class="bit-row" id="bits-${idx}"></div>
                <p class="ex-hint">💡 Decimal ${q.addr.dec} → แปลงเป็น Binary แล้วเติม 0 ข้างหน้าให้ครบ 7 bit (64, 32, 16, 8, 4, 2, 1)</p>`;
            setTimeout(() => buildBitInputs(idx, 7, i => i === 6 ? 'b6\nMSB' : i === 0 ? 'b0\nLSB' : `b${i}`), 0);

        } else if (q.type === 'addr-byte') {
            const rwLabel = q.rw === 0 ? 'Write (R/W = 0)' : 'Read (R/W = 1)';
            const byteVal = (q.addr.hex << 1) | q.rw;
            wrap.innerHTML = `
                <p class="ex-q">
                    ส่ง Address Byte ไปยัง <strong class="ex-hl">${q.addr.name}</strong> (${q.addr.hexStr})<br>
                    สำหรับ <strong>${rwLabel}</strong><br>
                    Address Byte = [7-bit addr | R/W] = Decimal <strong>${byteVal}</strong> — กรอก 8-bit Binary (b7=MSB):
                </p>
                <div class="bit-row" id="bits-${idx}"></div>
                <p class="ex-hint">💡 วิธี: (${q.addr.hexStr} &lt;&lt; 1) | ${q.rw} = ${byteVal} → แปลงเป็น Binary 8 bit</p>`;
            setTimeout(() => buildBitInputs(idx, 8, i => i === 7 ? 'b7\nMSB' : i === 0 ? 'b0\nR/W' : `b${i}`), 0);

        } else {
            const optsHtml = q.opts.map((opt, i) =>
                `<button class="ex2-btn" data-oidx="${i}">${opt.text}</button>`
            ).join('');
            wrap.innerHTML = `<p class="ex-q">${q.q}</p><div class="ex2-opts" id="opts-${idx}">${optsHtml}</div>`;
        }

        return wrap;
    }

    // bits = total bit count; labelFn(bitValue) → label string (e.g. 'b6\nMSB')
    // Renders MSB on the left (box 0 = highest bit)
    function buildBitInputs(idx, bits, labelFn) {
        const wrap = document.getElementById(`bits-${idx}`);
        if (!wrap) return;
        for (let i = bits - 1; i >= 0; i--) {
            const boxPos = bits - 1 - i; // 0 = MSB

            const col = document.createElement('div');
            col.className = 'bit-col';

            const lbl = document.createElement('span');
            lbl.className = 'bit-pos';
            lbl.textContent = labelFn(i);

            const inp = document.createElement('input');
            inp.type = 'text';
            inp.maxLength = 1;
            inp.className = 'bit-box';
            inp.id = `bit-${idx}-${boxPos}`;

            inp.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && inp.value === '') {
                    const prev = document.getElementById(`bit-${idx}-${boxPos - 1}`);
                    if (prev) { prev.value = ''; prev.focus(); }
                }
            });
            inp.addEventListener('input', () => {
                if (inp.value !== '0' && inp.value !== '1') { inp.value = ''; return; }
                const next = document.getElementById(`bit-${idx}-${boxPos + 1}`);
                if (next) next.focus();
            });

            col.appendChild(lbl);
            col.appendChild(inp);
            wrap.appendChild(col);
        }
    }

    // ── Answer helpers ──
    function readBitBoxes(idx, count) {
        return Array.from({ length: count }, (_, i) => {
            const v = (document.getElementById(`bit-${idx}-${i}`) || {}).value;
            return (v === '0' || v === '1') ? v : '_';
        }).join('');
    }

    function getUserAnswer(q, idx) {
        if (q.type === 'addr-bin')  return readBitBoxes(idx, 7);
        if (q.type === 'addr-byte') return readBitBoxes(idx, 8);
        const sel = document.querySelector(`#opts-${idx} .ex2-selected`);
        return sel ? parseInt(sel.dataset.oidx) : null;
    }

    function isCorrect(q, ans) {
        if (q.type === 'addr-bin')  return ans === toBin7(q.addr.hex);
        if (q.type === 'addr-byte') return ans === toBin8((q.addr.hex << 1) | q.rw);
        return ans !== null && q.opts[ans].isCorrect;
    }

    function correctHTML(q) {
        if (q.type === 'addr-bin')  return `<code>${toBin7(q.addr.hex)}</code>`;
        if (q.type === 'addr-byte') {
            const byte = (q.addr.hex << 1) | q.rw;
            return `<code>${toBin8(byte)}</code> (0x${byte.toString(16).toUpperCase().padStart(2, '0')})`;
        }
        const c = q.opts.find(o => o.isCorrect);
        return `<strong>${c ? c.text : '-'}</strong>`;
    }

    function correctPlain(q) {
        if (q.type === 'addr-bin')  return toBin7(q.addr.hex);
        if (q.type === 'addr-byte') return toBin8((q.addr.hex << 1) | q.rw);
        const c = q.opts.find(o => o.isCorrect);
        return c ? c.text : '-';
    }

    function questionText(q) {
        if (q.type === 'addr-bin')  return `แปลง I2C Address ${q.addr.name} (${q.addr.hexStr} = ${q.addr.dec}) เป็น Binary 7-bit (MSB first)`;
        if (q.type === 'addr-byte') {
            const rwLabel = q.rw === 0 ? 'Write' : 'Read';
            return `Address Byte ของ ${q.addr.name} (${q.addr.hexStr}) สำหรับ ${rwLabel} — 8-bit Binary คือ?`;
        }
        return q.q;
    }

    function userAnswerText(q, ans) {
        if (q.type === 'addr-bin' || q.type === 'addr-byte') return typeof ans === 'string' ? ans : '?';
        if (ans === null) return '(ไม่ตอบ)';
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
            const bitCount = q.type === 'addr-bin' ? 7 : q.type === 'addr-byte' ? 8 : 0;
            if (bitCount > 0) {
                for (let i = 0; i < bitCount; i++) {
                    const el = document.getElementById(`bit-${idx}-${i}`);
                    if (el) el.disabled = true;
                }
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
                    <div class="ps-logo">🔄 I2C Protocol Simulator</div>
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
