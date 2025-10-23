# สคริปต์ตรวจสอบและแก้ไข Orphaned Records

## ปัญหา
เมื่อมี records ในตาราง component (cpu, gpu, mainboard, etc.) ที่มี `Device_ID` ที่ไม่มีอยู่ในตาราง `device` อุปกรณ์เหล่านั้นจะไม่แสดงในหน้าเว็บเพราะ API ใช้ `INNER JOIN`

## วิธีใช้งาน

### 1. โหมด Interactive (แนะนำสำหรับครั้งแรก)
```bash
cd server
node scripts/checkAndFixOrphanedRecords.js
```

สคริปต์จะ:
- ตรวจสอบ orphaned records ในทุกตาราง
- แสดงรายงานผลที่พบ
- ให้เลือกว่าจะแก้ไขอย่างไร:
  - **ตัวเลือก 1: ลบ orphaned records** (แนะนำถ้าข้อมูลไม่สำคัญ)
  - **ตัวเลือก 2: สร้าง device records ที่ขาดหาย** (ถ้าต้องการเก็บข้อมูล)
  - **ตัวเลือก 3: ไม่ทำอะไร** (เพียงแค่ดูรายงาน)

### 2. โหมดตรวจสอบอย่างเดียว
```bash
node scripts/checkAndFixOrphanedRecords.js --check-only
```
แค่ตรวจสอบและรายงานผล ไม่แก้ไขอะไร

### 3. โหมดลบอัตโนมัติ
```bash
node scripts/checkAndFixOrphanedRecords.js --auto-delete
```
ลบ orphaned records ทั้งหมดทันที (ไม่มี confirmation)

### 4. โหมดสร้างอัตโนมัติ
```bash
node scripts/checkAndFixOrphanedRecords.js --auto-create
```
สร้าง device records placeholder สำหรับ orphaned records ทั้งหมด

## ตัวอย่างผลลัพธ์

```
============================================================
  ตรวจสอบและแก้ไข Orphaned Records
============================================================

🔍 กำลังตรวจสอบ orphaned records...

✅ ตาราง CPU: ไม่พบ orphaned records
❌ ตาราง GPU: พบ 3 orphaned records
   - GPU_ID: 45, Device_ID: 150
   - GPU_ID: 46, Device_ID: 151
   - GPU_ID: 47, Device_ID: 152
✅ ตาราง MAINBOARD: ไม่พบ orphaned records
...

📊 สรุป: พบ orphaned records ทั้งหมด 3 records

ตัวเลือกการแก้ไข:
  1. ลบ orphaned records (แนะนำ)
  2. สร้าง device records ที่ขาดหาย
  3. ไม่ทำอะไร

เลือกการดำเนินการ (1/2/3):
```

## คำแนะนำ

### ควรเลือกแบบไหน?

**เลือก 1 (ลบ)** เมื่อ:
- ข้อมูลที่หายไปไม่สำคัญ
- เป็นข้อมูลทดสอบหรือข้อมูลเก่า
- ต้องการความสะอาดของฐานข้อมูล

**เลือก 2 (สร้าง)** เมื่อ:
- ต้องการเก็บข้อมูล spec ของอุปกรณ์ไว้
- สามารถกลับมาแก้ไขชื่อและราคาทีหลังได้
- ข้อมูลเหล่านี้มีค่า

**เลือก 3 (ไม่ทำอะไร)** เมื่อ:
- ต้องการแค่ดูรายงานก่อน
- จะตัดสินใจทีหลัง
- ต้องการ backup ฐานข้อมูลก่อน

## หลังแก้ไขแล้ว

หลังจากแก้ไขเสร็จ:
1. Restart server (ถ้ากำลังรันอยู่)
2. ทดสอบเว็บไซต์ดูว่าอุปกรณ์แสดงครบหรือยัง
3. ถ้าเลือกตัวเลือก 2 (สร้าง device records) ควรเข้าไปแก้ไขชื่อและราคาในหน้า Admin

## ป้องกันปัญหาในอนาคต

แนะนำให้เพิ่ม Foreign Key Constraints ในฐานข้อมูล:

```sql
ALTER TABLE cpu 
ADD CONSTRAINT fk_cpu_device 
FOREIGN KEY (Device_ID) REFERENCES device(Device_ID) 
ON DELETE CASCADE;

-- ทำเหมือนกันกับตารางอื่นๆ
```

หรือตรวจสอบสคริปต์ import ให้แน่ใจว่าสร้าง device record ก่อนเสมอ





