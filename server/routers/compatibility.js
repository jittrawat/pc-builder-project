const express = require('express');
const router = express.Router();
const db = require('../db');
const { checkAllCompatibility } = require('../utils/compatibilityChecker');

/**
 * POST /api/compatibility/check
 * ตรวจสอบความเข้ากันได้ของอุปกรณ์ทั้งหมด
 * 
 * Body: {
 *   cpu_id: number,
 *   motherboard_id: number,
 *   gpu_id: number,
 *   ram_id: number,
 *   ssd_id: number,
 *   hdd_id: number,
 *   case_id: number,
 *   cooler_id: number,
 *   power_id: number
 * }
 */
router.post('/check', async (req, res) => {
  try {
    const {
      cpu_id,
      motherboard_id,
      gpu_id,
      ram_id,
      ssd_id,
      hdd_id,
      case_id,
      cooler_id,
      power_id
    } = req.body;

    const components = {};

    // ดึงข้อมูล CPU
    if (cpu_id) {
      const [cpuRows] = await db.query(
        `SELECT d.Device_ID, d.Device_Name, d.price, d.image_url,
                c.socket, c.power_usage, c.details
         FROM device d 
         JOIN cpu c ON d.Device_ID = c.Device_ID 
         WHERE d.Device_ID = ?`,
        [cpu_id]
      );
      if (cpuRows.length > 0) {
        components.cpu = cpuRows[0];
      }
    }

    // ดึงข้อมูล Motherboard
    if (motherboard_id) {
      const [mbRows] = await db.query(
        `SELECT d.Device_ID, d.Device_Name, d.price, d.image_url,
                m.Socket_Sup, m.RAM_Sup, m.Case_Sup, m.PCIe_Sup, m.SSD_Sup, m.power_usage, m.details
         FROM device d 
         JOIN mainboard m ON d.Device_ID = m.Device_ID 
         WHERE d.Device_ID = ?`,
        [motherboard_id]
      );
      if (mbRows.length > 0) {
        components.motherboard = mbRows[0];
      }
    }

    // ดึงข้อมูล GPU
    if (gpu_id) {
      const [gpuRows] = await db.query(
        `SELECT d.Device_ID, d.Device_Name, d.price, d.image_url,
                g.PCIe_Type, g.Power_Req, g.Details
         FROM device d 
         JOIN gpu g ON d.Device_ID = g.Device_ID 
         WHERE d.Device_ID = ?`,
        [gpu_id]
      );
      if (gpuRows.length > 0) {
        components.gpu = gpuRows[0];
      }
    }

    // ดึงข้อมูล RAM
    if (ram_id) {
      const [ramRows] = await db.query(
        `SELECT d.Device_ID, d.Device_Name, d.price, d.image_url,
                r.Type_RAM, r.Details
         FROM device d 
         JOIN ram r ON d.Device_ID = r.Device_ID 
         WHERE d.Device_ID = ?`,
        [ram_id]
      );
      if (ramRows.length > 0) {
        components.ram = ramRows[0];
      }
    }

    // ดึงข้อมูล SSD
    if (ssd_id) {
      const [ssdRows] = await db.query(
        `SELECT d.Device_ID, d.Device_Name, d.price, d.image_url,
                s.SSD_Type, s.Details
         FROM device d 
         JOIN ssd s ON d.Device_ID = s.Device_ID 
         WHERE d.Device_ID = ?`,
        [ssd_id]
      );
      if (ssdRows.length > 0) {
        components.ssd = ssdRows[0];
      }
    }

    // ดึงข้อมูล HDD
    if (hdd_id) {
      const [hddRows] = await db.query(
        `SELECT d.Device_ID, d.Device_Name, d.price, d.image_url,
                h.Details
         FROM device d 
         JOIN harddisk h ON d.Device_ID = h.Device_ID 
         WHERE d.Device_ID = ?`,
        [hdd_id]
      );
      if (hddRows.length > 0) {
        components.hdd = hddRows[0];
      }
    }

    // ดึงข้อมูล Case
    if (case_id) {
      const [caseRows] = await db.query(
        `SELECT d.Device_ID, d.Device_Name, d.price, d.image_url,
                c.Size_Case, c.details
         FROM device d 
         JOIN pc_case c ON d.Device_ID = c.Device_ID 
         WHERE d.Device_ID = ?`,
        [case_id]
      );
      if (caseRows.length > 0) {
        components.case = caseRows[0];
      }
    }

    // ดึงข้อมูล Cooler
    if (cooler_id) {
      const [coolerRows] = await db.query(
        `SELECT d.Device_ID, d.Device_Name, d.price, d.image_url,
                c.Socket_Sup, c.details
         FROM device d 
         JOIN cooler c ON d.Device_ID = c.Device_ID 
         WHERE d.Device_ID = ?`,
        [cooler_id]
      );
      if (coolerRows.length > 0) {
        components.cooler = coolerRows[0];
      }
    }

    // ดึงข้อมูล Power Supply
    if (power_id) {
      const [powerRows] = await db.query(
        `SELECT d.Device_ID, d.Device_Name, d.price, d.image_url,
                p.Power_sup, p.Details
         FROM device d 
         JOIN power p ON d.Device_ID = p.Device_ID 
         WHERE d.Device_ID = ?`,
        [power_id]
      );
      if (powerRows.length > 0) {
        components.power = powerRows[0];
      }
    }

    // ตรวจสอบความเข้ากันได้
    const compatibilityResult = checkAllCompatibility(components);

    res.json({
      success: true,
      ...compatibilityResult
    });

  } catch (error) {
    console.error('Error checking compatibility:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการตรวจสอบความเข้ากันได้',
      error: error.message
    });
  }
});

module.exports = router;
