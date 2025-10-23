const express = require('express');
const router = express.Router();
const { uploadImage, deleteImage } = require('../controllers/uploadController');
const auth = require('../middleware/auth');

// อัพโหลดรูปภาพ (ต้อง login)
router.post('/', auth, uploadImage);

// ลบรูปภาพ (ต้อง login)
router.delete('/:filename', auth, deleteImage);

module.exports = router;