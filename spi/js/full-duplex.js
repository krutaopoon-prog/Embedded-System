// ===== Full-Duplex SPI Simulator =====

class FullDuplexSPI {
    constructor() {
        this.masterTxData = 0xA5; // Master sends
        this.slaveTxData = 0x3C;  // Slave responds
        this.currentBit = -1;
        this.isRunning = false;
        this.animationTimer = null;
        this.speed = 800; // ms per clock cycle

        this.init();
    }

    init() {
        this.setupInputs();
        this.setupButtons();
        this.updateRegisters();
        this.renderBitCells();
        this.addLog('🔌 Full-Duplex SPI Simulator พร้อมใช้งาน', 'info');
        this.addLog('💡 SPI ส่งและรับข้อมูลพร้อมกันทุก clock cycle', 'info');
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

        // Clear log
        document.getElementById('log-content').innerHTML = '';
        this.addLog('🔄 รีเซ็ตแล้ว - พร้อมจำลองใหม่', 'info');
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
