-- เพิ่ม column Power_CPU ในตาราง cooler
ALTER TABLE cooler 
ADD COLUMN Power_CPU INT(11) DEFAULT NULL 
COMMENT 'Maximum CPU TDP supported (Watts)';

-- อัพเดตข้อมูลเก่า (ถ้ามี) ให้เป็นค่าเริ่มต้น 220W (ซึ่งเป็นค่า TDP ทั่วไป)
UPDATE cooler 
SET Power_CPU = 220 
WHERE Power_CPU IS NULL;





