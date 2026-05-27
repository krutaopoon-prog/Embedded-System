# 🛠️ Skill Documentation - Embedded System Simulators

**Project:** Interactive Protocol Simulators for Vocational Education  
**Target Audience:** Vocational Certificate Students (ปวส.)  
**Author:** krutaopoon-prog  
**Created:** May 27, 2026

---

## 📋 Project Overview

Building web-based interactive simulators for embedded system communication protocols. Current implementation: **SPI Protocol**. Planned: UART, I2C, CAN Bus, One-Wire.

---

## 🔧 Core Skills Required

### 1. HTML5 & Semantic Structure
**Level:** Intermediate

**Key Concepts:**
- Semantic HTML structure (`<header>`, `<main>`, `<section>`, `<footer>`)
- Data attributes for JavaScript hooks (`data-question`, `data-tab`)
- Canvas element for waveform visualization
- SVG for signal line diagrams

**Used In:**
- `index.html` - Landing page with protocol cards
- `spi/index.html` - Main simulator interface

**Best Practices:**
```html
<!-- Use semantic elements -->
<section id="learning-mode" class="mode-section active">
  <div class="visualization-panel">...</div>
</section>

<!-- Data attributes for JS -->
<button class="answer-btn" data-correct="true">MOSI</button>
```

---

### 2. CSS3 & Modern Styling
**Level:** Advanced

**Key Concepts:**
- CSS Custom Properties (Variables)
- CSS Grid & Flexbox layouts
- CSS Animations & Transitions
- Responsive Design (Mobile-first)
- Glassmorphism effects

**Used In:**
- `spi/css/style.css` - All styling
- `index.html` (inline) - Landing page styles

**Best Practices:**
```css
/* CSS Variables for consistency */
:root {
  --primary-color: #2563eb;
  --success-color: #22c55e;
  --bg-color: #f8fafc;
}

/* Grid for responsive layouts */
.simulators-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

/* Smooth transitions */
.card {
  transition: all 0.3s ease;
}
.card:hover {
  transform: translateY(-10px);
}
```

---

### 3. Vanilla JavaScript (ES6+)
**Level:** Advanced

**Key Concepts:**
- ES6 Classes for architecture
- Event Delegation & Event Listeners
- Canvas API for drawing
- State management patterns
- Callback functions for async events

**Architecture Pattern:**
```javascript
// Engine pattern for protocol simulation
class SPIEngine {
  constructor() {
    this.state = {};
    this.callbacks = {};
  }
  
  setMode(mode) { /* ... */ }
  step() { /* ... */ }
  
  // Event-driven callbacks
  onStateChange = null;
  onComplete = null;
}

// Controller pattern for UI
class AnimationController {
  constructor(engine) {
    this.engine = engine;
    this.setupCallbacks();
  }
  
  setupCallbacks() {
    this.engine.onStateChange = (state) => {
      this.updateUI(state);
    };
  }
}
```

**Used In:**
- `spi-engine.js` - Protocol simulation logic
- `animation.js` - UI updates & canvas drawing
- `learning-mode.js` - Learning mode controller
- `practice-mode.js` - Quiz controller
- `app.js` - Main application controller

---

### 4. Canvas API
**Level:** Intermediate

**Key Concepts:**
- 2D Context drawing
- Drawing waveforms (digital signals)
- Grid systems
- Animation loops
- Responsive canvas sizing

**Code Pattern:**
```javascript
const canvas = document.getElementById('scope-canvas');
const ctx = canvas.getContext('2d');

// Clear canvas
ctx.fillStyle = '#020617';
ctx.fillRect(0, 0, width, height);

// Draw digital signal
ctx.strokeStyle = '#22c55e';
ctx.beginPath();
signalData.forEach((value, index) => {
  const x = index * stepWidth;
  const y = baseY + (value === 1 ? -15 : 15);
  if (index === 0) ctx.moveTo(x, y);
  else ctx.lineTo(x, y);
});
ctx.stroke();
```

---

### 5. SVG Graphics
**Level:** Basic

**Key Concepts:**
- Line elements for connections
- ViewBox for responsive scaling
- CSS classes for styling SVG
- Dynamic class toggling for active states

**Used In:**
- Signal line diagram in SPI simulator

---

### 6. Communication Protocol Knowledge
**Level:** Expert (Domain Knowledge)

**SPI Protocol Specifics:**
- 4-wire interface (MOSI, MISO, SCLK, SS)
- Full-duplex communication
- Clock polarity (CPOL) & phase (CPHA)
- 4 modes (0, 1, 2, 3) - implemented 0 & 3
- MSB-first transmission
- Slave Select (SS) active LOW

**Key Timing:**
- 1 byte = 8 clock cycles
- Sampling on rising/falling edge based on mode
- SS LOW before transmission, HIGH after

---

### 7. UI/UX Design for Education
**Level:** Intermediate

