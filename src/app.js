const express = require('express');
const MemoryItemRepository = require('./repositories/memoryRepository');
const PostgresItemRepository = require('./repositories/postgresRepository');
const ItemService = require('./services/itemService');
const createItemRouter = require('./routes/itemRoutes');

const app = express();

app.use(express.json());

// Inject repository based on STORAGE_TYPE environment variable
const storageType = process.env.STORAGE_TYPE || 'postgres';
let itemRepository;

if (storageType === 'memory') {
  console.log('📦 Using In-Memory Repository');
  itemRepository = new MemoryItemRepository();
} else {
  console.log('🐘 Using PostgreSQL Repository');
  itemRepository = new PostgresItemRepository();
}

const itemService = new ItemService(itemRepository);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', storage: storageType, timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/items', createItemRouter(itemService));

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

module.exports = app;
