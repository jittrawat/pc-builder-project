-- เพิ่ม power_usage column กลับเข้าไปใน mainboard และ gpu

-- เพิ่มใน mainboard
ALTER TABLE mainboard 
ADD COLUMN power_usage INT DEFAULT NULL COMMENT 'Motherboard power consumption in Watts';

-- เพิ่มใน gpu
ALTER TABLE gpu 
ADD COLUMN power_usage INT DEFAULT NULL COMMENT 'GPU power consumption in Watts (TDP/TGP)';

-- อัปเดตข้อมูลตัวอย่าง (ถ้ามี)
UPDATE mainboard SET power_usage = 50 WHERE power_usage IS NULL;
UPDATE gpu SET power_usage = 200 WHERE power_usage IS NULL AND Device_Name LIKE '%RTX 4090%';
UPDATE gpu SET power_usage = 180 WHERE power_usage IS NULL AND Device_Name LIKE '%RTX 4080%';
UPDATE gpu SET power_usage = 150 WHERE power_usage IS NULL AND Device_Name LIKE '%RTX 4070%';
UPDATE gpu SET power_usage = 120 WHERE power_usage IS NULL AND Device_Name LIKE '%RTX 4060%';
UPDATE gpu SET power_usage = 100 WHERE power_usage IS NULL;

SELECT 'Migration completed successfully!' AS result;









