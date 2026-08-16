const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const { z } = require('zod');
const { db } = require('../db');

const router = express.Router();

// CORS for public submissions (allow all origins or specific ones)
router.use(cors({
  origin: '*', // Allow all origins for the widget
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// Rate limiter: 10 requests per minute per IP
const submissionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 10,
  message: { success: false, error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const submissionSchema = z.object({
  widget_id: z.number(),
  data: z.record(z.any()),
  website_url: z.string().optional() // Honeypot field
});

// Geo enrichment fallback chain
const getGeoData = async (ip) => {
  // Try Provider A
  try {
    const response = await axios.get(`http://ip-api.com/json/${ip}`, { timeout: 2000 });
    if (response.data && response.data.status === 'success') {
      return { country: response.data.country, city: response.data.city, provider: 'ip-api' };
    }
  } catch (err) {
    console.error('Geo Provider A failed:', err.message);
  }

  // Try Provider B (Fallback)
  try {
    const response = await axios.get(`https://ipapi.co/${ip}/json/`, { timeout: 2000 });
    if (response.data && !response.data.error) {
      return { country: response.data.country_name, city: response.data.city, provider: 'ipapi.co' };
    }
  } catch (err) {
    console.error('Geo Provider B failed:', err.message);
  }

  // Both failed, return null but don't crash
  return null;
};

// Safe side effect
const sendNotificationEmail = async (submissionId, widgetId) => {
  try {
    // Simulate email sending
    console.log(`[Email Side Effect] Sending notification for submission ${submissionId} on widget ${widgetId}...`);
    // If this throws, it shouldn't fail the request
    // throw new Error("Simulated email failure");
  } catch (err) {
    console.error(`[Email Side Effect] Failed to send email:`, err.message);
  }
};

router.post('/', submissionLimiter, async (req, res) => {
  try {
    // 1. Validate payload
    const { widget_id, data, website_url } = submissionSchema.parse(req.body);

    // 2. Spam control (Honeypot)
    if (website_url && website_url.length > 0) {
      // It's a bot. Silently drop or reject.
      return res.status(200).json({ success: true, message: 'Submission received (spam dropped)' });
    }
    
    // Remove honeypot field from actual data to store
    delete data.website_url;

    // Verify widget exists
    db.get(`SELECT id FROM widgets WHERE id = ?`, [widget_id], async (err, widget) => {
      if (err) return res.status(500).json({ success: false, error: 'Database error' });
      if (!widget) return res.status(404).json({ success: false, error: 'Widget not found' });

      // 3. Geo Enrichment
      let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      // In local dev, IP might be ::1, which doesn't resolve well.
      if (ip === '::1' || ip === '127.0.0.1') {
        ip = '8.8.8.8'; // mock public IP for testing geo
      }
      
      const geoData = await getGeoData(ip);

      // 4. Store Submission
      db.run(
        `INSERT INTO submissions (widget_id, payload_json, ip_address, geo_data_json) VALUES (?, ?, ?, ?)`,
        [widget_id, JSON.stringify(data), ip, geoData ? JSON.stringify(geoData) : null],
        function(err) {
          if (err) return res.status(500).json({ success: false, error: 'Database error' });
          
          const submissionId = this.lastID;
          
          // 5. Safe side effect (non-blocking)
          sendNotificationEmail(submissionId, widget_id);
          
          res.status(201).json({ success: true, submission_id: submissionId });
        }
      );
    });

  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Invalid payload', details: err.errors });
    }
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
