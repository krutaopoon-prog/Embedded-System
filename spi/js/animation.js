/**
 * Animation Controller - ควบคุมการแสดงผล animation ของ SPI
 */

class AnimationController {
    constructor(spiEngine) {
        this.spi = spiEngine;
        this.canvas = document.getElementById('scope-canvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        
        // Animation state
        this.isPlaying = false;
        this.speed = 5;
        this.animationInterval = null;
        this.currentStep = 0;
        
        // UI Elements
        this.elements = {
            masterMOSI: document.getElementById('master-mosi'),
            masterMISO: document.getElementById('master-miso'),
            masterSCLK: document.getElementById('master-sclk'),
            masterSS: document.getElementById('master-ss'),
            slaveMOSI: document.getElementById('slave-mosi'),
            slaveMISO: document.getElementById('slave-miso'),
            slaveSCLK: document.getElementById('slave-sclk'),
            slaveSS: document.getElementById('slave-ss'),
            mosiLine: document.getElementById('mosi-line'),
            misoLine: document.getElementById('miso-line'),
            sclkLine: document.getElementById('sclk-line'),
            ssLine: document.getElementById('ss-line'),
            masterTx: document.getElementById('master-tx'),
            masterRx: document.getElementById('master-rx'),
            mosiBit: document.getElementById('mosi-bit'),
            misoBit: document.getElementById('miso-bit'),
            explanation: document.getElementById('explanation'),
            progress: document.getElementById('progress')
        };
        
        // ข้อความอธิบายสำหรับแต่ละขั้นตอน
        this.explanations = {
            reset: {
                title: '👋 เริ่มต้นการส่งข้อมูล',
                text: `ระบบพร้อมทำงาน<br>
                       • SS (Slave Select) = HIGH (ยังไม่เลือก Slave)<br>
                       • SCLK = ${this.spi.cpol === 0 ? 'LOW' : 'HIGH'} (ตาม CPOL)<br>
                       • กด "เริ่ม" เพื่อเริ่มการส่งข้อมูล`
            },
            ss_active: {
                title: '🔽 เลือกอุปกรณ์ Slave',
                text: `Master ส่งสัญญาณ SS = LOW เพื่อเลือก Slave ที่ต้องการสื่อสาร<br>
                       • SS เป็น Active LOW (0 = เลือก, 1 = ไม่เลือก)<br>
                       • Slave ที่ถูกเลือกจะพร้อมรับข้อมูล`
            },
            sampling: {
                title: '📊 อ่านข้อมูล (Sampling)',
                text: (bitIndex, mode) => {
                    const edge = mode === 0 ? 'rising edge' : 'falling edge';
                    return `ส่งบิตที่ ${7-bitIndex} (นับจาก MSB)<br>
                            • MOSI = ${this.spi.getCurrentMOSI()}<br>
                            • MISO = ${this.spi.getCurrentMISO()}<br>
                            • อ่านข้อมูลที่ ${edge}`;
                }
            },
            next_bit: {
                title: '➡️ ส่งบิตถัดไป',
                text: (nextBit) => `เตรียมส่งบิตที่ ${7-nextBit}<br>
                                   • นับจำนวนบิตที่ส่งแล้ว: ${nextBit}/8`
            },
            complete: {
                title: '✅ การส่งข้อมูลเสร็จสมบูรณ์',
                text: () => `ส่งข้อมูลครบ 8 บิตแล้ว!<br>
                            • Master ปล่อย SS = HIGH<br>
                            • การสื่อสารจบลง<br>
                            • ข้อมูลที่ส่ง: 0x${this.spi.dataTx.toString(16).toUpperCase().padStart(2, '0')}`
            }
        };
    }

    /**
     * เริ่ม animation
     */
    play() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        const interval = 1100 - (this.speed * 100);  // 1000ms ถึง 100ms
        
        this.animationInterval = setInterval(() => {
            if (!this.spi.isPaused) {
                const complete = this.spi.step();
                this.updateDisplay();
                
                if (complete) {
                    this.pause();
                }
            }
        }, interval);
    }

