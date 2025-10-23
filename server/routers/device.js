const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

// GET all devices
router.get('/', deviceController.getAllDevices);

// GET device by ID
router.get('/:id', deviceController.getDeviceById);

// CREATE new device
router.post('/', deviceController.createDevice);

// UPDATE device
router.put('/:id', deviceController.updateDevice);

// DELETE device
router.delete('/:id', deviceController.deleteDevice);

module.exports = router;
