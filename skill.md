# 🛠️ Skill Documentation - Embedded System Simulators

> **Purpose:** This file is for AI collaborators to understand the project quickly.  
> If you are an AI reading this, follow the conventions documented here.

**Project:** Interactive Protocol Simulators for Vocational Education  
**Target Audience:** Vocational Certificate Students (ปวส.)  
**Author:** krutaopoon-prog  
**GitHub:** https://github.com/krutaopoon-prog/Embedded-System  
**Live Demo:** https://krutaopoon-prog.github.io/Embedded-System/  
**Created:** May 27, 2026

---

## 📂 Current File Structure

```
embedded-system/
├── index.html              # Landing page - links to all simulators
├── skill.md                # THIS FILE - AI documentation
├── README.md               # User-facing README
│
├── spi/                    # ✅ SPI Protocol (DONE)
│   ├── index.html          # Theory + Simulator + Quiz (single page)
│   ├── multi-slave.html    # Multi-Slave SPI Simulator (separate page)
│   ├── full-duplex.html    # Full-Duplex SPI Simulator (separate page)
│   ├── README.md
│   ├── multi-slave.png     # Multi-slave block diagram image
│   ├── SPI-interface-temp.png
│   ├── css/
│   │   ├── base.css        # Variables, Reset, Header, Footer, Responsive
│   │   ├── theory.css      # Theory section styles
│   │   ├── simulator.css   # Simulator + Quiz + Name Entry styles
│   │   ├── multi-slave.css # Multi-Slave simulator styles
│   │   └── full-duplex.css # Full-Duplex simulator + waveform styles
│   ├── js/
│   │   ├── spi-engine.js   # SPI protocol logic (modes 0 & 3)
│   │   ├── animation.js    # Canvas oscilloscope + SVG diagram
│   │   ├── learning-mode.js# Learning mode controller + theory toggle
│   │   ├── practice-mode.js# Quiz controller (name entry + 10 questions + result)
│   │   ├── app.js          # Main entry - mode switching
│   │   ├── multi-slave.js  # Multi-Slave simulator logic
│   │   └── full-duplex.js  # Full-Duplex simulator + waveform drawing
│   └── assets/             # (empty - for future images)
│
└── uart/                   # 🔜 UART Protocol (PLANNED)
```

---

## ⚡ Quick Reference - What Each File Does

### Main SPI Page (`spi/index.html`)
| File | Role |
|------|------|
| `base.css` | CSS variables, reset, header/footer, responsive breakpoints |
| `theory.css` | `.theory-block`, `.term-box`, `.signal-detail`, `.process-list`, tables, references |
| `simulator.css` | Connection diagram, oscilloscope, controls, quiz, name entry, result card |
| `spi-engine.js` | SPI state machine: `start()`, `step()`, `reset()`, modes 0/3 |
| `animation.js` | Canvas waveform drawing, SVG signal lines, UI updates |
| `learning-mode.js` | Init, event listeners, theory toggle, code tabs, SPI callbacks |
| `practice-mode.js` | Name entry → 10 quiz questions → result (name + score + grade) |
| `app.js` | Mode switching (learning ↔ practice), main init |

### Multi-Slave Simulator (`spi/multi-slave.html`)
| File | Role |
|------|------|
| `multi-slave.css` | Layout, device boxes, SVG signal lines, control panel, log |
| `multi-slave.js` | Slave selection, data transmission animation, signal line updates |

### Full-Duplex Simulator (`spi/full-duplex.html`)
| File | Role |
|------|------|
| `full-duplex.css` | Layout, arrow lines, bit display, waveform panel styles |
| `full-duplex.js` | Simultaneous MOSI+MISO transfer, canvas waveform (SS/SCLK/MOSI/MISO) |

---

## 🎯 Core Features (Every Simulator Must Have)

1. **Theory Section** - Read before simulation (with references)
2. **Interactive Learning Mode** - Animation + step-by-step
3. **Practice Quiz** - Name entry → 10 questions (matched to theory) → Result (name + score + grade)
4. **Responsive Design** - Desktop, Tablet, Mobile
5. **Web-based** - No installation, browser only

**Optional (protocol-dependent):**
- Oscilloscope/Waveform View (signal visualization on canvas)
- Arduino Code Examples
- Sub-Simulators (Multi-Slave, Full-Duplex, etc.)

---

## 🎨 Design System

### Colors
```css
--primary-color: #2563eb;    /* Blue - main actions */
--success-color: #22c55e;    /* Green - correct/active */
--error-color: #ef4444;      /* Red - incorrect/SS signal */
--warning-color: #f59e0b;    /* Orange - notes */
--bg-color: #f8fafc;         /* Page background */
--card-bg: #ffffff;          /* Card background */
--text-color: #1e293b;       /* Main text */
--text-muted: #64748b;       /* Secondary text */
```

