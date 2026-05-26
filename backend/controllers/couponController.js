const asyncHandler = require('express-async-handler');
const Coupon = require('../models/Coupon');

// @route POST /api/coupons/validate
const validateCoupon = asyncHandler(async (req, res) => {
    const { code, orderAmount } = req.body;
    const coupon = await Coupon.findOne({ code: code?.toUpperCase(), isActive: true });
    if (!coupon) { res.status(404); throw new Error('Invalid coupon code'); }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) { res.status(400); throw new Error('Coupon has expired'); }
    if (coupon.usedCount >= coupon.usageLimit) { res.status(400); throw new Error('Coupon usage limit reached'); }
    if (coupon.usedBy.map(id => id.toString()).includes(req.user._id.toString())) { res.status(400); throw new Error('You have already used this coupon'); }
    if (orderAmount < coupon.minOrderAmount) { res.status(400); throw new Error(`Minimum order amount is ₹${coupon.minOrderAmount}`); }

    const discount = coupon.discountType === 'percentage'
        ? Math.min((orderAmount * coupon.discountValue) / 100, coupon.maxDiscount || Infinity)
        : coupon.discountValue;

    res.json({ success: true, coupon: { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue, discount: Math.round(discount) } });
});

// @route GET /api/coupons (admin)
const getCoupons = asyncHandler(async (req, res) => {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
});

// @route POST /api/coupons (admin)
const createCoupon = asyncHandler(async (req, res) => {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, coupon });
});

// @route DELETE /api/coupons/:id (admin)
const deleteCoupon = asyncHandler(async (req, res) => {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Coupon deleted' });
});

module.exports = { validateCoupon, getCoupons, createCoupon, deleteCoupon };
