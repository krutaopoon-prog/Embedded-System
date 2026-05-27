# 🔧 Embedded System Simulators

เครื่องมือจำลองการทำงานโปรโตคอลต่างๆ ในระบบ Embedded สำหรับนักเรียนระดับ ปวส.

## 📁 โครงสร้างโปรเจกต์

```
embedded-system/
├── 📂 spi/          # SPI Protocol Simulator
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── README.md
│
├── 📂 uart/         # UART Protocol Simulator (Coming Soon)
│   └── ...
│
└── README.md        # ไฟล์นี้
```

## 🎯 จุดมุ่งหมาย

รวบรวมเครื่องมือจำลองการทำงานของโปรโตคอลต่างๆ ในระบบ Embedded เพื่อใช้เป็นสื่อการสอนสำหรับนักเรียน **ปวส.** (ประกาศนียบัตรวิชาชีพชั้นสูง)

## 📚 Simulators ที่มี

| โปรโตคอล | สถานะ | ลิงก์ |
|-----------|-------|-------|
| 🔌 **SPI** | ✅ พร้อมใช้งาน | [เข้าชม](./spi/index.html) |
| 🔗 **UART** | 🚧 อยู่ระหว่างพัฒนา | - |

## 🚀 วิธีใช้งาน

### แบบ Local

```bash
# เข้าไปในโฟลเดอร์โปรโตคอลที่ต้องการ
cd spi

# เปิดด้วยเว็บบราวเซอร์ หรือใช้ Live Server
start index.html
```

### Deploy บน GitHub Pages

1. Push โค้ดขึ้น GitHub
2. ไปที่ **Settings** → **Pages**
3. เลือก Branch และ Folder ที่ต้องการ
4. คลิก **Save**

## 🛠️ เทคโนโลยีที่ใช้

- **HTML5** - โครงสร้างหน้าเว็บ
- **CSS3** - Styling และ Animation
- **Vanilla JavaScript** - Logic การทำงาน
- **Canvas API** - วาด waveform

## 👥 กลุ่มเป้าหมาย

- 🎓 นักเรียน ปวส. (ประกาศนียบัตรวิชาชีพชั้นสูง)
- 🎓 นักศึกษาปริญญาตรีสาขาไฟฟ้า/อิเล็กทรอนิกส์
- 🎓 ผู้เริ่มต้นเรียนรู้ Embedded Systems

## 📖 โปรโตคอลที่วางแผนไว้

- [x] SPI (Serial Peripheral Interface)
- [ ] UART (Universal Asynchronous Receiver-Transmitter)
- [ ] I2C (Inter-Integrated Circuit)
- [ ] CAN Bus
- [ ] One-Wire

## 🤝 การมีส่วนร่วม

ยินดีรับ Pull Request หรือ Issue สำหรับการปรับปรุงและเพิ่มฟีเจอร์ใหม่ๆ

## 📄 License

โปรเจกต์นี้เป็น **Open Source** ใช้งานได้ฟรีเพื่อการศึกษา

---

**สร้างด้วย ❤️ สำหรับนักเรียน ปวส.**