### Signal Colors (Oscilloscope)
```
MOSI: #3b82f6 (Blue)
MISO: #22c55e (Green)
SCLK: #8b5cf6 (Purple)
SS:   #ef4444 (Red)
```

### Typography
- UI Font: `'Segoe UI', 'Sarabun', Tahoma, sans-serif`
- Code Font: `'Consolas', 'Monaco', monospace`

### Layout
- Max width: `1400px`
- Border radius: `8px` (small), `12px` (medium)
- Shadow: `0 4px 6px -1px rgba(0,0,0,0.1)`

---

## 🧠 Architecture Patterns

### Engine Pattern (protocol logic)
```javascript
class SPIEngine {
    constructor() { this.state = {}; }
    start()  { /* init transfer */ }
    step()   { /* advance 1 clock cycle */ }
    reset()  { /* reset all state */ }
    onStateChange = null;  // callback
    onComplete = null;     // callback
}
```

### Controller Pattern (UI)
```javascript
class LearningMode {
    init() { /* setup event listeners + engine */ }
    setupTheoryToggle() { /* show/hide theory */ }
    setupSPIEngine() { /* connect engine callbacks to UI */ }
}
```

### Mode Pattern
- **Learning Mode:** Visual step-by-step with explanations
- **Practice Mode:** Name entry → Quiz (10 questions matched to theory) → Result card

### Quiz Flow (Practice Mode)
```
1. Name Entry Screen
   - Input: ชื่อ-นามสกุล (ต้องกรอก ≥2 ตัวอักษร)
   - ปุ่ม "เริ่มทำแบบทดสอบ" disabled จนกว่ากรอกชื่อ
   - กด Enter หรือคลิกปุ่มเพื่อเริ่ม

2. Quiz Questions (10 ข้อ — ทุกข้อเป็น Multiple Choice 4 ตัวเลือก)
   - แต่ละข้อมี question-tag บอกว่ามาจากทฤษฎีส่วนไหน
   - ตอบแล้ว: ไฮไลท์เขียว (ถูก) / แดง (ผิด) + แสดงคำอธิบาย
   - ข้อที่ผิด → เก็บไว้ใน wrongAnswers[]
   - Navigate: ข้อก่อนหน้า / ข้อถัดไป / เสร็จสิ้น

3. Result Screen
   - แสดงชื่อ + คะแนน (เช่น 8/10) + เปอร์เซ็นต์ + เกรด
   - เกรด: ≥80% ดีเยี่ยม, ≥60% ดี, ≥40% พอใช้, <40% ต้องปรับปรุง
   - ปุ่ม "📋 ดูข้อที่ผิด" → แสดงรายการข้อผิดพร้อมเฉลย
   - ปุ่ม "🔄 ทำแบบทดสอบใหม่" → reset กลับหน้ากรอกชื่อ

4. Review Wrong Answers
   - แสดงแต่ละข้อที่ผิด: คำถาม + คำตอบของผู้ใช้ + คำตอบที่ถูก
   - ถ้าถูกหมด → แสดง "ตอบถูกทุกข้อ!"
```

### Quiz HTML Pattern (ทุกข้อใช้โครงสร้างนี้):
```html
<div class="quiz-question" data-question="1">
  <div class="question-text">
    <span class="question-tag">📖 ทฤษฎี: [ชื่อ section]</span>
    <h3>คำถามที่ 1: [คำถาม]</h3>
  </div>
  <div class="answer-options">
    <button class="answer-btn" data-correct="false">[ตัวเลือก]</button>
    <button class="answer-btn" data-correct="true">[คำตอบที่ถูก]</button>
    <button class="answer-btn" data-correct="false">[ตัวเลือก]</button>
    <button class="answer-btn" data-correct="false">[ตัวเลือก]</button>
  </div>
  <div class="question-explanation hidden">
    ✅ [คำอธิบาย]
  </div>
</div>
```

### Quiz JS Key Methods:
```javascript
class PracticeMode {
    setupNameEntry()    // จัดการ input + enable/disable ปุ่มเริ่ม
    startQuiz()         // ซ่อน name-entry, แสดง quiz-area, แสดงชื่อ
    handleAnswer(btn)   // ตรวจคำตอบ, ไฮไลท์, เก็บ wrongAnswers
    completeQuiz()      // คำนวณ %, เกรด, แสดง result card
    showReview()        // render ข้อที่ผิดลง review-list
    restart()           // reset ทุกอย่าง กลับหน้ากรอกชื่อ
}
```

### Quiz Question Guidelines:
1. **ต้องตรงกับทฤษฎี** — ห้ามถามเรื่องที่ไม่ได้สอนในโหมดเรียนรู้
2. **ใส่ question-tag** — บอกว่าคำถามมาจากทฤษฎีส่วนไหน
3. **4 ตัวเลือก** — 1 ถูก + 3 ผิด (ตัวเลือกผิดต้องสมเหตุสมผล)
4. **คำอธิบาย** — อธิบายว่าทำไมถูก + อ้างอิงทฤษฎี
5. **ภาษาไทย** — ใช้ภาษาง่ายๆ สำหรับเด็กอาชีวะ

