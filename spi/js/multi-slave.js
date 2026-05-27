// ===== Multi-Slave SPI Simulator =====

class MultiSlaveSPI {
    constructor() {
        this.selectedSlave = null;
        this.isTransmitting = false;
        this.dataToSend = 0xAA;
        this.currentBit = 0;
        this.animationTimer = null;
        this.logEntries = [];
        this.speed = 500; // ms per bit

        this.init();
    }

    init() {
        this.setupSlaveButtons();
        this.setupActionButtons();
        this.setupDataInput();
        this.drawSignalLines();
        this.addLog('🔌 Multi-Slave SPI Simulator พร้อมใช้งาน', '');
        this.addLog('📋 เลือก Slave แล้วกด "ส่งข้อมูล" เพื่อเริ่มจำลอง', '');
    }

    setupSlaveButtons() {
        const buttons = document.querySelectorAll('.slave-select-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.isTransmitting) return;
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectSlave(parseInt(btn.dataset.slave));
            });
        });
    }

    setupActionButtons() {
        document.getElementById('btn-send').addEventListener('click', () => this.startTransmission());
        document.getElementById('btn-reset').addEventListener('click', () => this.reset());
    }

    setupDataInput() {
        const input = document.getElementById('data-input');
        const binaryDisplay = document.getElementById('binary-display');
        input.addEventListener('input', () => {
            let val = parseInt(input.value) || 0;
            val = Math.max(0, Math.min(255, val));
            this.dataToSend = val;
            binaryDisplay.textContent = val.toString(2).padStart(8, '0');
        });
    }

    selectSlave(slaveNum) {
        this.selectedSlave = slaveNum;

        // Update slave device UI
        document.querySelectorAll('.slave-device').forEach((dev, i) => {
            dev.classList.remove('selected', 'inactive');
        });

        // Update SS status badges
        document.querySelectorAll('.ss-status').forEach((badge, i) => {
            badge.textContent = 'HIGH';
            badge.classList.remove('low');
        });

        // Highlight selected
        const selectedDev = document.querySelector(`[data-slave-id="${slaveNum}"]`);
        if (selectedDev) {
            selectedDev.classList.add('selected');
            const badge = selectedDev.querySelector('.ss-status');
            if (badge) {
                badge.textContent = 'LOW';
                badge.classList.add('low');
            }
        }

        // Dim others
        document.querySelectorAll('.slave-device').forEach((dev) => {
            const id = parseInt(dev.dataset.slaveId);
            if (id !== slaveNum) {
                dev.classList.add('inactive');
            }
        });

        this.addLog(`🔶 เลือก Slave ${slaveNum} (SS${slaveNum} = LOW)`, 'select');
        this.updateSignalLines();
        this.updateExplanation('select');
    }

    startTransmission() {
        if (this.selectedSlave === null) {
            this.addLog('⚠️ กรุณาเลือก Slave ก่อน!', '');
            return;
        }
        if (this.isTransmitting) return;

        this.isTransmitting = true;
        this.currentBit = 7; // MSB first
        const binary = this.dataToSend.toString(2).padStart(8, '0');

        this.addLog(`📤 เริ่มส่งข้อมูล 0x${this.dataToSend.toString(16).toUpperCase()} (${binary}) ไปยัง Slave ${this.selectedSlave}`, 'send');
        this.updateExplanation('transmit');

        // Activate master
        document.querySelector('.master-device').classList.add('active');

        // Animate bit by bit
        this.animateBit(binary);
    }

    animateBit(binary) {
        if (this.currentBit < 0) {
            this.finishTransmission();
            return;
        }

        const bitIndex = 7 - this.currentBit;
        const bitValue = binary[bitIndex];

        // Update MOSI pin visual
        this.highlightPin('mosi', true);
        this.highlightPin('sclk', true);

        // Update bit display
        this.updateBitDisplay(bitIndex, bitValue);

        this.addLog(`  Bit ${bitIndex}: MOSI = ${bitValue}, SCLK ⬆️ Rising Edge`, 'send');

        // Animate clock low after half period
        setTimeout(() => {
            this.highlightPin('sclk', false);
            this.currentBit--;
            this.animationTimer = setTimeout(() => this.animateBit(binary), this.speed);
        }, this.speed / 2);
    }

    finishTransmission() {
        this.isTransmitting = false;
        this.highlightPin('mosi', false);
        this.highlightPin('sclk', false);

        // Simulate response from slave
        const response = Math.floor(Math.random() * 256);
        const respBinary = response.toString(2).padStart(8, '0');

        this.addLog(`📥 Slave ${this.selectedSlave} ตอบกลับ: 0x${response.toString(16).toUpperCase()} (${respBinary})`, 'receive');
        this.addLog(`✅ การสื่อสารเสร็จสิ้น`, '');

        document.querySelector('.master-device').classList.remove('active');
        this.updateExplanation('complete');

        // Reset bit display
        document.getElementById('bit-progress').textContent = 'เสร็จสิ้น - ส่งครบ 8 บิต';
    }

    highlightPin(pinName, active) {
        const masterPin = document.querySelector(`.master-device .pin-item[data-pin="${pinName}"]`);
        const slavePins = document.querySelectorAll(`.slave-device[data-slave-id="${this.selectedSlave}"] .pin-item[data-pin="${pinName}"]`);

        if (masterPin) {
            masterPin.classList.toggle('active', active);
            const dot = masterPin.querySelector('.pin-dot');
            if (dot) dot.style.background = active ? '#f97316' : '#d1d5db';
        }
        slavePins.forEach(p => p.classList.toggle('active', active));
    }

    updateBitDisplay(bitIndex, bitValue) {
        document.getElementById('bit-progress').textContent = `ส่ง Bit ${bitIndex}/7 = ${bitValue}`;
    }

    updateSignalLines() {
        const svg = document.getElementById('multi-signal-svg');
        if (!svg) return;

        // Reset all lines
        svg.querySelectorAll('.sig-line').forEach(line => {
            line.classList.remove('active');
        });

        if (this.selectedSlave !== null) {
            // Activate shared lines (SCLK, MOSI, MISO)
            svg.querySelectorAll('.sig-sclk').forEach(l => l.classList.add('active'));
            svg.querySelectorAll('.sig-mosi').forEach(l => l.classList.add('active'));
            svg.querySelectorAll(`.sig-miso-${this.selectedSlave}`).forEach(l => l.classList.add('active'));
            svg.querySelectorAll(`.sig-ss-${this.selectedSlave}`).forEach(l => l.classList.add('active'));
        }
    }

    drawSignalLines() {
        const svg = document.getElementById('multi-signal-svg');
        if (!svg) return;
        // SVG lines are defined in HTML for clarity
    }

    updateExplanation(phase) {
        document.querySelectorAll('.explanation-step').forEach(step => {
            step.classList.remove('active');
        });

        const stepMap = {
            'select': 'step-select',
            'transmit': 'step-transmit',
            'complete': 'step-complete'
        };

        const targetId = stepMap[phase];
        if (targetId) {
            document.getElementById(targetId)?.classList.add('active');
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

    reset() {
        if (this.animationTimer) {
            clearTimeout(this.animationTimer);
            this.animationTimer = null;
        }

        this.isTransmitting = false;
        this.selectedSlave = null;
        this.currentBit = 0;

        // Reset UI
        document.querySelectorAll('.slave-select-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.slave-device').forEach(d => {
            d.classList.remove('selected', 'inactive');
        });
        document.querySelectorAll('.ss-status').forEach(badge => {
            badge.textContent = 'HIGH';
            badge.classList.remove('low');
        });
        document.querySelector('.master-device').classList.remove('active');
        document.querySelectorAll('.pin-item').forEach(p => {
            p.classList.remove('active');
            const dot = p.querySelector('.pin-dot');
            if (dot) dot.style.background = '#d1d5db';
        });

        // Reset signal lines
        const svg = document.getElementById('multi-signal-svg');
        if (svg) {
            svg.querySelectorAll('.sig-line').forEach(l => l.classList.remove('active'));
        }

        // Reset explanation
        document.querySelectorAll('.explanation-step').forEach(s => s.classList.remove('active'));

        // Reset bit progress
        document.getElementById('bit-progress').textContent = 'รอเลือก Slave และส่งข้อมูล...';

        // Clear log
        const logContent = document.getElementById('log-content');
        logContent.innerHTML = '';
        this.addLog('🔄 รีเซ็ตระบบแล้ว', '');
        this.addLog('📋 เลือก Slave แล้วกด "ส่งข้อมูล" เพื่อเริ่มจำลอง', '');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    new MultiSlaveSPI();
});
