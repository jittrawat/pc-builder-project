// routers/auth.js
const express = require('express');
const router = express.Router();

const authCtrl = require('../controllers/authController'); // ← ต้องชี้ถูกไฟล์
const auth = require('../middleware/auth');

// ถ้าบรรทัดนี้พิมพ์ Object.keys แล้วว่าง แปลว่า export ไม่ถูก
// console.log('[auth router] controller keys:', Object.keys(authCtrl));

router.post('/register', authCtrl.register);
router.post('/login', authCtrl.login);
router.get('/me', auth, authCtrl.me);

module.exports = router;
