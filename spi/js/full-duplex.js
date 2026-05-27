// ===== Full-Duplex SPI Simulator =====

class FullDuplexSPI {
    constructor() {
        this.masterTxData = 0xA5; // Master sends
        this.slaveTxData = 0x3C;  // Slave responds
        this.currentBit = -1;
        this.isRunning = false;
        this.animationTimer = null;
        this.speed = 800; // ms per clock cycle

        // Waveform state
        this.waveformCanvas = null;
        this.waveformCtx = null;

        this.init();
    }

    init() {
        this.setupInputs();
        this.setupButtons();
        this.setupWaveform();
        this.updateRegisters();
        this.renderBitCells();
        this.drawWaveformIdle();
        this.addLog('🔌 Full-Duplex SPI Simulator พร้อมใช้งาน', 'info');
        this.addLog('💡 SPI ส่งและรับข้อมูลพร้อมกันทุก clock cycle', 'info');
    }

    setupWaveform() {
        this.waveformCanvas = document.getElementById('waveform-canvas');
        this.waveformCtx = this.waveformCanvas.getContext('2d');
    }

    setupInputs() {
        const masterInput = document.getElementById('master-data-input');
        const slaveInput = document.getElementById('slave-data-input');

        masterInput.addEventListener('input', () => {
            let val = parseInt(masterInput.value) || 0;
            val = Math.max(0, Math.min(255, val));
            this.masterTxData = val;
            document.getElementById('master-binary').textContent = val.toString(2).padStart(8, '0');
            this.updateRegisters();
            this.renderBitCells();
        });

        slaveInput.addEventListener('input', () => {
            let val = parseInt(slaveInput.value) || 0;
            val = Math.max(0, Math.min(255, val));
            this.slaveTxData = val;
            document.getElementById('slave-binary').textContent = val.toString(2).padStart(8, '0');
            this.updateRegisters();
            this.renderBitCells();
        });
    }

    setupButtons() {
        document.getElementById('btn-start').addEventListener('click', () => this.startTransfer());
        document.getElementById('btn-step').addEventListener('click', () => this.stepOnce());
        document.getElementById('btn-reset').addEventListener('click', () => this.reset());
    }

    updateRegisters() {
        document.getElementById('master-tx-reg').textContent = this.masterTxData.toString(2).padStart(8, '0');
        document.getElementById('slave-tx-reg').textContent = this.slaveTxData.toString(2).padStart(8, '0');
    }

    renderBitCells() {
        const masterBinary = this.masterTxData.toString(2).padStart(8, '0');
        const slaveBinary = this.slaveTxData.toString(2).padStart(8, '0');

        const mosiBits = document.getElementById('mosi-bits');
        const misoBits = document.getElementById('miso-bits');
        const clockBits = document.getElementById('clock-bits');

        mosiBits.innerHTML = '';
        misoBits.innerHTML = '';
        clockBits.innerHTML = '';

        for (let i = 0; i < 8; i++) {
            // MOSI
            const mosiCell = document.createElement('div');
            mosiCell.className = 'bit-cell';
            mosiCell.id = `mosi-bit-${i}`;
            mosiCell.textContent = masterBinary[i];
            mosiBits.appendChild(mosiCell);

            // MISO
            const misoCell = document.createElement('div');
            misoCell.className = 'bit-cell';
            misoCell.id = `miso-bit-${i}`;
            misoCell.textContent = slaveBinary[i];
            misoBits.appendChild(misoCell);

            // Clock
            const clockCell = document.createElement('div');
            clockCell.className = 'bit-cell';
            clockCell.id = `clock-bit-${i}`;
            clockCell.textContent = '⬆';
            clockBits.appendChild(clockCell);
        }
    }

    startTransfer() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.currentBit = -1;

        document.getElementById('btn-start').disabled = true;
        document.querySelector('.master-box').classList.add('active');
        document.querySelector('.slave-box').classList.add('active');

        this.addLog('▶️ เริ่มการสื่อสาร Full-Duplex (MSB First)', 'info');
        this.addLog('📤 Master จะส่ง: 0x' + this.masterTxData.toString(16).toUpperCase(), 'mosi');
        this.addLog('📥 Slave จะตอบ: 0x' + this.slaveTxData.toString(16).toUpperCase(), 'miso');

