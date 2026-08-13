require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./openapi.json');

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const authRoutes = require('./routes/auth.routes');
const publicRoutes = require('./routes/public.routes');
const protectedRoutes = require('./routes/protected.routes');

app.use('/auth', authRoutes);
app.use('/public', publicRoutes);
app.use('/protected', protectedRoutes);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your_project_url') {
  console.warn('Warning: Missing or placeholder Supabase credentials in .env');
}

// supabase is now imported inside the routes or via supabaseClient.js

app.get('/', (req, res) => {
  res.send('Server running and connected to Supabase');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app };
