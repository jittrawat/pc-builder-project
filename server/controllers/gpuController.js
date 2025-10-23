const db = require('../db');

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM gpu`);
    const total = countResult[0].total;

    const [rows] = await db.query(`
      SELECT
        g.GPU_ID,
        d.Device_ID, d.Device_Name, d.price, d.image_url,
        g.PCIe_Type, g.Power_Req, g.Power_Req AS power_usage, g.Details as details
      FROM gpu g
      JOIN device d ON g.Device_ID = d.Device_ID
      ORDER BY g.GPU_ID DESC
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

// CREATE GPU
exports.create = async (req, res) => {
  const { device_name, price, image_url, PCIe_Type, Power_Req, details } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      'INSERT INTO device (Device_Name, price, image_url) VALUES (?, ?, ?)',
      [device_name, price, image_url]
    );
    const deviceId = result.insertId;

    await conn.query(
      'INSERT INTO gpu (Device_ID, PCIe_Type, Power_Req, details) VALUES (?, ?, ?, ?)',
      [deviceId, PCIe_Type, Power_Req, details]
    );

    await conn.commit();
    res.status(201).json({ message: 'GPU added successfully', device_id: deviceId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

// UPDATE GPU
exports.update = async (req, res) => {
  const { device_name, price, image_url, PCIe_Type, Power_Req, details } = req.body;
  const { id } = req.params;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query('UPDATE device SET Device_Name=?, price=?, image_url=? WHERE Device_ID=?',
      [device_name, price, image_url, id]);

    await conn.query(
      'UPDATE gpu SET PCIe_Type=?, Power_Req=?, details=? WHERE Device_ID=?',
      [PCIe_Type, Power_Req, details, id]
    );

    await conn.commit();
    res.json({ message: 'GPU updated successfully' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

// DELETE GPU
exports.delete = async (req, res) => {
  const { id } = req.params;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM gpu WHERE Device_ID=?', [id]);
    await conn.query('DELETE FROM device WHERE Device_ID=?', [id]);
    await conn.commit();
    res.json({ message: 'GPU deleted successfully' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};
