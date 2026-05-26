const express = require('express');
const router = express.Router();
const { getAuctions, getAuction, placeBid, createAuction, updateAuction } = require('../controllers/auctionController');
const { protect, admin } = require('../middleware/auth');
const { bidLimiter } = require('../middleware/rateLimiter');

router.get('/', getAuctions);
router.get('/:id', getAuction);
router.post('/:id/bid', protect, bidLimiter, placeBid);
router.post('/', protect, admin, createAuction);
router.put('/:id', protect, admin, updateAuction);

module.exports = router;
