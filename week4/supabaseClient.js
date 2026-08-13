require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(
  supabaseUrl || 'https://example.supabase.co', 
  supabaseKey || 'public-anon-key'
);

module.exports = supabase;
