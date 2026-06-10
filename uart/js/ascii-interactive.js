(function () {
    const CHAR_GROUPS = [
        { label: 'A–Z', chars: Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)) },
        { label: 'a–z', chars: Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i)) },
        { label: '0–9', chars: Array.from({ length: 10 }, (_, i) => String.fromCharCode(48 + i)) },
        { label: 'พิเศษ', chars: [' ', '!', '"', '#', '$', '%', '&', "'", '(', ')', '*', '+', ',', '-', '.', '/', ':', ';', '<', '=', '>', '?', '@', '[', ']', '^', '_', '{', '|', '}', '~'] }
    ];

    function toBinary8(n) {
        return n.toString(2).padStart(8, '0');
    }

    function updateDisplay(code) {
        const char = String.fromCharCode(code);
        const bin = toBinary8(code);

        const convChar = document.getElementById('conv-char');
        const convDec = document.getElementById('conv-dec');
        const convBin = document.getElementById('conv-bin');
        if (!convChar) return;

        convChar.textContent = code === 32 ? '␣ Space' : char;
        convDec.textContent = code;
        convBin.innerHTML = bin.split('').map(b =>
            `<span class="bit-cell ${b === '1' ? 'bit-one' : 'bit-zero'}">${b}</span>`
        ).join('');

        // Update inputs without re-triggering
        const iChar = document.getElementById('ascii-input-char');
        const iDec  = document.getElementById('ascii-input-dec');
        const iBin  = document.getElementById('ascii-input-bin');
        if (iChar) iChar.value = code === 32 ? ' ' : char;
        if (iDec)  iDec.value  = code;
        if (iBin)  iBin.value  = bin;

        // Highlight selected cell
        document.querySelectorAll('.ascii-cell').forEach(cell => {
            cell.classList.toggle('ascii-selected', parseInt(cell.dataset.code) === code);
        });
    }

    function buildGrid() {
        const container = document.getElementById('ascii-char-grid');
        if (!container) return;

        CHAR_GROUPS.forEach(group => {
            const groupEl = document.createElement('div');
            groupEl.className = 'ascii-group';

            const label = document.createElement('div');
            label.className = 'ascii-group-label';
            label.textContent = group.label;
            groupEl.appendChild(label);

            const row = document.createElement('div');
            row.className = 'ascii-row';
            group.chars.forEach(ch => {
                const code = ch.charCodeAt(0);
                const cell = document.createElement('div');
                cell.className = 'ascii-cell';
                cell.dataset.code = code;
                cell.innerHTML = `<span class="ascii-cell-char">${ch === ' ' ? '␣' : ch}</span><span class="ascii-cell-code">${code}</span>`;
                cell.addEventListener('click', () => updateDisplay(code));
                row.appendChild(cell);
            });
            groupEl.appendChild(row);
            container.appendChild(groupEl);
        });
    }

    function setupInputs() {
        const iChar = document.getElementById('ascii-input-char');
        const iDec  = document.getElementById('ascii-input-dec');
        const iBin  = document.getElementById('ascii-input-bin');

        if (iChar) {
            iChar.addEventListener('input', () => {
                if (iChar.value.length === 1) updateDisplay(iChar.value.charCodeAt(0));
            });
        }
        if (iDec) {
            iDec.addEventListener('input', () => {
                const n = parseInt(iDec.value);
                if (!isNaN(n) && n >= 32 && n <= 126) updateDisplay(n);
            });
        }
        if (iBin) {
            iBin.addEventListener('input', () => {
                if (/^[01]{8}$/.test(iBin.value)) {
                    const n = parseInt(iBin.value, 2);
                    if (n >= 32 && n <= 126) updateDisplay(n);
                }
            });
        }

        const btnSend = document.getElementById('btn-ascii-to-uart');
        if (btnSend) {
            btnSend.addEventListener('click', () => {
                const charVal = iChar ? iChar.value : '';
                if (!charVal) return;

                // Switch to learning mode
                document.querySelectorAll('.mode-btn').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.mode === 'learning-mode');
                });
                document.querySelectorAll('.mode-section').forEach(sec => {
                    sec.classList.toggle('active', sec.id === 'learning-mode');
                });

                // Set simulator input
                const simInput = document.getElementById('input-data');
                if (simInput) {
                    simInput.value = charVal;
                    simInput.dispatchEvent(new Event('input'));
                }

                document.getElementById('learning-mode').scrollIntoView({ behavior: 'smooth' });
            });
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        buildGrid();
        setupInputs();
        updateDisplay(65); // Default: 'A'
    });
})();
