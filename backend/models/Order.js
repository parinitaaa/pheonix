const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    image: String,
    price: Number,
    quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        items: [orderItemSchema],
        shippingAddress: {
            fullName: String,
            phone: String,
            addressLine1: String,
            addressLine2: String,
            city: String,
            state: String,
            pincode: String,
            country: String,
        },
        paymentMethod: { type: String, default: 'Card' },
        paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' },
        itemsPrice: { type: Number, required: true },
        shippingPrice: { type: Number, default: 0 },
        taxPrice: { type: Number, default: 0 },
        discountAmount: { type: Number, default: 0 },
        couponCode: { type: String },
        totalPrice: { type: Number, required: true },
        orderStatus: {
            type: String,
            enum: ['Processing', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Refunded'],
            default: 'Processing',
        },
        trackingNumber: String,
        estimatedDelivery: Date,
        deliveredAt: Date,
        cancelledAt: Date,
        cancelReason: String,
        isPaid: { type: Boolean, default: false },
        paidAt: Date,
    },
    { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
