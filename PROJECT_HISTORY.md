# 📋 ประวัติโปรเจกต์ - Embedded System Simulators

## 🎯 ภาพรวมโปรเจกต์

โปรเจกต์นี้เป็น **เครื่องมือจำลองการทำงานโปรโตคอลต่างๆ ในระบบ Embedded** สำหรับใช้เป็นสื่อการสอนนักเรียนระดับ **ปวส.** (ประกาศนียบัตรวิชาชีพชั้นสูง)

---

## 📅 ไทม์ไลน์การทำงาน

### 🗓️ 27 พฤษภาคม 2026

#### ✅ SPI Simulator - เสร็จสมบูรณ์

**ผู้พัฒนา:** Cascade AI (คู่สอนโปรแกรม)

**เวลาที่ใช้:** ~30 นาที (การพัฒนาทั้งหมด)

**สิ่งที่สร้าง:**

1. **โครงสร้างโฟลเดอร์**
   ```
   embedded-system/
   ├── index.html              (หน้าสารบัญ - Landing Page)
   ├── PROJECT_HISTORY.md      (ไฟล์นี้)
   ├── README.md               (คู่มือโปรเจกต์หลัก)
   ├── spi/                    (SPI Simulator)
   │   ├── index.html
   │   ├── README.md
   │   ├── css/style.css
   │   └── js/
   │       ├── spi-engine.js
   │       ├── animation.js
   │       ├── learning-mode.js
   │       ├── practice-mode.js
   │       └── app.js
   └── uart/                   (ว่างไว้สำหรับพัฒนาต่อ)
   ```

2. **ฟีเจอร์ที่พัฒนา**
   - 🔌 **โหมดเรียนรู้ (Learning Mode)**
     - Visualization Master-Slave พร้อมสัญญาณ 4 เส้น (MOSI, MISO, SCLK, SS)
     - Oscilloscope View แสดง waveform real-time ด้วย Canvas API
     - Animation step-by-step พร้อมคำอธิบายภาษาไทย
     - รองรับ SPI Mode 0 และ Mode 3 (CPOL/CPHA)
     - ปุ่มควบคุม: Play, Pause, Step, Reset
     - ปรับความเร็วได้
     - ตัวอย่างโค้ด Arduino Master/Slave

   - 📝 **โหมดทดสอบ (Practice Mode)**
     - แบบทดสอบ 10 ข้อ interactive
     - รูปแบบหลากหลาย: ตัวเลือก, จับคู่ (matching), อ่าน waveform
     - แสดงคะแนนและคำอธิบายเฉลย
     - ระบบนำทางข้อถัดไป/ก่อนหน้า

3. **เทคโนโลยีที่ใช้**
   - HTML5 (โครงสร้าง)
   - CSS3 (Styling + Animation + Responsive)
   - Vanilla JavaScript (ไม่ใช้ framework - ลดความซับซ้อน)
   - Canvas API (Oscilloscope waveform)
   - SVG (เส้นสัญญาณใน diagram)

4. **การ Deploy**
   - Repository: `https://github.com/krutaopoon-prog/Embedded-System`
   - GitHub Pages: `https://krutaopoon-prog.github.io/Embedded-System/`
   - SPI Simulator: `https://krutaopoon-prog.github.io/Embedded-System/spi/`

---

## 🔧 รายละเอียดทางเทคนิค

### SPI Engine (`spi/spi-engine.js`)

**คลาสหลัก:** `SPIEngine`

**ความสามารถ:**
- จำลองการทำงาน SPI Mode 0 (CPOL=0, CPHA=0) และ Mode 3 (CPOL=1, CPHA=1)
- ส่งข้อมูล 1 byte (8 bits) MSB first
- บันทึกประวัติสัญญาณสำหรับ oscilloscope (max 100 samples)
- Callbacks: `onStateChange`, `onComplete`

**วิธีใช้:**
```javascript
const spi = new SPIEngine();
spi.setMode(0);              // Mode 0
spi.setTransmitData(0xAA);   // ส่ง 0xAA
spi.start();                 // เริ่ม
spi.step();                  // ทีละขั้น
```

### Animation Controller (`spi/js/animation.js`)

**คลาสหลัก:** `AnimationController`

**หน้าที่:**
- ควบคุม animation loop
- อัพเดท UI ตามสถานะ SPI (pins, data display)
- วาด oscilloscope ด้วย Canvas API
- แสดงคำอธิบาย step-by-step

### Learning Mode (`spi/js/learning-mode.js`)

**คลาสหลัก:** `LearningMode`

**หน้าที่:**
- ผูก event listeners กับ UI
- ควบคุม SPI Engine และ Animator
- อัพเดท binary preview, mode explanation
- จัดการ code tabs (Master/Slave)

### Practice Mode (`spi/js/practice-mode.js`)

**คลาสหลัก:** `PracticeMode`

