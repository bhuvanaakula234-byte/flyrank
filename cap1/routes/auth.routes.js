const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { db } = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev';

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

router.post('/register', async (req, res) => {
  try {
    const { email, password } = authSchema.parse(req.body);
    
    // Check if user exists
    db.get(`SELECT id FROM tenants WHERE email = ?`, [email], (err, row) => {
      if (err) return res.status(500).json({ success: false, error: 'Database error' });
      if (row) return res.status(400).json({ success: false, error: 'User already exists' });
      
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);
      
      db.run(`INSERT INTO tenants (email, password_hash) VALUES (?, ?)`, [email, hash], function(err) {
        if (err) return res.status(500).json({ success: false, error: 'Failed to create user' });
        
        const token = jwt.sign({ id: this.lastID, email }, JWT_SECRET, { expiresIn: '1d' });
        res.status(201).json({ success: true, token, tenant: { id: this.lastID, email } });
      });
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Invalid payload', details: err.errors });
    }
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = authSchema.parse(req.body);
    
    db.get(`SELECT * FROM tenants WHERE email = ?`, [email], (err, tenant) => {
      if (err) return res.status(500).json({ success: false, error: 'Database error' });
      if (!tenant) return res.status(401).json({ success: false, error: 'Invalid credentials' });
      
      const isMatch = bcrypt.compareSync(password, tenant.password_hash);
      if (!isMatch) return res.status(401).json({ success: false, error: 'Invalid credentials' });
      
      const token = jwt.sign({ id: tenant.id, email: tenant.email }, JWT_SECRET, { expiresIn: '1d' });
      res.json({ success: true, token, tenant: { id: tenant.id, email: tenant.email } });
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Invalid payload', details: err.errors });
    }
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
