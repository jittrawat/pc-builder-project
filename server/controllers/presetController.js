const db = require('../db');

// GET all preset builds (สำหรับหน้าแสดงรายการ)
exports.getAll = async (req, res) => {
  try {
    const [presets] = await db.query(`
      SELECT 
        p.*,
        COUNT(DISTINCT pi.item_id) as item_count
      FROM preset_builds p
      LEFT JOIN preset_build_items pi ON p.preset_id = pi.preset_id
      WHERE p.is_active = 1
      GROUP BY p.preset_id
      ORDER BY p.created_at DESC
    `);
    res.json(presets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET preset by ID with all items (สำหรับหน้ารายละเอียด)
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get preset info
    const [presets] = await db.query(
      'SELECT * FROM preset_builds WHERE preset_id = ?',
      [id]
    );
    
    if (presets.length === 0) {
      return res.status(404).json({ error: 'Preset not found' });
    }
    
    const preset = presets[0];
    
    // Get all items in this preset with device details
    const [items] = await db.query(`
      SELECT 
        pi.*,
        d.Device_Name,
        d.price as current_price,
        d.image_url
      FROM preset_build_items pi
      JOIN device d ON pi.device_id = d.Device_ID
      WHERE pi.preset_id = ?
      ORDER BY 
        FIELD(pi.component_type, 'cpu', 'mainboard', 'gpu', 'ram', 'ssd', 'hdd', 'power', 'case', 'cooler')
    `, [id]);
    
    preset.items = items;
    res.json(preset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE new preset (Admin only)
exports.create = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { title, description, category, thumbnail_url, items } = req.body;
    
    await conn.beginTransaction();
    
    // Calculate total price
    let totalPrice = 0;
    if (items && items.length > 0) {
      const deviceIds = items.map(item => item.device_id);
      const [devices] = await conn.query(
        `SELECT Device_ID, price FROM device WHERE Device_ID IN (?)`,
        [deviceIds]
      );
      
      const priceMap = {};
      devices.forEach(d => {
        priceMap[d.Device_ID] = d.price;
      });
      
      items.forEach(item => {
        const price = priceMap[item.device_id] || 0;
        totalPrice += price * (item.quantity || 1);
      });
    }
    
    // Insert preset
    const [result] = await conn.query(
      `INSERT INTO preset_builds (title, description, category, thumbnail_url, total_price)
       VALUES (?, ?, ?, ?, ?)`,
      [title, description, category, thumbnail_url, totalPrice]
    );
    
    const presetId = result.insertId;
    
    // Insert items
    if (items && items.length > 0) {
      for (const item of items) {
        const [deviceResult] = await conn.query(
          'SELECT price FROM device WHERE Device_ID = ?',
          [item.device_id]
        );
        
        const priceAtTime = deviceResult[0]?.price || 0;
        
        await conn.query(
          `INSERT INTO preset_build_items (preset_id, device_id, component_type, quantity, price_at_time)
           VALUES (?, ?, ?, ?, ?)`,
          [presetId, item.device_id, item.component_type, item.quantity || 1, priceAtTime]
        );
      }
    }
    
    await conn.commit();
    res.status(201).json({ 
      message: 'Preset created successfully', 
      preset_id: presetId,
      total_price: totalPrice
    });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

// UPDATE preset (Admin only)
exports.update = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { id } = req.params;
    const { title, description, category, thumbnail_url, is_active, items } = req.body;
    
    await conn.beginTransaction();
    
    // Calculate total price if items provided
    let totalPrice = null;
    if (items && items.length > 0) {
      totalPrice = 0;
      const deviceIds = items.map(item => item.device_id);
      const [devices] = await conn.query(
        `SELECT Device_ID, price FROM device WHERE Device_ID IN (?)`,
        [deviceIds]
      );
      
      const priceMap = {};
      devices.forEach(d => {
        priceMap[d.Device_ID] = d.price;
      });
      
      items.forEach(item => {
        const price = priceMap[item.device_id] || 0;
        totalPrice += price * (item.quantity || 1);
      });
    }
    
    // Update preset
    const updateFields = [];
    const updateValues = [];
    
    if (title !== undefined) { updateFields.push('title = ?'); updateValues.push(title); }
    if (description !== undefined) { updateFields.push('description = ?'); updateValues.push(description); }
    if (category !== undefined) { updateFields.push('category = ?'); updateValues.push(category); }
    if (thumbnail_url !== undefined) { updateFields.push('thumbnail_url = ?'); updateValues.push(thumbnail_url); }
    if (is_active !== undefined) { updateFields.push('is_active = ?'); updateValues.push(is_active); }
    if (totalPrice !== null) { updateFields.push('total_price = ?'); updateValues.push(totalPrice); }
    
    if (updateFields.length > 0) {
      updateValues.push(id);
      await conn.query(
        `UPDATE preset_builds SET ${updateFields.join(', ')} WHERE preset_id = ?`,
        updateValues
      );
    }
    
    // Update items if provided
    if (items) {
      // Delete old items
      await conn.query('DELETE FROM preset_build_items WHERE preset_id = ?', [id]);
      
      // Insert new items
      for (const item of items) {
        const [deviceResult] = await conn.query(
          'SELECT price FROM device WHERE Device_ID = ?',
          [item.device_id]
        );
        
        const priceAtTime = deviceResult[0]?.price || 0;
        
        await conn.query(
          `INSERT INTO preset_build_items (preset_id, device_id, component_type, quantity, price_at_time)
           VALUES (?, ?, ?, ?, ?)`,
          [id, item.device_id, item.component_type, item.quantity || 1, priceAtTime]
        );
      }
    }
    
    await conn.commit();
    res.json({ message: 'Preset updated successfully' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

// UPDATE preset info only (without items) (Admin only)
exports.updateInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, thumbnail_url, is_active } = req.body;
    
    const updateFields = [];
    const updateValues = [];
    
    if (title !== undefined) { updateFields.push('title = ?'); updateValues.push(title); }
    if (description !== undefined) { updateFields.push('description = ?'); updateValues.push(description); }
    if (category !== undefined) { updateFields.push('category = ?'); updateValues.push(category); }
    if (thumbnail_url !== undefined) { updateFields.push('thumbnail_url = ?'); updateValues.push(thumbnail_url); }
    if (is_active !== undefined) { updateFields.push('is_active = ?'); updateValues.push(is_active); }
    
    if (updateFields.length > 0) {
      updateValues.push(id);
      await db.query(
        `UPDATE preset_builds SET ${updateFields.join(', ')} WHERE preset_id = ?`,
        updateValues
      );
    }
    
    res.json({ message: 'Preset info updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE preset (Admin only)
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM preset_builds WHERE preset_id = ?', [id]);
    res.json({ message: 'Preset deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET all presets for admin (including inactive)
exports.getAllForAdmin = async (req, res) => {
  try {
    const [presets] = await db.query(`
      SELECT 
        p.*,
        COUNT(DISTINCT pi.item_id) as item_count
      FROM preset_builds p
      LEFT JOIN preset_build_items pi ON p.preset_id = pi.preset_id
      GROUP BY p.preset_id
      ORDER BY p.created_at DESC
    `);
    res.json(presets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
