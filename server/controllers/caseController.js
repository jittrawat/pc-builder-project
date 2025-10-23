const db = require('../db');

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM pc_case`);
    const total = countResult[0].total;

    const [rows] = await db.query(`
      SELECT
        cs.\`case_ID\`     AS case_ID,
        d.\`Device_ID\`    AS Device_ID,
        d.\`Device_Name\`  AS Device_Name,
        d.\`price\`        AS price,
        d.\`image_url\`    AS image_url,
        cs.\`Size_Case\`   AS Size_Case,
        cs.\`details\`     AS details
      FROM \`pc_case\` AS cs
      JOIN \`device\`  AS d ON cs.\`Device_ID\` = d.\`Device_ID\`
      ORDER BY cs.\`case_ID\` DESC
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};





// CREATE Case
exports.create = async (req, res) => {
  const { device_name, price, image_url, Size_Case, details } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      'INSERT INTO device (Device_Name, price, image_url) VALUES (?, ?, ?)',
      [device_name, price, image_url]
    );
    const deviceId = result.insertId;

    await conn.query(
      'INSERT INTO pc_case (Device_ID, Size_Case, details) VALUES (?, ?, ?)',
      [deviceId, Size_Case, details]
    );

    await conn.commit();
    res.status(201).json({ message: 'Case added successfully', device_id: deviceId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

// UPDATE Case
exports.update = async (req, res) => {
  const { device_name, price, image_url, Size_Case, details } = req.body;
  const { id } = req.params;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query('UPDATE device SET Device_Name=?, price=?, image_url=? WHERE Device_ID=?',
      [device_name, price, image_url, id]);

    await conn.query(
      'UPDATE pc_case SET Size_Case=?, details=? WHERE Device_ID=?',
      [Size_Case, details, id]
    );

    await conn.commit();
    res.json({ message: 'Case updated successfully' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

// DELETE Case
exports.delete = async (req, res) => {
  const { id } = req.params;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM pc_case WHERE Device_ID=?', [id]);
    await conn.query('DELETE FROM device WHERE Device_ID=?', [id]);
    await conn.commit();
    res.json({ message: 'Case deleted successfully' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};
