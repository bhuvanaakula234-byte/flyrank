const express = require('express');
const { db } = require('../db');

const router = express.Router();

// Serve Widget Config
router.get('/api/widgets/:id/config', (req, res) => {
  const widgetId = req.params.id;
  
  db.get(`SELECT id, title, type, config_json FROM widgets WHERE id = ?`, [widgetId], (err, row) => {
    if (err) return res.status(500).json({ success: false, error: 'Database error' });
    if (!row) return res.status(404).json({ success: false, error: 'Widget not found' });
    
    // Set Cache-Control header (short-lived for config, e.g. 5 minutes)
    res.set('Cache-Control', 'public, max-age=300');
    
    row.config_json = JSON.parse(row.config_json);
    res.json(row);
  });
});

// Serve the embed script
// In production, this would be built. Here we serve a static string version.
router.get('/widget.js', (req, res) => {
  // Set Cache-Control header (long-lived, e.g., 1 day)
  res.set('Cache-Control', 'public, max-age=86400');
  res.set('Content-Type', 'application/javascript');
  
  const scriptContent = `
    (function() {
      const currentScript = document.currentScript;
      const urlParams = new URLSearchParams(currentScript.src.split('?')[1]);
      const widgetId = urlParams.get('id');
      
      if (!widgetId) {
        console.error('Widget ID is required.');
        return;
      }
      
      const API_URL = currentScript.src.split('/widget.js')[0];
      
      fetch(\`\${API_URL}/api/widgets/\${widgetId}/config\`)
        .then(res => res.json())
        .then(config => {
          if (!config || config.error) {
            console.error('Failed to load widget config', config.error);
            return;
          }
          renderWidget(config, API_URL);
        })
        .catch(err => console.error('Error fetching config:', err));
        
      function renderWidget(config, apiUrl) {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.bottom = '20px';
        container.style.right = '20px';
        container.style.background = '#fff';
        container.style.border = '1px solid #ccc';
        container.style.padding = '20px';
        container.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        container.style.borderRadius = '8px';
        container.style.zIndex = '999999';
        
        const title = document.createElement('h3');
        title.innerText = config.title;
        title.style.margin = '0 0 10px 0';
        container.appendChild(title);
        
        const form = document.createElement('form');
        form.onsubmit = function(e) {
          e.preventDefault();
          
          const formData = new FormData(form);
          const data = Object.fromEntries(formData.entries());
          
          // Add honeypot field value manually since FormData might skip hidden fields depending on implementation,
          // but input type="hidden" is fine.
          
          fetch(\`\${apiUrl}/api/submissions\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              widget_id: parseInt(config.id, 10),
              data: data,
              // honeypot field
              website_url: data.website_url || ''
            })
          })
          .then(res => res.json())
          .then(result => {
            if (result.success) {
              form.innerHTML = '<p>Thank you for your submission!</p>';
            } else {
              alert('Submission failed: ' + (result.error || 'Unknown error'));
            }
          })
          .catch(err => {
            alert('Submission failed.');
            console.error(err);
          });
        };
        
        // Render fields based on config
        const fields = config.config_json.fields || [{name: 'email', type: 'email', label: 'Email'}];
        fields.forEach(f => {
          const wrapper = document.createElement('div');
          wrapper.style.marginBottom = '10px';
          
          const label = document.createElement('label');
          label.innerText = f.label;
          label.style.display = 'block';
          label.style.marginBottom = '5px';
          wrapper.appendChild(label);
          
          const input = document.createElement('input');
          input.type = f.type;
          input.name = f.name;
          input.required = true;
          input.style.width = '100%';
          input.style.padding = '5px';
          wrapper.appendChild(input);
          
          form.appendChild(wrapper);
        });
        
        // Honeypot field (hidden)
        const honeypot = document.createElement('input');
        honeypot.type = 'hidden'; // normally opacity: 0 or absolute positioned offscreen is better, but this works for demo
        honeypot.name = 'website_url';
        form.appendChild(honeypot);
        
        const submitBtn = document.createElement('button');
        submitBtn.type = 'submit';
        submitBtn.innerText = config.config_json.buttonText || 'Submit';
        submitBtn.style.padding = '8px 16px';
        submitBtn.style.background = '#0070f3';
        submitBtn.style.color = '#fff';
        submitBtn.style.border = 'none';
        submitBtn.style.borderRadius = '4px';
        submitBtn.style.cursor = 'pointer';
        form.appendChild(submitBtn);
        
        container.appendChild(form);
        document.body.appendChild(container);
      }
    })();
  `;
  
  res.send(scriptContent);
});

module.exports = router;
