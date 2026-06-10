/**
 * Animation - UART Waveform Drawing on Canvas
 */

class UARTAnimation {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        this.drawIdle();
    }

    resize() {
        // Match canvas buffer to CSS display width to prevent stretching
        const displayW = this.canvas.offsetWidth;
        this.canvas.width  = displayW > 0 ? displayW : Math.min(800, this.canvas.parentElement.offsetWidth - 40);
        this.canvas.height = 200;
    }

    /**
     * Draw idle state (all HIGH)
     */
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
        ctx.fillText('HIGH (1)', 5, 55);
        ctx.fillText('LOW (0)', 5, 155);

        // Idle line (HIGH)
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(60, 50);
        ctx.lineTo(w - 20, 50);
        ctx.stroke();

        // Label
        ctx.fillStyle = '#f97316';
        ctx.font = 'bold 12px Consolas, monospace';
        ctx.fillText('TX: IDLE (HIGH)', w / 2 - 60, 35);
    }

    /**
     * Draw UART frame waveform up to a given bit index
     */
    drawFrame(frame, upToBit) {
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
        ctx.fillText('HIGH (1)', 5, 55);
        ctx.fillText('LOW (0)', 5, 155);

        const startX = 60;
        const bitWidth = Math.min(55, (w - 100) / (frame.length + 2));
        const highY = 50;
        const lowY = 150;

        // Draw idle before start
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(startX - 30, highY);
        ctx.lineTo(startX, highY);

        let prevY = highY;

        for (let i = 0; i <= Math.min(upToBit, frame.length - 1); i++) {
            const x = startX + i * bitWidth;
            const nextX = x + bitWidth;
            const y = frame[i].value === 1 ? highY : lowY;

            // Transition
            if (y !== prevY) {
                ctx.lineTo(x, y);
            }
            ctx.lineTo(nextX, y);
            prevY = y;
        }

        ctx.stroke();

        // Draw idle after (if complete)
        if (upToBit >= frame.length - 1) {
            const endX = startX + frame.length * bitWidth;
            ctx.beginPath();
            ctx.moveTo(endX, highY);
            ctx.lineTo(endX + 40, highY);
            ctx.stroke();
        }

        // Bit labels
        for (let i = 0; i <= Math.min(upToBit, frame.length - 1); i++) {
            const x = startX + i * bitWidth + bitWidth / 2;
            let color = '#94a3b8';
            if (frame[i].type === 'start') color = '#22c55e';
            else if (frame[i].type === 'stop') color = '#ef4444';
            else if (frame[i].type === 'parity') color = '#f59e0b';
            else if (frame[i].type === 'data') color = '#f97316';

            ctx.fillStyle = color;
            ctx.font = 'bold 10px Consolas, monospace';
            ctx.textAlign = 'center';
            ctx.fillText(frame[i].label, x, 180);
            ctx.fillText(frame[i].value.toString(), x, 195);
        }

        // Highlight current bit
        if (upToBit >= 0 && upToBit < frame.length) {
            const hx = startX + upToBit * bitWidth;
            ctx.fillStyle = 'rgba(249, 115, 22, 0.1)';
            ctx.fillRect(hx, 30, bitWidth, 140);
            ctx.strokeStyle = '#f97316';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.strokeRect(hx, 30, bitWidth, 140);
            ctx.setLineDash([]);
        }

        ctx.textAlign = 'start';
    }
}
