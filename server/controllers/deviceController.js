const db = require('../db');

/**
 * GET /api/device
 * คืนข้อมูล device ทั้งหมด with Pagination
 */
exports.getAllDevices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM device`);
    const total = countResult[0].total;

    const [rows] = await db.query('SELECT * FROM device ORDER BY Device_ID DESC LIMIT ? OFFSET ?', [limit, offset]);

    res.json({
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/device/:id
 * คืนข้อมูล device ตาม Device_ID
 */
exports.getDeviceById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM device WHERE Device_ID = ?',
      [req.params.id]
    );
    res.json(rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/device
 * สร้าง device ใหม่
 * body: { Device_Name, price, image_url }
 */
exports.createDevice = async (req, res) => {
  try {
    const { Device_Name, price, image_url } = req.body || {};
    if (!Device_Name || price == null) {
      return res.status(400).json({ error: 'Device_Name และ price จำเป็น' });
    }
    const [result] = await db.query(
      'INSERT INTO device (Device_Name, price, image_url) VALUES (?, ?, ?)',
      [Device_Name, price, image_url || null]
    );
    const [rows] = await db.query(
      'SELECT * FROM device WHERE Device_ID = ?',
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * PUT /api/device/:id
 * อัปเดต device ที่มีอยู่
 * body: { Device_Name, price, image_url }
 */
exports.updateDevice = async (req, res) => {
  try {
    const { Device_Name, price, image_url } = req.body || {};
    const id = req.params.id;

    // ดึงค่าเดิม
    const [currRows] = await db.query(
      'SELECT * FROM device WHERE Device_ID = ?',
      [id]
    );
    const current = currRows[0];
    if (!current) {
      return res.status(404).json({ error: 'ไม่พบอุปกรณ์' });
    }

    const nextName = Device_Name ?? current.Device_Name;
    const nextPrice = price ?? current.price;
    const nextImg = image_url ?? current.image_url;

    await db.query(
      'UPDATE device SET Device_Name=?, price=?, image_url=? WHERE Device_ID=?',
      [nextName, nextPrice, nextImg, id]
    );
    const [rows] = await db.query('SELECT * FROM device WHERE Device_ID=?', [id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * DELETE /api/device/:id
 * ลบ device ตาม Device_ID
 */
exports.deleteDevice = async (req, res) => {
  try {
    await db.query('DELETE FROM device WHERE Device_ID=?', [req.params.id]);
    res.json({ message: 'Device deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
