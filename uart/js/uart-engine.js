/**
 * UART Engine - Protocol Logic
 * Handles UART frame generation, transmission simulation
 */

class UARTEngine {
    constructor() {
        this.baudRate = 9600;
        this.dataBits = 8;
        this.parity = 'none';
        this.stopBits = 1;
        this.frame = [];
        this.currentBit = -1;
        this.isTransmitting = false;
        this.isComplete = false;
        this.txData = 0;
        this.rxData = 0;

        // Callbacks
        this.onBitSent = null;
        this.onFrameComplete = null;
        this.onStateChange = null;
    }

    /**
     * Configure UART parameters
     */
    configure(options) {
        if (options.baudRate) this.baudRate = options.baudRate;
        if (options.dataBits) this.dataBits = options.dataBits;
        if (options.parity) this.parity = options.parity;
        if (options.stopBits) this.stopBits = options.stopBits;
    }

    /**
     * Build UART frame from character
     */
    buildFrame(char) {
        this.txData = char.charCodeAt(0);
        this.frame = [];

        // Start bit (always LOW)
        this.frame.push({ value: 0, type: 'start', label: 'Start' });

        // Data bits (LSB first)
        let onesCount = 0;
        for (let i = 0; i < this.dataBits; i++) {
            const bit = (this.txData >> i) & 1;
            onesCount += bit;
            this.frame.push({ value: bit, type: 'data', label: `D${i}` });
        }

        // Parity bit (optional)
        if (this.parity === 'even') {
            const parityBit = onesCount % 2 === 0 ? 0 : 1;
            this.frame.push({ value: parityBit, type: 'parity', label: 'P' });
        } else if (this.parity === 'odd') {
            const parityBit = onesCount % 2 === 1 ? 0 : 1;
            this.frame.push({ value: parityBit, type: 'parity', label: 'P' });
        }

        // Stop bit(s) (always HIGH)
        for (let i = 0; i < this.stopBits; i++) {
            this.frame.push({ value: 1, type: 'stop', label: 'Stop' });
        }

        return this.frame;
    }

    /**
     * Start transmission
     */
    start(char) {
        this.buildFrame(char);
        this.currentBit = -1;
        this.isTransmitting = true;
        this.isComplete = false;
        this.rxData = 0;

        if (this.onStateChange) {
            this.onStateChange({
                state: 'started',
                char: char,
                ascii: this.txData,
                binary: this.txData.toString(2).padStart(8, '0'),
                frame: this.frame,
                baudRate: this.baudRate
            });
        }
    }

    /**
     * Advance one bit
     */
    step() {
        if (!this.isTransmitting || this.isComplete) return null;

        this.currentBit++;

        if (this.currentBit >= this.frame.length) {
            this.isComplete = true;
            this.isTransmitting = false;

            if (this.onFrameComplete) {
                this.onFrameComplete({
                    txData: this.txData,
                    rxData: this.rxData,
                    char: String.fromCharCode(this.txData),
                    frame: this.frame
                });
            }
            return null;
        }

        const bit = this.frame[this.currentBit];

        // Reconstruct RX data from data bits
        if (bit.type === 'data') {
            const bitIndex = this.currentBit - 1; // subtract 1 for start bit
            if (bit.value === 1) {
                this.rxData |= (1 << bitIndex);
            }
        }

        if (this.onBitSent) {
            this.onBitSent({
                index: this.currentBit,
                bit: bit,
                progress: (this.currentBit + 1) / this.frame.length,
                rxDataSoFar: this.rxData
            });
        }

        return bit;
    }

    /**
     * Send all bits at once (auto mode)
     */
    sendAll(char, interval = 200) {
        this.start(char);
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
     * Stop auto transmission
     */
    stop() {
        if (this._autoTimer) {
            clearInterval(this._autoTimer);
            this._autoTimer = null;
        }
    }

    /**
     * Reset engine
     */
    reset() {
        this.stop();
        this.frame = [];
        this.currentBit = -1;
        this.isTransmitting = false;
        this.isComplete = false;
        this.txData = 0;
        this.rxData = 0;
    }

    /**
     * Get frame info for display
     */
    getFrameInfo() {
        return {
            totalBits: this.frame.length,
            currentBit: this.currentBit,
            frame: this.frame,
            isTransmitting: this.isTransmitting,
            isComplete: this.isComplete
        };
    }
}
