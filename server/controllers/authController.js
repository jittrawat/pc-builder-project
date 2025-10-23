const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name = '', email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email และ password จำเป็น' });
    }

    const [dup] = await db.query('SELECT id FROM users WHERE email=?', [email]);
    if (dup.length) {
      return res.status(409).json({ error: 'อีเมลนี้ถูกใช้งานแล้ว' });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, hash, 'user']
    );

    const token = jwt.sign({ id: result.insertId, email }, JWT_SECRET, { expiresIn: '7d' });
    return res.status(201).json({
      user: { id: result.insertId, name, email, role: 'user' },
      token
    });
  } catch (err) {
    console.error('[register] code=', err.code, 'msg=', err.message, 'sql=', err.sqlMessage);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'อีเมลนี้ถูกใช้งานแล้ว' });
    }
    return res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email และ password จำเป็น' });
    }

    const [rows] = await db.query(
      'SELECT id, name, email, role, password_hash FROM users WHERE email=?',
      [email]
    );
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    console.error('[login] code=', err.code, 'msg=', err.message, 'sql=', err.sqlMessage);
    return res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/auth/me
exports.me = async (req, res) => {
  try {
    const id = req.user?.id;
    if (!id) return res.status(401).json({ error: 'Unauthorized' });

    const [rows] = await db.query(
      'SELECT id, name, email, role FROM users WHERE id=?',
      [id]
    );
    const u = rows[0];
    if (!u) return res.status(404).json({ error: 'User not found' });

    return res.json({ user: { id: u.id, name: u.name, email: u.email, role: u.role } });
  } catch (err) {
    console.error('[me] code=', err.code, 'msg=', err.message, 'sql=', err.sqlMessage);
    return res.status(500).json({ error: 'Server error' });
  }
};
