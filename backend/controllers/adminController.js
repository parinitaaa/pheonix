const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const RefundRequest = require('../models/RefundRequest');
const Auction = require('../models/Auction');

// @route GET /api/admin/analytics
const getAnalytics = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'Processing' });
    const pendingRefunds = await RefundRequest.countDocuments({ status: 'Pending' });
    const activeAuctions = await Auction.countDocuments({ status: 'active' });

    const revenueAgg = await Order.aggregate([
        { $match: { paymentStatus: 'Paid' } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // Monthly revenue last 6 months
    const monthlyRevenue = await Order.aggregate([
        { $match: { paymentStatus: 'Paid', createdAt: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, revenue: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Top products
    const topProducts = await Product.find({ isActive: true }).sort({ sold: -1 }).limit(5).select('name sold price images');

    res.json({
        success: true,
        totalUsers,
        totalProducts,
        totalOrders,
        pendingOrders,
        totalRevenue,
        pendingRefunds,
        activeAuctions,
        monthlyRevenue,
        topProducts,
        topBuyers,
        revenue: totalRevenue,
        orders: totalOrders,
        users: totalUsers,
        auctions: activeAuctions
    });
});

// @route GET /api/admin/users
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
});

// @route PUT /api/admin/users/:id
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role, isActive: req.body.isActive }, { new: true }).select('-password');
    res.json({ success: true, user });
});

// @route DELETE /api/admin/users/:id
const deleteUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'User deactivated' });
});

// @route GET /api/admin/orders
const getAllOrders = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const total = await Order.countDocuments();
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit);
    res.json({ success: true, orders, total, page, pages: Math.ceil(total / limit) });
});

// @route PUT /api/admin/orders/:id
const updateOrder = asyncHandler(async (req, res) => {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('user', 'name email');
    if (!order) { res.status(404); throw new Error('Order not found'); }
    res.json({ success: true, order });
});

// @route GET /api/admin/refunds
const getRefunds = asyncHandler(async (req, res) => {
    const refunds = await RefundRequest.find().populate('user', 'name email').populate('order').sort({ createdAt: -1 });
    res.json({ success: true, refunds });
});

// @route PUT /api/admin/refunds/:id
const processRefund = asyncHandler(async (req, res) => {
    const refund = await RefundRequest.findById(req.params.id);
    if (!refund) { res.status(404); throw new Error('Refund not found'); }
    refund.status = req.body.status;
    refund.adminNote = req.body.adminNote;
    refund.processedAt = new Date();
    if (req.body.status === 'Approved') {
        await Order.findByIdAndUpdate(refund.order, { orderStatus: 'Refunded', paymentStatus: 'Refunded' });
    }
    await refund.save();
    res.json({ success: true, refund });
});

module.exports = { getAnalytics, getUsers, updateUser, deleteUser, getAllOrders, updateOrder, getRefunds, processRefund };
