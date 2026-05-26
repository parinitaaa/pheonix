const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const RefundRequest = require('../models/RefundRequest');
const Coupon = require('../models/Coupon');
const { v4: uuidv4 } = require('uuid');

// @route POST /api/orders
const createOrder = asyncHandler(async (req, res) => {
    const { items, shippingAddress, paymentMethod, couponCode } = req.body;
    if (!items || items.length === 0) { res.status(400); throw new Error('No items in order'); }

    let itemsPrice = 0;
    const orderItems = [];
    for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) { res.status(404); throw new Error(`Product ${item.product} not found`); }
        if (product.stock < item.quantity) { res.status(400); throw new Error(`${product.name} is out of stock`); }
        product.stock -= item.quantity;
        product.sold += item.quantity;
        await product.save();
        const price = product.discountPrice > 0 ? product.discountPrice : product.price;
        itemsPrice += price * item.quantity;
        orderItems.push({ product: product._id, name: product.name, image: product.images[0] || '', price, quantity: item.quantity });
    }

    let discountAmount = 0;
    if (couponCode) {
        const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
        if (coupon && (!coupon.expiresAt || coupon.expiresAt > new Date()) && coupon.usedCount < coupon.usageLimit && itemsPrice >= coupon.minOrderAmount) {
            discountAmount = coupon.discountType === 'percentage'
                ? Math.min((itemsPrice * coupon.discountValue) / 100, coupon.maxDiscount || Infinity)
                : coupon.discountValue;
            coupon.usedCount += 1;
            coupon.usedBy.push(req.user._id);
            await coupon.save();
        }
    }

    const shippingPrice = itemsPrice > 999 ? 0 : 99;
    const taxPrice = Math.round(itemsPrice * 0.05);
    const totalPrice = Math.round(itemsPrice + shippingPrice + taxPrice - discountAmount);
    const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

    const order = await Order.create({
        user: req.user._id, items: orderItems, shippingAddress, paymentMethod: paymentMethod || 'Card',
        itemsPrice, shippingPrice, taxPrice, discountAmount, couponCode, totalPrice,
        trackingNumber: uuidv4().substring(0, 12).toUpperCase(),
        estimatedDelivery, isPaid: true, paidAt: new Date(), paymentStatus: 'Paid', orderStatus: 'Processing',
    });

    // Add points
    const user = await User.findById(req.user._id);
    user.points += Math.floor(totalPrice / 100);
    user.monthlySpend += totalPrice;
    await user.save();

    res.status(201).json({ success: true, order });
});

// @route GET /api/orders/mine
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
});

// @route GET /api/orders/:id
const getOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) { res.status(404); throw new Error('Order not found'); }
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403); throw new Error('Not authorized');
    }
    res.json({ success: true, order });
});

// @route PUT /api/orders/:id/cancel
const cancelOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) { res.status(404); throw new Error('Order not found'); }
    if (order.user.toString() !== req.user._id.toString()) { res.status(403); throw new Error('Not authorized'); }
    if (!['Processing', 'Confirmed'].includes(order.orderStatus)) { res.status(400); throw new Error('Order cannot be cancelled at this stage'); }

    order.orderStatus = 'Cancelled';
    order.cancelledAt = new Date();
    order.cancelReason = req.body.reason || 'User requested cancellation';

    // Restore stock
    for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, sold: -item.quantity } });
    }
    await order.save();
    res.json({ success: true, order });
});

// @route POST /api/orders/:id/refund
const requestRefund = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) { res.status(404); throw new Error('Order not found'); }
    if (order.user.toString() !== req.user._id.toString()) { res.status(403); throw new Error('Not authorized'); }
    if (order.orderStatus !== 'Delivered') { res.status(400); throw new Error('Only delivered orders can be refunded'); }

    const existing = await RefundRequest.findOne({ order: order._id });
    if (existing) { res.status(400); throw new Error('Refund already requested'); }

    const refund = await RefundRequest.create({ order: order._id, user: req.user._id, reason: req.body.reason, description: req.body.description, refundAmount: order.totalPrice });
    res.status(201).json({ success: true, refund });
});

module.exports = { createOrder, getMyOrders, getOrder, cancelOrder, requestRefund };