    /**
     * หยุด animation
     */
    pause() {
        this.isPlaying = false;
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
        this.spi.pause();
    }

    /**
     * ดำเนินการทีละขั้น
     */
    step() {
        this.pause();
        const complete = this.spi.step();
        this.updateDisplay();
        return complete;
    }

    /**
     * รีเซ็ต animation
     */
    reset() {
        this.pause();
        this.spi.reset();
        this.updateDisplay();
        this.updateExplanation('reset');
        this.updateProgress(0);
    }

    /**
     * ตั้งค่าความเร็ว
     */
    setSpeed(value) {
        this.speed = value;
        if (this.isPlaying) {
            this.pause();
            this.play();
        }
    }

    /**
     * อัพเดทการแสดงผลทั้งหมด
     */
    updateDisplay() {
        this.updatePins();
        this.updateDataDisplay();
        this.drawOscilloscope();
    }

    /**
     * อัพเดทสถานะ pins
     */
    updatePins() {
        const { mosi, miso, sclk, ss } = this.spi;
        
        // Master pins
        if (this.elements.masterMOSI) {
            this.elements.masterMOSI.classList.toggle('sending', mosi === 1);
            this.elements.masterMOSI.textContent = `MOSI (${mosi})`;
        }
        if (this.elements.masterMISO) {
            this.elements.masterMISO.classList.toggle('active', miso === 1);
            this.elements.masterMISO.textContent = `MISO (${miso})`;
        }
        if (this.elements.masterSCLK) {
            this.elements.masterSCLK.classList.toggle('active', sclk === 1);
            this.elements.masterSCLK.textContent = `SCLK (${sclk})`;
        }
        if (this.elements.masterSS) {
            this.elements.masterSS.classList.toggle('active', ss === 0);
            this.elements.masterSS.textContent = `SS (${ss})`;
        }
        
        // Slave pins
        if (this.elements.slaveMOSI) {
            this.elements.slaveMOSI.classList.toggle('active', mosi === 1);
            this.elements.slaveMOSI.textContent = `MOSI (${mosi})`;
        }
        if (this.elements.slaveMISO) {
            this.elements.slaveMISO.classList.toggle('sending', miso === 1);
            this.elements.slaveMISO.textContent = `MISO (${miso})`;
        }
        if (this.elements.slaveSCLK) {
            this.elements.slaveSCLK.classList.toggle('active', sclk === 1);
            this.elements.slaveSCLK.textContent = `SCLK (${sclk})`;
        }
        if (this.elements.slaveSS) {
            this.elements.slaveSS.classList.toggle('active', ss === 0);
            this.elements.slaveSS.textContent = `SS (${ss})`;
        }
        
        // Signal lines
        if (this.elements.mosiLine) {
            this.elements.mosiLine.classList.toggle('active', mosi === 1);
        }
        if (this.elements.misoLine) {
            this.elements.misoLine.classList.toggle('active', miso === 1);
        }
        if (this.elements.sclkLine) {
            this.elements.sclkLine.classList.toggle('active', sclk === 1);
        }
        if (this.elements.ssLine) {
            this.elements.ssLine.classList.toggle('active', ss === 0);
        }
    }

