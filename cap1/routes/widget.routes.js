const express = require('express');
const { z } = require('zod');
const { db } = require('../db');
const authenticate = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

const widgetSchema = z.object({
  title: z.string().min(1),
  type: z.string().min(1),
  config_json: z.record(z.any()) // Accepts any JSON object for config
});

// Create Widget
router.post('/', (req, res) => {
  try {
    const { title, type, config_json } = widgetSchema.parse(req.body);
    const tenantId = req.tenant.id;
    
    db.run(
      `INSERT INTO widgets (tenant_id, title, type, config_json) VALUES (?, ?, ?, ?)`,
      [tenantId, title, type, JSON.stringify(config_json)],
      function (err) {
        if (err) return res.status(500).json({ success: false, error: 'Database error' });
        res.status(201).json({ success: true, widget: { id: this.lastID, title, type, config_json } });
      }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Invalid payload', details: err.errors });
    }
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get all Widgets for Tenant
router.get('/', (req, res) => {
  const tenantId = req.tenant.id;
  db.all(`SELECT * FROM widgets WHERE tenant_id = ?`, [tenantId], (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: 'Database error' });
    
    // Parse config_json before returning
    const widgets = rows.map(r => ({ ...r, config_json: JSON.parse(r.config_json) }));
    res.json({ success: true, widgets });
  });
});

// Get a single Widget
router.get('/:id', (req, res) => {
  const tenantId = req.tenant.id;
  const widgetId = req.params.id;
  
  db.get(`SELECT * FROM widgets WHERE id = ? AND tenant_id = ?`, [widgetId, tenantId], (err, row) => {
    if (err) return res.status(500).json({ success: false, error: 'Database error' });
    if (!row) return res.status(404).json({ success: false, error: 'Widget not found' });
    
    row.config_json = JSON.parse(row.config_json);
    res.json({ success: true, widget: row });
  });
});

// Update Widget
router.put('/:id', (req, res) => {
  try {
    const { title, type, config_json } = widgetSchema.parse(req.body);
    const tenantId = req.tenant.id;
    const widgetId = req.params.id;
    
    db.run(
      `UPDATE widgets SET title = ?, type = ?, config_json = ? WHERE id = ? AND tenant_id = ?`,
      [title, type, JSON.stringify(config_json), widgetId, tenantId],
      function (err) {
        if (err) return res.status(500).json({ success: false, error: 'Database error' });
        if (this.changes === 0) return res.status(404).json({ success: false, error: 'Widget not found' });
        
        res.json({ success: true, widget: { id: widgetId, title, type, config_json } });
      }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Invalid payload', details: err.errors });
    }
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Delete Widget
router.delete('/:id', (req, res) => {
  const tenantId = req.tenant.id;
  const widgetId = req.params.id;
  
  db.run(`DELETE FROM widgets WHERE id = ? AND tenant_id = ?`, [widgetId, tenantId], function(err) {
    if (err) return res.status(500).json({ success: false, error: 'Database error' });
    if (this.changes === 0) return res.status(404).json({ success: false, error: 'Widget not found' });
    
    res.json({ success: true, message: 'Widget deleted' });
  });
});

module.exports = router;