        this.autoStep();
    }

    autoStep() {
        this.stepOnce();
        if (this.currentBit < 7) {
            this.animationTimer = setTimeout(() => this.autoStep(), this.speed);
        }
    }

    stepOnce() {
        if (this.currentBit >= 7) {
            this.finishTransfer();
            return;
        }

        this.currentBit++;
        const bit = this.currentBit;

        const masterBinary = this.masterTxData.toString(2).padStart(8, '0');
        const slaveBinary = this.slaveTxData.toString(2).padStart(8, '0');

        const mosiBit = masterBinary[bit];
        const misoBit = slaveBinary[bit];

        // Update bit cells
        // Remove previous current highlight
        document.querySelectorAll('.bit-cell.current').forEach(c => c.classList.remove('current'));

        // Mark current cells
        const mosiCell = document.getElementById(`mosi-bit-${bit}`);
        const misoCell = document.getElementById(`miso-bit-${bit}`);
        const clockCell = document.getElementById(`clock-bit-${bit}`);

        mosiCell.classList.add('sent', 'current');
        misoCell.classList.add('received', 'current');
        clockCell.classList.add('clock-high', 'current');

        // Animate arrow dots
        this.animateArrowDot('mosi', mosiBit, bit);
        this.animateArrowDot('miso', misoBit, bit);

        // Update arrows
        document.querySelector('.mosi-arrow').classList.add('active');
        document.querySelector('.miso-arrow').classList.add('active');

        // Log
        this.addLog(`⏱️ Clock ${bit + 1}/8: MOSI=${mosiBit} → Slave | MISO=${misoBit} ← Slave`, 'clock');

        // Update received registers
        this.updateReceivedData(bit);

        // Update waveform
        this.drawWaveform(bit);
    }

    animateArrowDot(type, value, bit) {
        const dot = document.getElementById(`${type}-dot`);
        if (dot) {
            dot.textContent = value;
            dot.classList.add('visible');
            const progress = ((bit + 1) / 8) * 100;
            if (type === 'mosi') {
                dot.style.left = `${progress}%`;
            } else {
                dot.style.right = `${progress}%`;
                dot.style.left = `${100 - progress}%`;
            }
        }
    }

    updateReceivedData(upToBit) {
        const masterBinary = this.masterTxData.toString(2).padStart(8, '0');
        const slaveBinary = this.slaveTxData.toString(2).padStart(8, '0');

        // Slave has received bits 0..upToBit from Master
        let slaveReceived = masterBinary.substring(0, upToBit + 1) + '•'.repeat(7 - upToBit);
        // Master has received bits 0..upToBit from Slave
        let masterReceived = slaveBinary.substring(0, upToBit + 1) + '•'.repeat(7 - upToBit);

        document.getElementById('slave-rx-reg').textContent = slaveReceived;
        document.getElementById('master-rx-reg').textContent = masterReceived;
    }

    finishTransfer() {
        this.isRunning = false;
        if (this.animationTimer) {
            clearTimeout(this.animationTimer);
            this.animationTimer = null;
        }

        document.getElementById('btn-start').disabled = false;

        // Remove current highlights
        document.querySelectorAll('.bit-cell.current').forEach(c => c.classList.remove('current'));

        // Show summary
        const summary = document.querySelector('.duplex-summary');
        summary.classList.add('visible');
        document.getElementById('summary-master-sent').textContent = `0x${this.masterTxData.toString(16).toUpperCase()} (${this.masterTxData.toString(2).padStart(8, '0')})`;
        document.getElementById('summary-slave-received').textContent = `0x${this.masterTxData.toString(16).toUpperCase()} (${this.masterTxData.toString(2).padStart(8, '0')})`;
        document.getElementById('summary-slave-sent').textContent = `0x${this.slaveTxData.toString(16).toUpperCase()} (${this.slaveTxData.toString(2).padStart(8, '0')})`;
        document.getElementById('summary-master-received').textContent = `0x${this.slaveTxData.toString(16).toUpperCase()} (${this.slaveTxData.toString(2).padStart(8, '0')})`;

        // Final waveform (complete)
        this.drawWaveform(7);

        this.addLog('✅ สื่อสารเสร็จสิ้น! ทั้ง Master และ Slave ได้รับข้อมูลครบ 8 บิตพร้อมกัน', 'info');
        this.addLog(`📊 Master ได้รับจาก Slave: 0x${this.slaveTxData.toString(16).toUpperCase()}`, 'miso');
        this.addLog(`📊 Slave ได้รับจาก Master: 0x${this.masterTxData.toString(16).toUpperCase()}`, 'mosi');
    }

    reset() {
        if (this.animationTimer) {
            clearTimeout(this.animationTimer);
            this.animationTimer = null;
        }

        this.isRunning = false;
        this.currentBit = -1;

        document.getElementById('btn-start').disabled = false;
        document.querySelector('.master-box').classList.remove('active');
        document.querySelector('.slave-box').classList.remove('active');
        document.querySelector('.mosi-arrow').classList.remove('active');
        document.querySelector('.miso-arrow').classList.remove('active');
        document.querySelector('.duplex-summary').classList.remove('visible');

        // Reset dots
        ['mosi-dot', 'miso-dot'].forEach(id => {
            const dot = document.getElementById(id);
            if (dot) {
                dot.classList.remove('visible');
                dot.style.left = '0%';
            }
        });

        // Reset received registers
        document.getElementById('slave-rx-reg').textContent = '••••••••';
        document.getElementById('master-rx-reg').textContent = '••••••••';

        this.renderBitCells();

        // Reset waveform
        this.drawWaveformIdle();

        // Clear log
        document.getElementById('log-content').innerHTML = '';
        this.addLog('🔄 รีเซ็ตแล้ว - พร้อมจำลองใหม่', 'info');
    }

    // ===== Waveform Drawing =====
    drawWaveformIdle() {
        const ctx = this.waveformCtx;
        const w = this.waveformCanvas.width;
        const h = this.waveformCanvas.height;

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, w, h);

        // Draw labels and idle state
        const signals = [
            { name: 'SS', color: '#ef4444', y: 40, idle: 0 },    // HIGH when idle
            { name: 'SCLK', color: '#8b5cf6', y: 110, idle: 0 }, // LOW idle (Mode 0)
            { name: 'MOSI', color: '#f97316', y: 180, idle: 0 },
            { name: 'MISO', color: '#22c55e', y: 250, idle: 0 }
        ];

        const labelWidth = 55;
        const signalHeight = 40;

        signals.forEach(sig => {
            // Label
            ctx.fillStyle = sig.color;
            ctx.font = 'bold 12px Consolas, monospace';
            ctx.fillText(sig.name, 5, sig.y + 4);

            // Idle line (LOW)
            ctx.strokeStyle = sig.color;
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(labelWidth, sig.y);
            ctx.lineTo(w - 10, sig.y);
            ctx.stroke();
            ctx.setLineDash([]);
        });

        // Center text
        ctx.fillStyle = '#475569';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('กด "เริ่มส่ง" เพื่อดูกราฟสัญญาณ', w / 2, h / 2);
        ctx.textAlign = 'left';
    }

    drawWaveform(upToBit) {
        const ctx = this.waveformCtx;
        const w = this.waveformCanvas.width;
        const h = this.waveformCanvas.height;

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, w, h);

        const masterBinary = this.masterTxData.toString(2).padStart(8, '0');
        const slaveBinary = this.slaveTxData.toString(2).padStart(8, '0');

        const labelWidth = 55;
        const signalAreaWidth = w - labelWidth - 20;
        const bitWidth = signalAreaWidth / 10; // 8 bits + start/end padding
        const high = -30;
        const low = 0;

        const signals = [
            { name: 'SS', color: '#ef4444', baseY: 50 },
            { name: 'SCLK', color: '#8b5cf6', baseY: 120 },
            { name: 'MOSI', color: '#f97316', baseY: 190 },
            { name: 'MISO', color: '#22c55e', baseY: 260 }
        ];

        // Draw labels
        signals.forEach(sig => {
            ctx.fillStyle = sig.color;
            ctx.font = 'bold 12px Consolas, monospace';
            ctx.fillText(sig.name, 5, sig.baseY - 12);
        });

        // Draw bit number markers
        ctx.fillStyle = '#475569';
        ctx.font = '10px Consolas, monospace';
        for (let i = 0; i < 8; i++) {
            const x = labelWidth + bitWidth * (i + 1);
            ctx.fillText(`B${i}`, x + bitWidth * 0.3, 15);
        }

        // Helper: draw signal
        const drawSignal = (baseY, color, getBitValue, activeUpTo) => {
            ctx.strokeStyle = color;
            ctx.lineWidth = 2.5;
            ctx.beginPath();

            const startX = labelWidth;

            // Initial idle (half bit before)
            ctx.moveTo(startX, baseY + low);
            ctx.lineTo(startX + bitWidth * 0.5, baseY + low);

            for (let i = 0; i < 8; i++) {
                const x = startX + bitWidth * (i + 0.5);
                const val = (i <= activeUpTo) ? getBitValue(i) : null;

                if (val !== null) {
                    const level = val ? high : low;
                    const prevLevel = (i === 0) ? low : (getBitValue(i - 1) ? high : low);

                    // Transition
                    if (i === 0 || level !== prevLevel) {
                        ctx.lineTo(x, baseY + level);
                    }
                    ctx.lineTo(x + bitWidth, baseY + level);
                } else {
                    // Not yet reached - dashed idle
                    ctx.lineTo(x, baseY + low);
                    ctx.stroke();
                    ctx.setLineDash([3, 3]);
                    ctx.beginPath();
                    ctx.moveTo(x, baseY + low);
                    ctx.lineTo(startX + bitWidth * 9, baseY + low);
                    ctx.stroke();
                    ctx.setLineDash([]);
                    return;
                }
            }

            // End idle
            const endX = startX + bitWidth * 8.5;
            ctx.lineTo(endX, baseY + low);
            ctx.lineTo(startX + bitWidth * 9.5, baseY + low);
            ctx.stroke();
        };

        // SS: LOW during entire transmission, HIGH before/after
        drawSignal(signals[0].baseY, signals[0].color, (i) => {
            return (i <= upToBit) ? 0 : 1; // 0 = LOW (active), shown as HIGH visually
        }, upToBit);

        // Actually SS should be inverted: HIGH level = idle, LOW = active
        // Redraw SS properly
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        const ssBaseY = signals[0].baseY;
        const ssStartX = labelWidth;
        // Start HIGH
        ctx.moveTo(ssStartX, ssBaseY + high);
        ctx.lineTo(ssStartX + bitWidth * 0.5, ssBaseY + high);
        // Drop to LOW
        ctx.lineTo(ssStartX + bitWidth * 0.5, ssBaseY + low);
        // Stay LOW during transmission
        const ssEndBit = Math.min(upToBit + 1, 8);
        ctx.lineTo(ssStartX + bitWidth * (ssEndBit + 0.5), ssBaseY + low);
        if (upToBit >= 7) {
            // Return HIGH after complete
            ctx.lineTo(ssStartX + bitWidth * 8.5, ssBaseY + low);
            ctx.lineTo(ssStartX + bitWidth * 8.5, ssBaseY + high);
            ctx.lineTo(ssStartX + bitWidth * 9.5, ssBaseY + high);
        }
        ctx.stroke();

        // SCLK: square wave (Mode 0: idle LOW, toggle each half-bit)
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        const sclkBaseY = signals[1].baseY;
        ctx.moveTo(labelWidth, sclkBaseY + low);
        ctx.lineTo(labelWidth + bitWidth * 0.5, sclkBaseY + low);
        for (let i = 0; i <= upToBit && i < 8; i++) {
            const x = labelWidth + bitWidth * (i + 0.5);
            // Rising edge
            ctx.lineTo(x, sclkBaseY + high);
            ctx.lineTo(x + bitWidth * 0.5, sclkBaseY + high);
            // Falling edge
            ctx.lineTo(x + bitWidth * 0.5, sclkBaseY + low);
            ctx.lineTo(x + bitWidth, sclkBaseY + low);
        }
        if (upToBit < 7) {
            // Dashed remaining
            const remainX = labelWidth + bitWidth * (upToBit + 1.5);
            ctx.stroke();
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(remainX, sclkBaseY + low);
            ctx.lineTo(labelWidth + bitWidth * 9.5, sclkBaseY + low);
            ctx.stroke();
            ctx.setLineDash([]);
        } else {
            ctx.lineTo(labelWidth + bitWidth * 9.5, sclkBaseY + low);
            ctx.stroke();
        }

        // MOSI: data bits from master
        drawSignal(signals[2].baseY, signals[2].color, (i) => {
            return parseInt(masterBinary[i]);
        }, upToBit);

        // MISO: data bits from slave
        drawSignal(signals[3].baseY, signals[3].color, (i) => {
            return parseInt(slaveBinary[i]);
        }, upToBit);

        // Draw current bit marker
        if (upToBit >= 0 && upToBit < 8) {
            const markerX = labelWidth + bitWidth * (upToBit + 1);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2]);
            ctx.beginPath();
            ctx.moveTo(markerX, 20);
            ctx.lineTo(markerX, h - 5);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    addLog(message, type) {
        const logContent = document.getElementById('log-content');
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = message;
        logContent.appendChild(entry);
        logContent.scrollTop = logContent.scrollHeight;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    new FullDuplexSPI();
});
