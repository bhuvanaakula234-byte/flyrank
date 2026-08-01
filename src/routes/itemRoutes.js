const express = require('express');

function createItemRouter(itemService) {
  const router = express.Router();

  // GET /api/items - List all items
  router.get('/', async (req, res, next) => {
    try {
      const items = await itemService.getAllItems();
      res.json({ success: true, count: items.length, data: items });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/items/:id - Get item by ID
  router.get('/:id', async (req, res, next) => {
    try {
      const item = await itemService.getItemById(req.params.id);
      res.json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/items - Create a new item
  router.post('/', async (req, res, next) => {
    try {
      const newItem = await itemService.createItem(req.body);
      res.status(201).json({ success: true, data: newItem });
    } catch (err) {
      next(err);
    }
  });

  // PUT /api/items/:id - Update an item
  router.put('/:id', async (req, res, next) => {
    try {
      const updatedItem = await itemService.updateItem(req.params.id, req.body);
      res.json({ success: true, data: updatedItem });
    } catch (err) {
      next(err);
    }
  });

  // DELETE /api/items/:id - Delete an item
  router.delete('/:id', async (req, res, next) => {
    try {
      await itemService.deleteItem(req.params.id);
      res.json({ success: true, message: 'Item deleted successfully' });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = createItemRouter;