### Sub-Simulator Pattern (separate HTML pages)
```javascript
class FullDuplexSPI {
    constructor() { /* init DOM + canvas + state */ }
    startTransfer() { /* begin simulation */ }
    stepOnce() { /* advance 1 bit */ }
    finishTransfer() { /* complete + show summary */ }
    reset() { /* reset all state + waveform */ }
    drawWaveform(upToBit) { /* render canvas signals */ }
}
// Instantiate on DOMContentLoaded
```

---

## 📚 Theory Section Guidelines

### Structure (single column, NOT grid):
```html
<div class="theory-section">
  <div class="theory-header">
    <h2>📖 ทฤษฎีก่อนใช้ Simulator</h2>
    <button onclick="toggleTheory()">ซ่อนเนื้อหา</button>
  </div>
  <div class="theory-content" id="theory-content">
    <div class="theory-block">...</div>  <!-- Section 1 -->
    <div class="theory-block">...</div>  <!-- Section 2 -->
    <div class="references">...</div>
  </div>
</div>
```

### Toggle Function (inline script in HTML):
```javascript
function toggleTheory() {
    const content = document.getElementById('theory-content');
    const btn = document.getElementById('toggle-theory');
    if (content.classList.contains('collapsed')) {
        content.classList.remove('collapsed');
        btn.textContent = 'ซ่อนเนื้อหา';
    } else {
        content.classList.add('collapsed');
        btn.textContent = 'แสดงเนื้อหา';
    }
}
```

### Content Sources (always cite):
- Official protocol specifications
- Analog Devices, SparkFun, Adafruit tutorials
- Arduino/Platform documentation

---

## 📖 Technical Terminology Guidelines

**Rule:** Explain EVERY technical term for vocational students.

### HTML Pattern:
```html
<div class="term-box">
  <h4>📘 Term Name</h4>
  <ul>
    <li><strong>Definition:</strong> Technical meaning</li>
    <li><strong>Simple analogy:</strong> Real-world comparison</li>
    <li><strong>Examples:</strong> Real devices</li>
  </ul>
</div>

<div class="signal-detail">
  <h4>🟢 MOSI - Master Out Slave In</h4>
  <ul>
    <li><strong>Direction:</strong> Master → Slave</li>
    <li><strong>Simple:</strong> Boss sends orders to employee</li>
  </ul>
</div>
```

### Key Principles:
1. **Never assume prior knowledge** - Explain EVERY acronym
2. **Use analogies** - Compare to everyday experiences
3. **Show direction** - Use arrows (→ ←)
4. **Give examples** - Real device names students know
5. **Explain WHY** - Not just what, but why it matters
6. **Thai + English** - English term, explain in Thai

### Example Terms:

| Term | Meaning | Analogy |
|------|---------|---------|
| MOSI | Master Out Slave In | Boss → Employee (send) |
| MISO | Master In Slave Out | Employee → Boss (reply) |
| SCLK | Serial Clock | Metronome / rhythm |
| SS/CS | Slave Select / Chip Select | Calling someone's name |
| Rising Edge | LOW → HIGH transition | Walking UP stairs |
| Falling Edge | HIGH → LOW transition | Walking DOWN stairs |
| Full-Duplex | Send + Receive simultaneously | Phone call |
| Master | Controller device | Boss |
| Slave | Peripheral device | Employee |

---

## 🔄 Cache Control for GitHub Pages

### Always use both methods together:

**Method 1: Meta Tags** (in `<head>`):
```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
```

**Method 2: Version Query Strings** (on CSS/JS links):
```html
<link rel="stylesheet" href="css/base.css?v=1.0">
<script src="js/app.js?v=1.2"></script>
```
> **Important:** Increment version when file changes: `?v=1.0` → `?v=1.1`

---

## 🚀 Future Protocol Roadmap

| Protocol | Difficulty | Status |
|----------|-----------|--------|
| SPI | Medium | ✅ Done |
| UART | Easy | 🔜 Next |
| I2C | Hard | 📋 Planned |
| CAN Bus | Very Hard | 📋 Planned |
| One-Wire | Medium | 📋 Planned |

---

## ✏️ How to Add a New Protocol

1. Create folder: `protocol-name/`
2. Copy CSS structure: `css/base.css`, `css/theory.css`, `css/simulator.css`
3. Create JS files: `engine.js`, `animation.js`, `learning-mode.js`, `practice-mode.js`, `app.js`
4. Write `index.html` with Theory Section + Simulator + Quiz
5. Add link in root `index.html`
6. Update this `skill.md`

---

**Last Updated:** May 27, 2026  
**Status:** SPI Complete (Main + Multi-Slave + Full-Duplex + Waveform + Quiz with Name Entry)
