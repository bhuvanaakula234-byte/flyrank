const express = require('express');
const cors = require('cors');
const { initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/auth.routes');
const widgetRoutes = require('./routes/widget.routes');
const submissionRoutes = require('./routes/submission.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const deliveryRoutes = require('./routes/delivery.routes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/widgets', widgetRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/', deliveryRoutes); // Serve /widget.js and /api/widgets/:id/config here

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

// Start server
initDb()
  .then(() => {
    console.log('Database initialized successfully.');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