    /**
     * อัพเดทการแสดงผลข้อมูล
     */
    updateDataDisplay() {
        const txBinary = this.spi.getTransmitBinary();
        const rxBinary = this.spi.dataRxSlave.toString(2).padStart(8, '0');
        
        // แสดงข้อมูลเป็น binary พร้อม highlight บิตปัจจุบัน
        if (this.elements.masterTx) {
            const bits = txBinary.split('').map((bit, index) => {
                const isActive = index === this.spi.currentBit && this.spi.isRunning;
                return `<span class="bit ${isActive ? 'active' : ''}">${bit}</span>`;
            }).join(' ');
            this.elements.masterTx.innerHTML = bits;
        }
        
        if (this.elements.masterRx) {
            const bits = rxBinary.split('').map((bit, index) => {
                const isActive = index === this.spi.currentBit && this.spi.isRunning;
                return `<span class="bit ${isActive ? 'active' : ''}">${bit}</span>`;
            }).join(' ');
            this.elements.masterRx.innerHTML = bits;
        }
        
        // แสดงบิตปัจจุบัน
        if (this.elements.mosiBit) {
            this.elements.mosiBit.textContent = `Current: ${this.spi.getCurrentMOSI()}`;
        }
        if (this.elements.misoBit) {
            this.elements.misoBit.textContent = `Current: ${this.spi.getCurrentMISO()}`;
        }
    }

    /**
     * วาด oscilloscope
     */
    drawOscilloscope() {
        if (!this.ctx || !this.canvas) return;
        
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Clear canvas
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, width, height);
        
        // วาด grid
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        for (let i = 0; i < width; i += 50) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, height);
            ctx.stroke();
        }
        for (let i = 0; i < height; i += 30) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(width, i);
            ctx.stroke();
        }
        
        // วาดสัญญาณแต่ละเส้น
        const signals = [
            { name: 'MOSI', data: this.spi.signalHistory.mosi, color: '#3b82f6', yOffset: 30 },
            { name: 'MISO', data: this.spi.signalHistory.miso, color: '#22c55e', yOffset: 70 },
            { name: 'SCLK', data: this.spi.signalHistory.sclk, color: '#8b5cf6', yOffset: 110 },
            { name: 'SS', data: this.spi.signalHistory.ss, color: '#ef4444', yOffset: 150 }
        ];
        
        const history = this.spi.signalHistory.sclk;
        const stepWidth = width / this.spi.maxHistory;
        
        signals.forEach(signal => {
            ctx.strokeStyle = signal.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            signal.data.forEach((value, index) => {
                const x = index * stepWidth;
                const y = signal.yOffset + (value === 1 ? -15 : 15);
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    // วาดแบบ digital (ขึ้น/ลงตรง)
                    const prevY = signal.yOffset + (signal.data[index - 1] === 1 ? -15 : 15);
                    ctx.lineTo(x, prevY);
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
            
            // วาด label
            ctx.fillStyle = signal.color;
            ctx.font = '12px monospace';
            ctx.fillText(signal.name, 5, signal.yOffset);
        });
    }

    /**
     * อัพเดทคำอธิบาย
     */
    updateExplanation(event, data) {
        if (!this.elements.explanation) return;
        
        const exp = this.explanations[event];
        if (!exp) return;
        
        let content = `<p><strong>${exp.title}</strong></p>`;
        
        if (typeof exp.text === 'function') {
            content += `<p>${exp.text(data, this.spi.mode)}</p>`;
        } else {
            content += `<p>${exp.text}</p>`;
        }
        
        this.elements.explanation.innerHTML = content;
    }

    /**
     * อัพเดท progress indicator
     */
    updateProgress(step) {
        if (!this.elements.progress) return;
        
        const steps = this.elements.progress.querySelectorAll('.step');
        steps.forEach((s, index) => {
            s.classList.remove('active', 'completed');
            if (index < step) {
                s.classList.add('completed');
            } else if (index === step) {
                s.classList.add('active');
            }
        });
    }

    /**
     * จัดการ event จาก SPI Engine
     */
    handleSPIEvent(state) {
        this.updateDisplay();
        this.updateExplanation(state.event, state.data);
        
        // อัพเดท progress ตาม event
        const progressMap = {
            'reset': 0,
            'ss_active': 1,
            'sampling': 2,
            'next_bit': 2,
            'complete': 3
        };
        
        this.updateProgress(progressMap[state.event] || 0);
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationController;
}
