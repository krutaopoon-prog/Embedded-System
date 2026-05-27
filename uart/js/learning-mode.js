/**
 * Learning Mode - UART Simulator Controller
 */

class LearningMode {
    constructor() {
        this.engine = new UARTEngine();
        this.animation = new UARTAnimation('uart-waveform');
        this.isAutoRunning = false;

        this.elements = {
            inputData: document.getElementById('input-data'),
            baudRate: document.getElementById('baud-rate'),
            parity: document.getElementById('parity'),
            stopBits: document.getElementById('stop-bits'),
            btnSend: document.getElementById('btn-send'),
            btnStep: document.getElementById('btn-step'),
            btnReset: document.getElementById('btn-reset'),
            txData: document.getElementById('tx-data'),
            rxData: document.getElementById('rx-data'),
            txBits: document.getElementById('tx-bits'),
            rxBits: document.getElementById('rx-bits'),
            txLabels: document.getElementById('tx-labels'),
            rxLabels: document.getElementById('rx-labels'),
            explanation: document.getElementById('explanation'),
            logContent: document.getElementById('log-content')
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupEngineCallbacks();
        this.renderBitDisplay();
    }

    setupEventListeners() {
        if (this.elements.btnSend) {
            this.elements.btnSend.addEventListener('click', () => this.sendAuto());
        }
        if (this.elements.btnStep) {
            this.elements.btnStep.addEventListener('click', () => this.stepOnce());
        }
        if (this.elements.btnReset) {
            this.elements.btnReset.addEventListener('click', () => this.reset());
        }
    }

    setupEngineCallbacks() {
        this.engine.onStateChange = (data) => {
            this.addLog(`[TX] ส่งตัว '${data.char}' (ASCII: ${data.ascii}, Binary: ${data.binary})`);
            this.addLog(`[Config] Baud Rate: ${data.baudRate}, Frame: ${data.frame.length} bits`);
            this.elements.txData.textContent = `'${data.char}' = ${data.ascii} (0x${data.ascii.toString(16).toUpperCase()})`;
            this.renderFrameBits(data.frame);
            this.updateExplanation('started', data);
        };

        this.engine.onBitSent = (data) => {
            this.addLog(`  [Bit ${data.index}] ${data.bit.label} = ${data.bit.value} (${data.bit.type})`);
            this.highlightBit(data.index);
            if (this.animation) {
                this.animation.drawFrame(this.engine.frame, data.index);
            }
            this.updateExplanation('bit', data);
        };

        this.engine.onFrameComplete = (data) => {
            this.addLog(`[RX] รับข้อมูลเสร็จ: '${data.char}' (${data.rxData})`);
            this.elements.rxData.textContent = `'${data.char}' = ${data.rxData} (0x${data.rxData.toString(16).toUpperCase()})`;
            this.updateExplanation('complete', data);
        };
    }

    /**
     * Send automatically (all bits with delay)
     */
    async sendAuto() {
        if (this.isAutoRunning) return;

        const char = this.elements.inputData.value || 'A';
        this.applyConfig();
        this.isAutoRunning = true;
        this.elements.btnSend.disabled = true;
        this.elements.btnStep.disabled = true;

        await this.engine.sendAll(char, 300);

        this.isAutoRunning = false;
        this.elements.btnSend.disabled = false;
        this.elements.btnStep.disabled = false;
    }

    /**
     * Step one bit at a time
     */
    stepOnce() {
        if (this.isAutoRunning) return;

        if (!this.engine.isTransmitting && !this.engine.isComplete) {
            const char = this.elements.inputData.value || 'A';
            this.applyConfig();
            this.engine.start(char);
        }

        if (!this.engine.isComplete) {
            this.engine.step();
        }
    }

    /**
     * Apply UI config to engine
     */
    applyConfig() {
        this.engine.configure({
            baudRate: parseInt(this.elements.baudRate.value),
            parity: this.elements.parity.value,
            stopBits: parseInt(this.elements.stopBits.value)
        });
    }

    /**
     * Reset everything
     */
    reset() {
        this.engine.reset();
        this.isAutoRunning = false;
        this.elements.btnSend.disabled = false;
        this.elements.btnStep.disabled = false;
        this.elements.txData.textContent = '-';
        this.elements.rxData.textContent = '-';
        this.renderBitDisplay();
        if (this.animation) this.animation.drawIdle();
        this.elements.explanation.innerHTML = '<p>กรอกตัวอักษรที่ต้องการส่ง แล้วกด <strong>"ส่งข้อมูล"</strong> เพื่อดูการส่งข้อมูลแบบอัตโนมัติ หรือกด <strong>"ทีละบิต"</strong> เพื่อดูทีละขั้นตอน</p><p>สังเกตว่า UART จะส่ง Start Bit (LOW) ก่อน → Data 8 bits (LSB first) → Stop Bit (HIGH)</p>';
        this.addLog('[Reset] รีเซ็ตเรียบร้อย');
    }

    /**
     * Render empty bit display
     */
    renderBitDisplay() {
        const labels = ['S', 'D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'P', 'Stop'];
        let bitsHtml = '';
        let labelsHtml = '';
        labels.forEach(l => {
            bitsHtml += `<div class="bit-cell">-</div>`;
            labelsHtml += `<span>${l}</span>`;
        });
        if (this.elements.txBits) this.elements.txBits.innerHTML = bitsHtml;
        if (this.elements.txLabels) this.elements.txLabels.innerHTML = labelsHtml;
        if (this.elements.rxBits) this.elements.rxBits.innerHTML = bitsHtml;
        if (this.elements.rxLabels) this.elements.rxLabels.innerHTML = labelsHtml;
    }

    /**
     * Render frame bits in display
     */
    renderFrameBits(frame) {
        let html = '';
        let labelHtml = '';
        frame.forEach(bit => {
            let cls = 'bit-cell';
            if (bit.type === 'start') cls += ' start';
            else if (bit.type === 'stop') cls += ' stop';
            else if (bit.type === 'parity') cls += ' parity';
            html += `<div class="${cls}">${bit.value}</div>`;
            labelHtml += `<span>${bit.label}</span>`;
        });
        if (this.elements.txBits) this.elements.txBits.innerHTML = html;
        if (this.elements.txLabels) this.elements.txLabels.innerHTML = labelHtml;
    }

    /**
     * Highlight current bit
     */
    highlightBit(index) {
        const cells = this.elements.txBits.querySelectorAll('.bit-cell');
        cells.forEach((cell, i) => {
            cell.classList.remove('active');
            if (i === index) cell.classList.add('active');
        });

        // Update RX bits progressively
        const frame = this.engine.frame;
        let rxHtml = '';
        let rxLabelHtml = '';
        frame.forEach((bit, i) => {
            let cls = 'bit-cell';
            if (i <= index) {
                if (bit.type === 'start') cls += ' start';
                else if (bit.type === 'stop') cls += ' stop';
                else if (bit.type === 'parity') cls += ' parity';
                rxHtml += `<div class="${cls}">${bit.value}</div>`;
            } else {
                rxHtml += `<div class="bit-cell">-</div>`;
            }
            rxLabelHtml += `<span>${bit.label}</span>`;
        });
        if (this.elements.rxBits) this.elements.rxBits.innerHTML = rxHtml;
        if (this.elements.rxLabels) this.elements.rxLabels.innerHTML = rxLabelHtml;
    }

    /**
     * Update explanation panel
     */
    updateExplanation(event, data) {
        let html = '';
        if (event === 'started') {
            html = `<p>📤 <strong>เริ่มส่งตัว '${data.char}'</strong> (ASCII ${data.ascii})</p>
                    <p>Frame ทั้งหมด ${data.frame.length} bits: Start(1) + Data(8) + ${data.frame.length - 9 > 1 ? 'Parity(1) + ' : ''}Stop(${this.engine.stopBits})</p>`;
        } else if (event === 'bit') {
            const bit = data.bit;
            if (bit.type === 'start') {
                html = `<p>🟢 <strong>Start Bit (= 0, LOW)</strong></p><p>ดึงสายลง LOW เพื่อบอกฝ่ายรับว่า "ข้อมูลกำลังมา!"</p>`;
            } else if (bit.type === 'data') {
                html = `<p>🟠 <strong>${bit.label} = ${bit.value}</strong></p><p>ส่ง Data Bit ลำดับที่ ${data.index} (LSB first) — ข้อมูลที่รับได้: ${data.rxDataSoFar.toString(2).padStart(8, '0')}</p>`;
            } else if (bit.type === 'parity') {
                html = `<p>🟡 <strong>Parity Bit = ${bit.value}</strong></p><p>บิตตรวจสอบความถูกต้อง (${this.engine.parity} parity)</p>`;
            } else if (bit.type === 'stop') {
                html = `<p>🔴 <strong>Stop Bit (= 1, HIGH)</strong></p><p>ดึงสายกลับ HIGH บอกว่า "ส่ง 1 frame เสร็จแล้ว"</p>`;
            }
        } else if (event === 'complete') {
            html = `<p>✅ <strong>ส่งเสร็จสมบูรณ์!</strong></p>
                    <p>ส่ง: '${data.char}' (${data.txData}) → รับ: '${String.fromCharCode(data.rxData)}' (${data.rxData})</p>
                    <p>ข้อมูลตรงกัน ✓ การสื่อสารสำเร็จ!</p>`;
        }
        if (this.elements.explanation) this.elements.explanation.innerHTML = html;
    }

    /**
     * Add log entry
     */
    addLog(message) {
        if (!this.elements.logContent) return;
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.textContent = message;
        this.elements.logContent.appendChild(entry);
        this.elements.logContent.scrollTop = this.elements.logContent.scrollHeight;
    }
}
