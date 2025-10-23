const multer = require('multer');
const path = require('path');
const fs = require('fs');

// สร้างโฟลเดอร์ uploads ถ้ายังไม่มี
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// กำหนดการตั้งค่า multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // สร้างชื่อไฟล์ที่ไม่ซ้ำกัน
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// กำหนดประเภทไฟล์ที่อนุญาต
const fileFilter = (req, file, cb) => {
  // อนุญาตเฉพาะไฟล์รูปภาพ
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('อนุญาตเฉพาะไฟล์รูปภาพเท่านั้น'), false);
  }
};

// สร้าง multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // จำกัดขนาดไฟล์ 5MB
  }
});

// Middleware สำหรับอัพโหลดไฟล์เดียว
const uploadSingle = upload.single('file');

// Controller สำหรับอัพโหลดรูปภาพ
const uploadImage = (req, res) => {
  uploadSingle(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({
        success: false,
        error: err.message || 'เกิดข้อผิดพลาดในการอัพโหลดไฟล์'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'ไม่พบไฟล์ที่อัพโหลด'
      });
    }

    // ส่งกลับ URL ของไฟล์ที่อัพโหลด
    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  });
};

// Controller สำหรับลบไฟล์
const deleteImage = (req, res) => {
  const { filename } = req.params;
  
  if (!filename) {
    return res.status(400).json({
      success: false,
      error: 'ไม่พบชื่อไฟล์'
    });
  }

  const filePath = path.join(uploadDir, filename);
  
  // ตรวจสอบว่าไฟล์มีอยู่จริง
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      error: 'ไม่พบไฟล์ที่ต้องการลบ'
    });
  }

  try {
    // ลบไฟล์
    fs.unlinkSync(filePath);
    res.json({
      success: true,
      message: 'ลบไฟล์เรียบร้อยแล้ว'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการลบไฟล์'
    });
  }
};

module.exports = {
  uploadImage,
  deleteImage,
  upload // export multer instance สำหรับใช้ใน router
};