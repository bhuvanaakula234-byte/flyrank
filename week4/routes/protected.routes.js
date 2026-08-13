const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Apply middleware to all routes in this router
router.use(authMiddleware);

// GET /protected/profile
router.get('/profile', async (req, res) => {
  // Token verification is now handled by middleware
  return res.status(200).json({ 
    message: "Welcome to your protected profile!",
    user: {
      id: req.user.id,
      email: req.user.email,
      created_at: req.user.created_at
    }
  });
});

// GET /protected/dashboard - Test for Stage 4
router.get('/dashboard', async (req, res) => {
  return res.status(200).json({ message: "Welcome to your secure dashboard!" });
});

module.exports = router;
