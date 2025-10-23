const db = require('../db');

// GET CPU with Pagination
exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    // Get total count
    const [countResult] = await db.query(`
      SELECT COUNT(*) as total FROM cpu
    `);
    const total = countResult[0].total;

    // Get paginated data
    const [rows] = await db.query(`
      SELECT
        c.CPU_ID,
        d.Device_ID, d.Device_Name, d.price, d.image_url,
        c.socket, c.power_usage, c.details
      FROM cpu c
      JOIN device d ON c.Device_ID = d.Device_ID
      ORDER BY c.CPU_ID DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    res.json({
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
// CREATE CPU
exports.create = async (req, res) => {
  const { device_name, price, image_url, socket, power_usage, details } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      'INSERT INTO device (Device_Name, price, image_url) VALUES (?, ?, ?)',
      [device_name, price, image_url]
    );
    const deviceId = result.insertId;
    await conn.query(
      'INSERT INTO cpu (Device_ID, socket, power_usage, details) VALUES (?, ?, ?, ?)',
      [deviceId, socket, power_usage, details]
    );
    await conn.commit();
    res.status(201).json({ message: 'CPU added successfully', device_id: deviceId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally { conn.release(); }
};

// UPDATE CPU
exports.update = async (req, res) => {
  const { device_name, price, image_url, socket, power_usage, details } = req.body;
  const { id } = req.params;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('UPDATE device SET Device_Name=?, price=?, image_url=? WHERE Device_ID=?',
      [device_name, price, image_url, id]);
    await conn.query('UPDATE cpu SET socket=?, power_usage=?, details=? WHERE Device_ID=?',
      [socket, power_usage, details, id]);
    await conn.commit();
    res.json({ message: 'CPU updated successfully' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally { conn.release(); }
};

// DELETE CPU
exports.delete = async (req, res) => {
  const { id } = req.params;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM cpu WHERE Device_ID=?', [id]);
    await conn.query('DELETE FROM device WHERE Device_ID=?', [id]);
    await conn.commit();
    res.json({ message: 'CPU deleted successfully' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally { conn.release(); }
};
