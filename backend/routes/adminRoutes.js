const express = require('express');
const router = express.Router();
const { getAnalytics, getUsers, updateUser, deleteUser, getAllOrders, updateOrder, getRefunds, processRefund } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

router.use(protect, admin);
router.get('/analytics', getAnalytics);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/orders', getAllOrders);
router.put('/orders/:id', updateOrder);
router.get('/refunds', getRefunds);
router.put('/refunds/:id', processRefund);

module.exports = router;
