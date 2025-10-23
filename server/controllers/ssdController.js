const db = require('../db');

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM ssd`);
    const total = countResult[0].total;

    const [rows] = await db.query(`
      SELECT
        s.SSD_ID,
        d.Device_ID, d.Device_Name, d.price, d.image_url,
        s.SSD_Type, s.Details as details
      FROM ssd s
      JOIN device d ON s.Device_ID = d.Device_ID
      ORDER BY s.SSD_ID DESC
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


// CREATE SSD
exports.create = async (req, res) => {
  const { device_name, price, image_url, SSD_Type, details } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      'INSERT INTO device (Device_Name, price, image_url) VALUES (?, ?, ?)',
      [device_name, price, image_url]
    );
    const deviceId = result.insertId;

    await conn.query(
      'INSERT INTO ssd (Device_ID, SSD_Type, details) VALUES (?, ?, ?)',
      [deviceId, SSD_Type, details]
    );

    await conn.commit();
    res.status(201).json({ message: 'SSD added successfully', device_id: deviceId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally { conn.release(); }
};

// UPDATE SSD
exports.update = async (req, res) => {
  const { device_name, price, image_url, SSD_Type, details } = req.body;
  const { id } = req.params;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query('UPDATE device SET Device_Name=?, price=?, image_url=? WHERE Device_ID=?',
      [device_name, price, image_url, id]);

    await conn.query(
      'UPDATE ssd SET SSD_Type=?, details=? WHERE Device_ID=?',
      [SSD_Type, details, id]
    );

    await conn.commit();
    res.json({ message: 'SSD updated successfully' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally { conn.release(); }
};

// DELETE SSD
exports.delete = async (req, res) => {
  const { id } = req.params;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM ssd WHERE Device_ID=?', [id]);
    await conn.query('DELETE FROM device WHERE Device_ID=?', [id]);
    await conn.commit();
    res.json({ message: 'SSD deleted successfully' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally { conn.release(); }
};
