/**
 * I2C Engine - Protocol Logic
 * Handles I2C frame generation, Start/Stop conditions, Address+R/W+Data+ACK
 */

class I2CEngine {
    constructor() {
        this.slaveAddress = 0x3C;
        this.rwBit = 0; // 0=Write, 1=Read
        this.data = 0x55;
        this.frame = [];
        this.currentStep = -1;
        this.isTransmitting = false;
        this.isComplete = false;

        // Callbacks
        this.onStepExecuted = null;
        this.onFrameComplete = null;
        this.onStateChange = null;
    }

    /**
     * Configure I2C parameters
     */
    configure(options) {
        if (options.slaveAddress !== undefined) this.slaveAddress = options.slaveAddress;
        if (options.rwBit !== undefined) this.rwBit = options.rwBit;
        if (options.data !== undefined) this.data = options.data;
    }

    /**
     * Build I2C frame
     * Frame: [Start] [A6..A0] [R/W] [ACK] [D7..D0] [ACK] [Stop]
     */
    buildFrame() {
        this.frame = [];

        // Start Condition
        this.frame.push({ type: 'start', label: 'START', sda: 'fall', scl: 'high', desc: 'SDA: HIGH→LOW ขณะ SCL=HIGH' });

        // Address bits (7 bits, MSB first)
        for (let i = 6; i >= 0; i--) {
            const bit = (this.slaveAddress >> i) & 1;
            this.frame.push({ type: 'addr', value: bit, label: `A${i}`, desc: `Address bit ${i} = ${bit}` });
        }

        // R/W bit
        this.frame.push({ type: 'rw', value: this.rwBit, label: 'R/W', desc: this.rwBit === 0 ? 'Write (0)' : 'Read (1)' });

        // ACK from Slave
        this.frame.push({ type: 'ack', value: 0, label: 'ACK', desc: 'Slave ตอบ ACK (SDA=LOW) — "ฉันอยู่!"' });

        // Data bits (8 bits, MSB first)
        for (let i = 7; i >= 0; i--) {
            const bit = (this.data >> i) & 1;
            this.frame.push({ type: 'data', value: bit, label: `D${i}`, desc: `Data bit ${i} = ${bit}` });
        }

        // ACK from Slave (data received)
        this.frame.push({ type: 'ack', value: 0, label: 'ACK', desc: 'Slave ตอบ ACK — "ได้รับข้อมูลแล้ว"' });

        // Stop Condition
        this.frame.push({ type: 'stop', label: 'STOP', sda: 'rise', scl: 'high', desc: 'SDA: LOW→HIGH ขณะ SCL=HIGH' });

        return this.frame;
    }

    /**
     * Start transmission
     */
    start() {
        this.buildFrame();
        this.currentStep = -1;
        this.isTransmitting = true;
        this.isComplete = false;

        if (this.onStateChange) {
            this.onStateChange({
                state: 'started',
                slaveAddress: this.slaveAddress,
                rwBit: this.rwBit,
                data: this.data,
                frame: this.frame
            });
        }
    }

    /**
     * Advance one step
     */
    step() {
        if (!this.isTransmitting || this.isComplete) return null;

        this.currentStep++;

        if (this.currentStep >= this.frame.length) {
            this.isComplete = true;
            this.isTransmitting = false;

            if (this.onFrameComplete) {
                this.onFrameComplete({
                    slaveAddress: this.slaveAddress,
                    rwBit: this.rwBit,
                    data: this.data,
                    frame: this.frame
                });
            }
            return null;
        }

        const stepData = this.frame[this.currentStep];

        if (this.onStepExecuted) {
            this.onStepExecuted({
                index: this.currentStep,
                step: stepData,
                progress: (this.currentStep + 1) / this.frame.length
            });
        }

        return stepData;
    }

    /**
     * Send all steps automatically
     */
    sendAll(interval = 350) {
        this.start();
        return new Promise((resolve) => {
            const timer = setInterval(() => {
                const result = this.step();
                if (result === null) {
                    clearInterval(timer);
                    resolve();
                }
            }, interval);
            this._autoTimer = timer;
        });
    }

    /**
     * Stop auto
     */
    stop() {
        if (this._autoTimer) {
            clearInterval(this._autoTimer);
            this._autoTimer = null;
        }
    }

    /**
     * Reset
     */
    reset() {
        this.stop();
        this.frame = [];
        this.currentStep = -1;
        this.isTransmitting = false;
        this.isComplete = false;
    }

    getFrameInfo() {
        return {
            totalSteps: this.frame.length,
            currentStep: this.currentStep,
            frame: this.frame,
            isTransmitting: this.isTransmitting,
            isComplete: this.isComplete
        };
    }
}
