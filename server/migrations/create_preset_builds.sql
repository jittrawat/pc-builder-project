-- สร้างตาราง preset_builds (ชุดสเปคที่แอดมินสร้าง)
CREATE TABLE IF NOT EXISTS `preset_builds` (
  `preset_id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL COMMENT 'ชื่อชุดสเปค',
  `description` TEXT COMMENT 'คำอธิบายชุดสเปค',
  `category` VARCHAR(100) COMMENT 'หมวดหมู่',
  `thumbnail_url` VARCHAR(500) COMMENT 'รูปภาพหน้าปก',
  `total_price` DECIMAL(10, 2) DEFAULT 0 COMMENT 'ราคารวม',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT '1=แสดง, 0=ซ่อน',
  `display_order` INT DEFAULT 0 COMMENT 'ลำดับการแสดงผล',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (`category`),
  INDEX idx_active (`is_active`),
  INDEX idx_order (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- สร้างตาราง preset_build_items (อุปกรณ์ในแต่ละชุดสเปค)
CREATE TABLE IF NOT EXISTS `preset_build_items` (
  `item_id` INT AUTO_INCREMENT PRIMARY KEY,
  `preset_id` INT NOT NULL COMMENT 'FK ไปยัง preset_builds',
  `device_id` INT NOT NULL COMMENT 'FK ไปยัง device',
  `component_type` VARCHAR(50) NOT NULL COMMENT 'ประเภทอุปกรณ์',
  `quantity` INT DEFAULT 1 COMMENT 'จำนวน',
  `price_at_time` DECIMAL(10, 2) COMMENT 'ราคาขณะที่เพิ่ม',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`preset_id`) REFERENCES `preset_builds`(`preset_id`) ON DELETE CASCADE,
  FOREIGN KEY (`device_id`) REFERENCES `device`(`Device_ID`) ON DELETE CASCADE,
  INDEX idx_preset (`preset_id`),
  INDEX idx_device (`device_id`),
  INDEX idx_component (`component_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;