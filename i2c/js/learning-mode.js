/**
 * Learning Mode - I2C Simulator Controller
 */

class LearningMode {
    constructor() {
        this.engine = new I2CEngine();
        this.animation = new I2CAnimation('i2c-waveform');
        this.isAutoRunning = false;

        this.elements = {
            slaveAddr: document.getElementById('slave-addr'),
            rwBit: document.getElementById('rw-bit'),
            inputData: document.getElementById('input-data'),
            btnSend: document.getElementById('btn-send'),
            btnStep: document.getElementById('btn-step'),
            btnReset: document.getElementById('btn-reset'),
            sdaState: document.getElementById('sda-state'),
            sclState: document.getElementById('scl-state'),
            frameBits: document.getElementById('frame-bits'),
            frameLabels: document.getElementById('frame-labels'),
            explanation: document.getElementById('explanation'),
            logContent: document.getElementById('log-content')
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupEngineCallbacks();
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
            this.addLog(`[I2C] Start → Slave 0x${data.slaveAddress.toString(16).toUpperCase()} | ${data.rwBit === 0 ? 'Write' : 'Read'} | Data: 0x${data.data.toString(16).toUpperCase()}`);
            this.renderFrame(data.frame, -1);
            this.updateExplanation('started', data);
        };

        this.engine.onStepExecuted = (data) => {
            this.addLog(`  [Step ${data.index}] ${data.step.label}: ${data.step.desc}`);
            this.renderFrame(this.engine.frame, data.index);
            this.updateBusState(data.step);
            this.highlightDevice(data.step);
            if (this.animation) {
                this.animation.drawFrame(this.engine.frame, data.index);
            }
            this.updateExplanation('step', data);
        };

        this.engine.onFrameComplete = (data) => {
            this.addLog(`[Done] สื่อสารเสร็จสมบูรณ์ ✓`);
            this.updateExplanation('complete', data);
        };
    }

    async sendAuto() {
        if (this.isAutoRunning) return;
        this.applyConfig();
        this.isAutoRunning = true;
        this.elements.btnSend.disabled = true;
        this.elements.btnStep.disabled = true;

        await this.engine.sendAll(350);

        this.isAutoRunning = false;
        this.elements.btnSend.disabled = false;
        this.elements.btnStep.disabled = false;
    }

    stepOnce() {
        if (this.isAutoRunning) return;

        if (!this.engine.isTransmitting && !this.engine.isComplete) {
            this.applyConfig();
            this.engine.start();
        }

        if (!this.engine.isComplete) {
            this.engine.step();
        }
    }

    applyConfig() {
        const addrStr = this.elements.slaveAddr.value;
        this.engine.configure({
            slaveAddress: parseInt(addrStr, 16),
            rwBit: parseInt(this.elements.rwBit.value),
            data: parseInt(this.elements.inputData.value, 16) || 0x55
        });
    }

    reset() {
        this.engine.reset();
        this.isAutoRunning = false;
        this.elements.btnSend.disabled = false;
        this.elements.btnStep.disabled = false;
        this.elements.sdaState.textContent = 'HIGH';
        this.elements.sclState.textContent = 'HIGH';
        this.elements.frameBits.innerHTML = '';
        this.elements.frameLabels.innerHTML = '';
        if (this.animation) this.animation.drawIdle();
        this.elements.explanation.innerHTML = '<p>เลือก Slave Address + ข้อมูลที่ต้องการส่ง แล้วกด <strong>"ส่งข้อมูล"</strong> เพื่อดูทั้งกระบวนการ หรือกด <strong>"ทีละขั้น"</strong> เพื่อดูทีละขั้นตอน</p><p>สังเกต: Start → Address(7) + R/W(1) → ACK → Data(8) → ACK → Stop</p>';
        this.resetDeviceHighlight();
        this.addLog('[Reset] รีเซ็ตเรียบร้อย');
    }

    renderFrame(frame, activeIndex) {
        let bitsHtml = '';
        let labelsHtml = '';
        frame.forEach((step, i) => {
            let cls = 'frame-bit';
            if (step.type === 'addr') cls += ' addr';
            else if (step.type === 'rw') cls += ' rw';
            else if (step.type === 'ack') cls += ' ack';
            else if (step.type === 'data') cls += ' data';
            if (i === activeIndex) cls += ' active';

            const display = step.value !== undefined ? step.value : (step.type === 'start' ? 'S' : 'P');
            bitsHtml += `<div class="${cls}">${display}</div>`;
            labelsHtml += `<span>${step.label}</span>`;
        });
        this.elements.frameBits.innerHTML = bitsHtml;
        this.elements.frameLabels.innerHTML = labelsHtml;
    }

    updateBusState(step) {
        if (step.type === 'start') {
            this.elements.sdaState.textContent = 'LOW';
            this.elements.sclState.textContent = 'HIGH';
        } else if (step.type === 'stop') {
            this.elements.sdaState.textContent = 'HIGH';
            this.elements.sclState.textContent = 'HIGH';
        } else {
            this.elements.sdaState.textContent = step.value === 1 ? 'HIGH' : 'LOW';
            this.elements.sclState.textContent = '↑↓';
        }
    }

    highlightDevice(step) {
        this.resetDeviceHighlight();
        document.getElementById('master-box').classList.add('active');
        if (step.type === 'ack') {
            // Highlight the selected slave
            const addr = this.engine.slaveAddress;
            if (addr === 0x3C) document.getElementById('slave1-box').classList.add('active');
            else if (addr === 0x76) document.getElementById('slave2-box').classList.add('active');
            else if (addr === 0x68) document.getElementById('slave3-box').classList.add('active');
        }
    }

    resetDeviceHighlight() {
        document.querySelectorAll('.device-box').forEach(box => box.classList.remove('active'));
        document.getElementById('master-box').classList.add('active');
    }

    updateExplanation(event, data) {
        let html = '';
        if (event === 'started') {
            html = `<p>📤 <strong>เริ่มสื่อสาร I2C</strong></p>
                    <p>Slave: 0x${data.slaveAddress.toString(16).toUpperCase()} | Mode: ${data.rwBit === 0 ? 'Write' : 'Read'} | Data: 0x${data.data.toString(16).toUpperCase()}</p>
                    <p>Frame: Start → Addr(7) + R/W → ACK → Data(8) → ACK → Stop = ${data.frame.length} steps</p>`;
        } else if (event === 'step') {
            const step = data.step;
            let icon = '🔵';
            if (step.type === 'start') icon = '🟢';
            else if (step.type === 'stop') icon = '🔴';
            else if (step.type === 'ack') icon = '✅';
            else if (step.type === 'addr') icon = '🟣';
            else if (step.type === 'rw') icon = '🟡';
            else if (step.type === 'data') icon = '🔵';
            html = `<p>${icon} <strong>[${step.label}]</strong> ${step.desc}</p>`;
        } else if (event === 'complete') {
            html = `<p>✅ <strong>สื่อสารเสร็จสมบูรณ์!</strong></p>
                    <p>ส่งข้อมูล 0x${data.data.toString(16).toUpperCase()} ไปยัง Slave 0x${data.slaveAddress.toString(16).toUpperCase()} สำเร็จ</p>`;
        }
        if (this.elements.explanation) this.elements.explanation.innerHTML = html;
    }

    addLog(message) {
        if (!this.elements.logContent) return;
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.textContent = message;
        this.elements.logContent.appendChild(entry);
        this.elements.logContent.scrollTop = this.elements.logContent.scrollHeight;
    }
}
