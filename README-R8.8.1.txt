V0.5.22.147-R8.8.1 — Mission Popup Visual Upgrade

ฐาน: R8.8 Mission Round + Chibi Welcome Popup

สิ่งที่เปลี่ยนจาก R8.8
- เปลี่ยนภาพจิบิเป็นไฟล์โปร่งใสแบบเต็มตัว ไม่ครอป
- สร้างฉากหลังของ popup ด้วย HTML/CSS แทนการฝังฉากในภาพ
- เพิ่มพื้นหลังท้องฟ้า/ชุมชน, badge กระทุ่มแบนไปด้วยกัน, decorative confetti
- ข้อความกลาง ใช้ซ้ำได้ทุก Mission ไม่ต้องแก้ภาพทุกครั้ง
- ปุ่ม "ดู Mission และเริ่มเลย" ใหญ่และเหมาะกับมือถือ
- Responsive สำหรับหน้าจอมือถือเตี้ย/เล็ก
- Popup ยังแสดงครั้งเดียวต่อ Mission Round เหมือน R8.8

ไฟล์เว็บ
- app.js (logic R8.8 เดิม ไม่ได้แก้ใน R8.8.1)
- index.html
- styles.css
- mission-chibi-art-v2.png

SQL
- upgrade-v0.5.22.147-R8.8-mission-rounds.sql (SQL เดิมของ R8.8)

วิธีติดตั้ง
กรณียังไม่เคยติดตั้ง R8.8:
1) Run upgrade-v0.5.22.147-R8.8-mission-rounds.sql ใน Supabase SQL Editor
2) Upload app.js, index.html, styles.css, mission-chibi-art-v2.png
3) Commit แล้วเปิดเว็บใหม่

กรณีเคยติดตั้ง/Run SQL R8.8 แล้ว:
- ไม่ต้อง Run SQL ซ้ำ
- Upload index.html, styles.css, mission-chibi-art-v2.png เท่านั้น
- app.js ใช้ของ R8.8 เดิมได้

ไม่มีการแก้ Order / Delivery / Rider / Push / Realtime / Review / Account Deletion
