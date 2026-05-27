/**
 * Animation - I2C Waveform Drawing on Canvas
 */

class I2CAnimation {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        this.drawIdle();
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = Math.min(800, rect.width - 40);
        this.canvas.height = 220;
    }

    drawIdle() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, w, h);

        // Grid
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        for (let y = 0; y < h; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // Labels
        ctx.fillStyle = '#64748b';
        ctx.font = '11px Consolas, monospace';
        ctx.fillText('SDA', 5, 55);
        ctx.fillText('SCL', 5, 155);

        // Idle lines (both HIGH)
        ctx.lineWidth = 2.5;

        // SDA
        ctx.strokeStyle = '#7c3aed';
        ctx.beginPath();
        ctx.moveTo(50, 40);
        ctx.lineTo(w - 20, 40);
        ctx.stroke();

        // SCL
        ctx.strokeStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(50, 140);
        ctx.lineTo(w - 20, 140);
        ctx.stroke();

        // Labels
        ctx.fillStyle = '#7c3aed';
        ctx.font = 'bold 11px Consolas, monospace';
        ctx.fillText('SDA: IDLE (HIGH)', w / 2 - 50, 30);
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('SCL: IDLE (HIGH)', w / 2 - 50, 130);
    }

    /**
     * Draw I2C waveform up to a given step
     */
    drawFrame(frame, upToStep) {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, w, h);

        // Grid
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        for (let y = 0; y < h; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // Y positions
        const sdaHigh = 40, sdaLow = 80;
        const sclHigh = 140, sclLow = 180;
        const startX = 50;
        const bitWidth = Math.min(35, (w - 80) / (frame.length + 2));

        // Labels
        ctx.fillStyle = '#64748b';
        ctx.font = '10px Consolas, monospace';
        ctx.fillText('SDA', 5, 55);
        ctx.fillText('SCL', 5, 155);

        // Draw SDA
        ctx.strokeStyle = '#7c3aed';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(startX - 20, sdaHigh); // Idle HIGH

        let sdaPrevY = sdaHigh;

        for (let i = 0; i <= Math.min(upToStep, frame.length - 1); i++) {
            const x = startX + i * bitWidth;
            const step = frame[i];
            let sdaY;

            if (step.type === 'start') {
                sdaY = sdaLow; // HIGH → LOW
            } else if (step.type === 'stop') {
                sdaY = sdaHigh; // LOW → HIGH
            } else {
                sdaY = (step.value === 1) ? sdaHigh : sdaLow;
            }

            // Transition at start of bit
            ctx.lineTo(x, sdaPrevY);
            if (sdaY !== sdaPrevY) ctx.lineTo(x, sdaY);
            ctx.lineTo(x + bitWidth, sdaY);
            sdaPrevY = sdaY;
        }

        ctx.stroke();

        // Draw SCL (clock pulses for each bit except Start/Stop)
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(startX - 20, sclHigh);

        for (let i = 0; i <= Math.min(upToStep, frame.length - 1); i++) {
            const x = startX + i * bitWidth;
            const step = frame[i];

            if (step.type === 'start' || step.type === 'stop') {
                // Start/Stop: SCL stays HIGH
                ctx.lineTo(x, sclHigh);
                ctx.lineTo(x + bitWidth, sclHigh);
            } else {
                // Normal bit: clock pulse LOW→HIGH→LOW
                ctx.lineTo(x, sclLow);
                ctx.lineTo(x + bitWidth * 0.3, sclLow);
                ctx.lineTo(x + bitWidth * 0.3, sclHigh);
                ctx.lineTo(x + bitWidth * 0.7, sclHigh);
                ctx.lineTo(x + bitWidth * 0.7, sclLow);
                ctx.lineTo(x + bitWidth, sclLow);
            }
        }

        ctx.stroke();

        // Step labels
        ctx.textAlign = 'center';
        for (let i = 0; i <= Math.min(upToStep, frame.length - 1); i++) {
            const x = startX + i * bitWidth + bitWidth / 2;
            const step = frame[i];
            let color = '#94a3b8';
            if (step.type === 'start' || step.type === 'stop') color = '#ef4444';
            else if (step.type === 'addr') color = '#7c3aed';
            else if (step.type === 'rw') color = '#f59e0b';
            else if (step.type === 'ack') color = '#22c55e';
            else if (step.type === 'data') color = '#3b82f6';

            ctx.fillStyle = color;
            ctx.font = 'bold 9px Consolas, monospace';
            ctx.fillText(step.label, x, 200);
            if (step.value !== undefined) ctx.fillText(step.value.toString(), x, 212);
        }

        // Highlight current step
        if (upToStep >= 0 && upToStep < frame.length) {
            const hx = startX + upToStep * bitWidth;
            ctx.fillStyle = 'rgba(124, 58, 237, 0.08)';
            ctx.fillRect(hx, 25, bitWidth, 175);
            ctx.strokeStyle = '#7c3aed';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.strokeRect(hx, 25, bitWidth, 175);
            ctx.setLineDash([]);
        }

        ctx.textAlign = 'start';
    }
}