**หน้าที่:**
- จัดการ quiz navigation (10 ข้อ)
- ตรวจสอบคำตอบและอัพเดทคะแนน
- จัดการ matching game (ข้อ 4)
- แสดง/ซ่อน explanation

---

## 🚀 วิธีต่อยอด / ทำโปรโตคอลอื่น

### 1. สร้างโฟลเดอร์ใหม่
```bash
mkdir uart
cd uart
mkdir css js assets
```

### 2. สร้างไฟล์พื้นฐาน
- `index.html` - หน้าหลัก
- `css/style.css` - สไตล์ (copy จาก spi แล้วปรับแกะ)
- `js/` - ไฟล์ JavaScript:
  - `uart-engine.js` - เอนจินโปรโตคอล
  - `animation.js` - animation controller
  - `learning-mode.js` - โหมดเรียนรู้
  - `practice-mode.js` - โหมดทดสอบ
  - `app.js` - โค้ดหลัก

### 3. โครงสร้างโค้ดที่ควรทำตาม

**เอนจิน (xxx-engine.js):**
```javascript
class XXXEngine {
    constructor() {
        // สถานะเริ่มต้น
        this.isRunning = false;
        // ...
    }
    
    setMode(mode) { /* ... */ }
    reset() { /* ... */ }
    start() { /* ... */ }
    step() { /* ... */ }
    
    // Callbacks
    onStateChange = null;
    onComplete = null;
}
```

**สิ่งที่ต้องมีในการจำลองโปรโตคอล:**
1. สถานะสัญญาณ (pins, lines, registers)
2. ประวัติสัญญาณสำหรับ oscilloscope
3. Event callbacks
4. Step-by-step execution

### 4. เนื้อหาที่ควรมีในแต่ละโปรโตคอล

| ส่วน | รายละเอียด |
|------|------------|
| **Visualization** | แผนภาพการเชื่อมต่อ, signal lines |
| **Oscilloscope** | Waveform ของสัญญาณหลัก |
| **Learning Mode** | Animation + คำอธิบาย step-by-step |
| **Practice Mode** | แบบทดสอบ ~10 ข้อ |
| **Code Examples** | ตัวอย่าง Arduino/STM32 |

---

## 📝 โปรโตคอลที่วางแผนไว้

| โปรโตคอล | สถานะ | ความยาก |
|-----------|--------|---------|
| SPI | ✅ เสร็จแล้ว | ปานกลาง |
| UART | 🚧 ว่าง | ง่าย |
| I2C | 🚧 ว่าง | ยาก (multi-master, addressing) |
| CAN Bus | 🚧 ว่าง | ยากมาก |
| One-Wire | 🚧 ว่าง | ปานกลาง |

---

## 🎨 แนวทางการออกแบบ UI

### สีหลัก (ใช้ตลอดทั้งโปรเจกต์)
```css
--primary-color: #2563eb;    /* น้ำเงิน */
--success-color: #22c55e;    /* เขียว */
--error-color: #ef4444;      /* แดง */
--warning-color: #f59e0b;    /* ส้ม */
--bg-color: #f8fafc;         /* เทาอ่อน */
```

### สีสัญญาณใน Oscilloscope
- MOSI: `#3b82f6` (น้ำเงิน)
- MISO: `#22c55e` (เขียว)
- SCLK: `#8b5cf6` (ม่วง)
- SS: `#ef4444` (แดง)

### ขนาดหน้าจอ
- Desktop: max-width 1400px
- Tablet: ปรับ grid เป็น 1 column
- Mobile: ปรับ layout ให้ responsive

---

## 🔗 ลิงก์สำคัญ

- **Repository:** https://github.com/krutaopoon-prog/Embedded-System
- **GitHub Pages:** https://krutaopoon-prog.github.io/Embedded-System/
- **SPI Simulator:** https://krutaopoon-prog.github.io/Embedded-System/spi/

---

## 👤 ข้อมูลผู้ใช้

- **GitHub Username:** krutaopoon-prog
- **Email:** krutaopoon.prog@gmail.com
- **กลุ่มเป้าหมาย:** นักเรียน ปวส. (ประกาศนียบัตรวิชาชีพชั้นสูง)

---

## 💡 คำแนะนำสำหรับ AI ตัวถัดไป

1. **อ่านไฟล์นี้ก่อน** เพื่อเข้าใบบริบท
2. **ดูโครงสร้าง spi/** เป็น template
3. **รักษาความสม่ำเสมอ:** ใช้สี, font, layout แบบเดียวกัน
4. **เน้นภาษาไทย** สำหรับนักเรียน ปวส.
5. **ทดสอบบน GitHub Pages** หลัง push
6. **อัพเดท PROJECT_HISTORY.md** เมื่อทำงานเสร็จ

---

**สร้างเมื่อ:** 27 พฤษภาคม 2026  
**อัพเดทล่าสุด:** 27 พฤษภาคม 2026  
**สถานะ:** SPI พร้อมใช้งาน, รอพัฒนา UART/I2C/CAN Bus
