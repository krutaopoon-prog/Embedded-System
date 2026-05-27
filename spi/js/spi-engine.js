/**
 * SPI Engine - จำลองการทำงาน SPI Protocol
 * รองรับ Mode 0 และ Mode 3
 */

class SPIEngine {
    constructor() {
        this.mode = 0;          // SPI Mode (0 หรือ 3)
        this.cpol = 0;          // Clock Polarity
        this.cpha = 0;          // Clock Phase
        this.dataTx = 0;        // ข้อมูลที่ Master ส่ง (1 byte)
        this.dataRx = 0;        // ข้อมูลที่ Master รับ (1 byte)
        this.currentBit = 0;    // บิตที่กำลังส่ง (0-7)
        this.isRunning = false;
        this.isPaused = false;
        this.isComplete = false;
        
        // สถานะสัญญาณ
        this.sclk = 0;
        this.ss = 1;          // SS Active LOW
        this.mosi = 0;
        this.miso = 0;
        
        // ประวัติสัญญาณสำหรับ oscilloscope
        this.signalHistory = {
            sclk: [],
            mosi: [],
            miso: [],
            ss: []
        };
        this.maxHistory = 100;
        
        // Callbacks
        this.onStateChange = null;
        this.onComplete = null;
        this.onBitComplete = null;
    }

    /**
     * ตั้งค่า SPI Mode
     * @param {number} mode - 0 หรือ 3
     */
    setMode(mode) {
        this.mode = mode;
        if (mode === 0) {
            this.cpol = 0;
            this.cpha = 0;
        } else if (mode === 3) {
            this.cpol = 1;
            this.cpha = 1;
        }
        this.reset();
    }

    /**
     * ตั้งค่าข้อมูลที่จะส่ง
     * @param {number} data - ข้อมูล 1 byte (0-255)
     */
    setTransmitData(data) {
        this.dataTx = data & 0xFF;
        // สำหรับการจำลอง Slave ส่งข้อมูลกลับ (สมมติเป็น 0x55)
        this.dataRxSlave = 0x55;
    }

    /**
     * รีเซ็ตสถานะทั้งหมด
     */
    reset() {
        this.currentBit = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.isComplete = false;
        
        // ตั้งค่าเริ่มต้นตาม CPOL
        this.sclk = this.cpol;
        this.ss = 1;  // ยังไม่ได้เลือก Slave
        this.mosi = 0;
        this.miso = 0;
        
        // ล้างประวัติ
        this.signalHistory = {
            sclk: [],
            mosi: [],
            miso: [],
            ss: []
        };
        
        this.recordState();
        this.notifyStateChange('reset');
    }

    /**
     * เริ่มการส่งข้อมูล
     */
    start() {
        if (this.isRunning && !this.isPaused) return;
        
        if (this.isPaused) {
            this.isPaused = false;
        } else {
            this.reset();
            this.isRunning = true;
            this.ss = 0;  // เลือก Slave (Active LOW)
            this.notifyStateChange('ss_active');
        }
    }

    /**
     * หยุดชั่วคราว
     */
    pause() {
        this.isPaused = true;
    }

    /**
     * ดำเนินการทีละขั้น (1 clock cycle)
     * @returns {boolean} true ถ้าการส่งเสร็จสมบูรณ์
     */
    step() {
        if (!this.isRunning) {
            this.start();
        }

        if (this.isComplete) {
            return true;
        }

        // สำหรับ Mode 0 และ 3 ซึ่งมี CPHA เท่ากัน
        // 1 clock cycle = 1 edge สำหรับ sampling
        
        const bitIndex = 7 - this.currentBit;  // MSB first
        
        if (this.cpol === 0 && this.cpha === 0) {
            // Mode 0: เริ่ม LOW, อ่านที่ rising edge
            if (this.sclk === 0) {
                // ขึ้นไป HIGH - sampling ที่ rising edge
                this.sclk = 1;
                this.mosi = (this.dataTx >> bitIndex) & 1;
                this.miso = (this.dataRxSlave >> bitIndex) & 1;
                this.recordState();
                this.notifyStateChange('sampling', bitIndex);
            } else {
                // ลงมา LOW - setup สำหรับบิตถัดไป
                this.sclk = 0;
                this.currentBit++;
                this.recordState();
                
                if (this.currentBit >= 8) {
                    this.completeTransfer();
                    return true;
                }
                this.notifyStateChange('next_bit', this.currentBit);
            }
        } else if (this.cpol === 1 && this.cpha === 1) {
            // Mode 3: เริ่ม HIGH, อ่านที่ rising edge
            if (this.sclk === 1) {
                // ลงไป LOW - setup
                this.sclk = 0;
                this.recordState();
            } else {
                // ขึ้นไป HIGH - sampling ที่ rising edge
                this.sclk = 1;
                this.mosi = (this.dataTx >> bitIndex) & 1;
                this.miso = (this.dataRxSlave >> bitIndex) & 1;
                this.currentBit++;
                this.recordState();
                this.notifyStateChange('sampling', bitIndex);
                
                if (this.currentBit >= 8) {
                    this.completeTransfer();
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * จบการส่งข้อมูล
     */
    completeTransfer() {
        this.ss = 1;  // ปล่อย Slave
        this.isComplete = true;
        this.recordState();
        this.notifyStateChange('complete');
        
        if (this.onComplete) {
            this.onComplete();
        }
    }

    /**
     * บันทึกสถานะปัจจุบัน
     */
    recordState() {
        const state = {
            sclk: this.sclk,
            mosi: this.mosi,
            miso: this.miso,
            ss: this.ss
        };
        
        Object.keys(state).forEach(key => {
            this.signalHistory[key].push(state[key]);
            if (this.signalHistory[key].length > this.maxHistory) {
                this.signalHistory[key].shift();
            }
        });
    }

    /**
     * แจ้งการเปลี่ยนแปลงสถานะ
     */
    notifyStateChange(event, data) {
        if (this.onStateChange) {
            this.onStateChange({
                event: event,
                data: data,
                bitIndex: this.currentBit,
                sclk: this.sclk,
                mosi: this.mosi,
                miso: this.miso,
                ss: this.ss,
                progress: this.getProgress()
            });
        }
    }

    /**
     * คำนวณความคืบหน้า
     */
    getProgress() {
        return {
            currentBit: this.currentBit,
            totalBits: 8,
            percentage: (this.currentBit / 8) * 100,
            isComplete: this.isComplete
        };
    }

    /**
     * รับข้อมูลที่ส่งเป็น binary string
     */
    getTransmitBinary() {
        return this.dataTx.toString(2).padStart(8, '0');
    }

    /**
     * รับข้อมูลที่กำลังส่งในแต่ละบิต
     */
    getCurrentMOSI() {
        const bitIndex = 7 - this.currentBit;
        return (this.dataTx >> bitIndex) & 1;
    }

    /**
     * รับข้อมูล MISO ปัจจุบัน
     */
    getCurrentMISO() {
        const bitIndex = 7 - this.currentBit;
        return (this.dataRxSlave >> bitIndex) & 1;
    }
}

// Export สำหรับใช้งาน
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SPIEngine;
}
