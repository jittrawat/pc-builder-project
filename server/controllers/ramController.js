const db = require('../db');

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM ram`);
    const total = countResult[0].total;

    const [rows] = await db.query(`
      SELECT
        r.RAM_ID,
        d.Device_ID, d.Device_Name, d.price, d.image_url,
        r.Type_RAM, r.Details as details
      FROM ram r
      JOIN device d ON r.Device_ID = d.Device_ID
      ORDER BY r.RAM_ID DESC
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


// CREATE RAM
exports.create = async (req, res) => {
  const { device_name, price, image_url, Type_RAM, details } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      'INSERT INTO device (Device_Name, price, image_url) VALUES (?, ?, ?)',
      [device_name, price, image_url]
    );
    const deviceId = result.insertId;

    await conn.query(
      'INSERT INTO ram (Device_ID, Type_RAM, details) VALUES (?, ?, ?)',
      [deviceId, Type_RAM, details]
    );

    await conn.commit();
    res.status(201).json({ message: 'RAM added successfully', device_id: deviceId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

// UPDATE RAM
exports.update = async (req, res) => {
  const { device_name, price, image_url, Type_RAM, details } = req.body;
  const { id } = req.params;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query('UPDATE device SET Device_Name=?, price=?, image_url=? WHERE Device_ID=?',
      [device_name, price, image_url, id]);

    await conn.query(
      'UPDATE ram SET Type_RAM=?, details=? WHERE Device_ID=?',
      [Type_RAM, details, id]
    );

    await conn.commit();
    res.json({ message: 'RAM updated successfully' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

// DELETE RAM
exports.delete = async (req, res) => {
  const { id } = req.params;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM ram WHERE Device_ID=?', [id]);
    await conn.query('DELETE FROM device WHERE Device_ID=?', [id]);
    await conn.commit();
    res.json({ message: 'RAM deleted successfully' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};
