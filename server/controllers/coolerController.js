const db = require('../db');

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM cooler`);
    const total = countResult[0].total;

    const [rows] = await db.query(`
      SELECT
        c.Cooler_ID,
        d.Device_ID, d.Device_Name, d.price, d.image_url,
        c.Socket_Sup, c.details
      FROM cooler c
      JOIN device d ON c.Device_ID = d.Device_ID
      ORDER BY c.Cooler_ID DESC
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


// CREATE Cooler
exports.create = async (req, res) => {
  const { device_name, price, image_url, Socket_Sup, details } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      'INSERT INTO device (Device_Name, price, image_url) VALUES (?, ?, ?)',
      [device_name, price, image_url]
    );
    const deviceId = result.insertId;

    await conn.query(
      'INSERT INTO cooler (Device_ID, Socket_Sup, details) VALUES (?, ?, ?)',
      [deviceId, Socket_Sup, details]
    );

    await conn.commit();
    res.status(201).json({ message: 'Cooler added successfully', device_id: deviceId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally { conn.release(); }
};

// UPDATE Cooler
exports.update = async (req, res) => {
  const { device_name, price, image_url, Socket_Sup, details } = req.body;
  const { id } = req.params;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query('UPDATE device SET Device_Name=?, price=?, image_url=? WHERE Device_ID=?',
      [device_name, price, image_url, id]);

    await conn.query(
      'UPDATE cooler SET Socket_Sup=?, details=? WHERE Device_ID=?',
      [Socket_Sup, details, id]
    );

    await conn.commit();
    res.json({ message: 'Cooler updated successfully' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally { conn.release(); }
};

// DELETE Cooler
exports.delete = async (req, res) => {
  const { id } = req.params;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM cooler WHERE Device_ID=?', [id]);
    await conn.query('DELETE FROM device WHERE Device_ID=?', [id]);
    await conn.commit();
    res.json({ message: 'Cooler deleted successfully' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally { conn.release(); }
};
