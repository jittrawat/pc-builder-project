const db = require('../db');

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM harddisk`);
    const total = countResult[0].total;

    const [rows] = await db.query(`
      SELECT
        h.Harddisk_ID,
        d.Device_ID, d.Device_Name, d.price, d.image_url,
        h.Details as details
      FROM harddisk h
      JOIN device d ON h.Device_ID = d.Device_ID
      ORDER BY h.Harddisk_ID DESC
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


// CREATE HDD
exports.create = async (req, res) => {
  const { device_name, price, image_url, details } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      'INSERT INTO device (Device_Name, price, image_url) VALUES (?, ?, ?)',
      [device_name, price, image_url]
    );
    const deviceId = result.insertId;

    await conn.query(
      'INSERT INTO harddisk (Device_ID, details) VALUES (?, ?)',
      [deviceId, details]
    );

    await conn.commit();
    res.status(201).json({ message: 'HDD added successfully', device_id: deviceId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally { conn.release(); }
};

// UPDATE HDD
exports.update = async (req, res) => {
  const { device_name, price, image_url, details } = req.body;
  const { id } = req.params;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query('UPDATE device SET Device_Name=?, price=?, image_url=? WHERE Device_ID=?',
      [device_name, price, image_url, id]);

    await conn.query(
      'UPDATE harddisk SET details=? WHERE Device_ID=?',
      [details, id]
    );

    await conn.commit();
    res.json({ message: 'HDD updated successfully' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally { conn.release(); }
};

// DELETE HDD
exports.delete = async (req, res) => {
  const { id } = req.params;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM harddisk WHERE Device_ID=?', [id]);
    await conn.query('DELETE FROM device WHERE Device_ID=?', [id]);
    await conn.commit();
    res.json({ message: 'HDD deleted successfully' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally { conn.release(); }
};
