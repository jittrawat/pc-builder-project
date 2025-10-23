const db = require('../db');

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM mainboard`);
    const total = countResult[0].total;

    const [rows] = await db.query(`
      SELECT
        m.\`mainboard_ID\` AS mainboard_ID,
        d.\`Device_ID\`    AS Device_ID,
        d.\`Device_Name\`  AS Device_Name,
        d.\`price\`        AS price,
        d.\`image_url\`    AS image_url,
        m.\`Socket_Sup\`   AS Socket_Sup,
        m.\`RAM_Sup\`      AS RAM_Sup,
        m.\`Case_Sup\`     AS Case_Sup,
        m.\`PCIe_Sup\`     AS PCIe_Sup,
        m.\`SSD_Sup\`      AS SSD_Sup,
        m.\`power_usage\`  AS power_usage,
        m.\`details\`      AS details
      FROM \`mainboard\` AS m
      JOIN \`device\`    AS d ON m.\`Device_ID\` = d.\`Device_ID\`
      ORDER BY m.\`mainboard_ID\` DESC
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




exports.create = async (req, res) => {
  const { device_name, price, image_url, Socket_Sup, RAM_Sup, Case_Sup, PCIe_Sup, SSD_Sup, power_usage, details } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      'INSERT INTO device (Device_Name, price, image_url) VALUES (?, ?, ?)',
      [device_name, price, image_url]
    );
    const deviceId = result.insertId;
    await conn.query(
      'INSERT INTO mainboard (Device_ID, Socket_Sup, RAM_Sup, Case_Sup, PCIe_Sup, SSD_Sup, power_usage, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [deviceId, Socket_Sup, RAM_Sup, Case_Sup, PCIe_Sup, SSD_Sup, power_usage, details]
    );
    await conn.commit();
    res.status(201).json({ message: 'Mainboard added successfully', device_id: deviceId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally { conn.release(); }
};

exports.update = async (req, res) => {
  const { device_name, price, image_url, Socket_Sup, RAM_Sup, Case_Sup, PCIe_Sup, SSD_Sup, power_usage, details } = req.body;
  const { id } = req.params;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('UPDATE device SET Device_Name=?, price=?, image_url=? WHERE Device_ID=?',
      [device_name, price, image_url, id]);
    await conn.query(
      'UPDATE mainboard SET Socket_Sup=?, RAM_Sup=?, Case_Sup=?, PCIe_Sup=?, SSD_Sup=?, power_usage=?, details=? WHERE Device_ID=?',
      [Socket_Sup, RAM_Sup, Case_Sup, PCIe_Sup, SSD_Sup, power_usage, details, id]
    );
    await conn.commit();
    res.json({ message: 'Mainboard updated successfully' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally { conn.release(); }
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM mainboard WHERE Device_ID=?', [id]);
    await conn.query('DELETE FROM device WHERE Device_ID=?', [id]);
    await conn.commit();
    res.json({ message: 'Mainboard deleted successfully' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally { conn.release(); }
};
