const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema(
    {
        order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        reason: { type: String, required: true },
        description: { type: String },
        status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Processed'], default: 'Pending' },
        refundAmount: { type: Number },
        adminNote: { type: String },
        processedAt: Date,
    },
    { timestamps: true }
);

module.exports = mongoose.model('RefundRequest', refundSchema);
