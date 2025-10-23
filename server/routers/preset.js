const express = require('express');
const router = express.Router();
const presetController = require('../controllers/presetController');
const auth = require('../middleware/auth');

// Admin routes (ต้องมาก่อน /:id)
router.get('/admin/all', auth, presetController.getAllForAdmin);
router.post('/', auth, presetController.create);
router.put('/:id/info', auth, presetController.updateInfo); // Update info only
router.put('/:id', auth, presetController.update); // Update with items
router.delete('/:id', auth, presetController.delete);

// Public routes
router.get('/', presetController.getAll);
router.get('/:id', presetController.getById);

module.exports = router;
