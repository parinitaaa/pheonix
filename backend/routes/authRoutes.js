const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, addAddress, deleteAddress, getLeaderboard } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/address', protect, addAddress);
router.delete('/address/:id', protect, deleteAddress);
router.get('/leaderboard', getLeaderboard);

module.exports = router;