**Key Principles:**
- Clear visual hierarchy
- Step-by-step progression indicators
- Immediate feedback (correct/incorrect highlights)
- Responsive for all devices
- Thai language for local students
- Code examples for practical application

**Core Features (Required):**
- Interactive Learning Mode with Animation
- Practice Quiz (10 questions with explanations)
- Responsive Design (Desktop, Tablet, Mobile)
- Web-based (no installation required)

**Optional Features (Protocol-dependent):**
- Oscilloscope View (for signal visualization)
- Arduino Code Examples (for practical testing)

---

### 8. Git & GitHub
**Level:** Intermediate

**Workflow:**
```bash
git init
git add .
git commit -m "message"
git remote add origin <url>
git push -u origin main
```

**GitHub Pages Deployment:**
- Settings → Pages → Source: main branch, root
- Auto-deploy on push
- URL: `https://username.github.io/repo-name/`

---

## 📁 File Structure Convention

```
project-root/
├── index.html              # Landing page (catalog)
├── skill.md                # This file - documentation
├── README.md               # User-facing documentation
├── protocol-name/          # Each protocol simulator
│   ├── index.html
│   ├── README.md
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── engine.js       # Protocol logic
│   │   ├── animation.js    # UI controller
│   │   ├── learning-mode.js
│   │   ├── practice-mode.js
│   │   └── app.js          # Main entry
│   └── assets/             # Images, icons
└── [other-protocols]/     # Future implementations
```

---

## 🎨 Design System

### Color Palette
```css
/* Primary */
--primary-color: #2563eb;    /* Blue */
--primary-hover: #1d4ed8;

/* Status */
--success-color: #22c55e;    /* Green - correct/active */
--error-color: #ef4444;      /* Red - incorrect/SS */
--warning-color: #f59e0b;    /* Orange */

/* Backgrounds */
--bg-color: #f8fafc;         /* Light gray */
--card-bg: #ffffff;

/* Text */
--text-color: #1e293b;       /* Dark slate */
--text-muted: #64748b;

/* Signals (Oscilloscope) */
MOSI: #3b82f6 (Blue)
MISO: #22c55e (Green)
SCLK: #8b5cf6 (Purple)
SS:   #ef4444 (Red)
```

### Typography
- Font: `'Segoe UI', 'Sarabun', Tahoma, sans-serif`
- Monospace: `'Consolas', 'Monaco', monospace`

### Layout
- Container: `max-width: 1400px`
- Grid gap: `1.5rem - 2rem`
- Border radius: `8px - 12px - 20px` (small, medium, large)
- Shadows: `0 4px 6px -1px rgba(0,0,0,0.1)`

---

## 🧠 Architecture Patterns

### 1. Engine Pattern
Protocol simulation engine handles:
- State management
- Step execution
- History recording
- Event emission

### 2. Controller Pattern
UI controllers handle:
- DOM manipulation
- Event binding
- Animation timing
- Canvas drawing

### 3. Mode Pattern
Separate modes for different learning styles:
- Learning Mode: Visual, step-by-step
- Practice Mode: Interactive quiz

---

## 🚀 Future Protocol Roadmap

| Protocol | Difficulty | Key Features Needed |
|----------|------------|---------------------|
| UART | Easy | Baud rate, start/stop bits, parity |
| I2C | Hard | Addressing, ACK/NACK, multi-master |
| CAN Bus | Very Hard | Message IDs, arbitration, error handling |
| One-Wire | Medium | Time-slots, ROM commands, CRC |

---

## � Cache Control for GitHub Pages

GitHub Pages caches files aggressively. Use these methods to prevent stale content:

### Method 1: Meta Tags (HTML)
Add to `<head>` in all HTML files:
```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
```

### Method 2: Version Query Strings
Append version to CSS/JS files:
```html
<link rel="stylesheet" href="css/style.css?v=1.0">
<script src="js/app.js?v=1.0"></script>
```
Update version number when files change: `?v=1.1`, `?v=1.2`, etc.

### Method 3: Cache-Busting URL (Quick Fix)
Add timestamp parameter for immediate refresh:
```
https://username.github.io/repo/?nocache=1
```

### Recommended Approach
Use **Method 1 + Method 2** together for best results.

---

## �📝 Adding New Skills

When adding new protocols, document new skills here:

```markdown
### X. [New Skill Name]
**Level:** [Beginner/Intermediate/Advanced]

**Key Concepts:**
- Concept 1
- Concept 2

**Code Pattern:**
```javascript
// Example code
```
```

---

## 🔗 Repository Links

- **GitHub:** https://github.com/krutaopoon-prog/Embedded-System
- **Live Demo:** https://krutaopoon-prog.github.io/Embedded-System/
- **SPI Demo:** https://krutaopoon-prog.github.io/Embedded-System/spi/

---

**Last Updated:** May 27, 2026  
**Status:** SPI Complete, UART/I2C/CAN Bus/One-Wire Planned
