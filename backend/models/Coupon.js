const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
    {
        code: { type: String, required: true, unique: true, uppercase: true, trim: true },
        discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
        discountValue: { type: Number, required: true },
        minOrderAmount: { type: Number, default: 0 },
        maxDiscount: { type: Number },
        usageLimit: { type: Number, default: 100 },
        usedCount: { type: Number, default: 0 },
        usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        expiresAt: { type: Date },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Coupon', couponSchema);
