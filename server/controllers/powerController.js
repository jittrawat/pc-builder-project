const db = require('../db');

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM power`);
    const total = countResult[0].total;

    const [rows] = await db.query(`
      SELECT
        p.Power_ID,
        d.Device_ID, d.Device_Name, d.price, d.image_url,
        p.Power_sup, p.Details as details
      FROM power p
      JOIN device d ON p.Device_ID = d.Device_ID
      ORDER BY p.Power_ID DESC
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


// CREATE PSU
exports.create = async (req, res) => {
  const { device_name, price, image_url, power_sup, details } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      'INSERT INTO device (Device_Name, price, image_url) VALUES (?, ?, ?)',
      [device_name, price, image_url]
    );
    const deviceId = result.insertId;

    await conn.query(
      'INSERT INTO power (Device_ID, power_sup, details) VALUES (?, ?, ?)',
      [deviceId, power_sup, details]
    );

    await conn.commit();
    res.status(201).json({ message: 'PSU added successfully', device_id: deviceId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally { conn.release(); }
};

// UPDATE PSU
exports.update = async (req, res) => {
  const { device_name, price, image_url, power_sup, details } = req.body;
  const { id } = req.params;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query('UPDATE device SET Device_Name=?, price=?, image_url=? WHERE Device_ID=?',
      [device_name, price, image_url, id]);

    await conn.query(
      'UPDATE power SET power_sup=?, details=? WHERE Device_ID=?',
      [power_sup, details, id]
    );

    await conn.commit();
    res.json({ message: 'PSU updated successfully' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally { conn.release(); }
};

// DELETE PSU
exports.delete = async (req, res) => {
  const { id } = req.params;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM power WHERE Device_ID=?', [id]);
    await conn.query('DELETE FROM device WHERE Device_ID=?', [id]);
    await conn.commit();
    res.json({ message: 'PSU deleted successfully' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally { conn.release(); }
};
