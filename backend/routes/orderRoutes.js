const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrder, cancelOrder, requestRefund } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createOrder);
router.get('/mine', protect, getMyOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/cancel', protect, cancelOrder);
router.post('/:id/refund', protect, requestRefund);

module.exports = router;
