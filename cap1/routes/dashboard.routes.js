const express = require('express');
const { db } = require('../db');
const authenticate = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

// Get submissions for tenant's widgets
router.get('/submissions', (req, res) => {
  const tenantId = req.tenant.id;
  const widgetId = req.query.widget_id;

  let query = `
    SELECT s.id, s.widget_id, s.payload_json, s.ip_address, s.geo_data_json, s.created_at, w.title as widget_title
    FROM submissions s
    JOIN widgets w ON s.widget_id = w.id
    WHERE w.tenant_id = ?
  `;
  const params = [tenantId];

  if (widgetId) {
    query += ` AND w.id = ?`;
    params.push(widgetId);
  }

  query += ` ORDER BY s.created_at DESC`;

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: 'Database error' });
    
    // Parse json fields
    const submissions = rows.map(r => ({
      ...r,
      payload_json: JSON.parse(r.payload_json),
      geo_data_json: r.geo_data_json ? JSON.parse(r.geo_data_json) : null
    }));

    res.json({ success: true, submissions });
  });
});

// Simple stats endpoint
router.get('/stats', (req, res) => {
  const tenantId = req.tenant.id;

  const query = `
    SELECT w.id, w.title, count(s.id) as submission_count
    FROM widgets w
    LEFT JOIN submissions s ON w.id = s.widget_id
    WHERE w.tenant_id = ?
    GROUP BY w.id
  `;

  db.all(query, [tenantId], (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: 'Database error' });
    res.json({ success: true, stats: rows });
  });
});

module.exports = router;
