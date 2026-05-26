const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema(
    {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        title: { type: String, required: true },
        description: { type: String },
        startingPrice: { type: Number, required: true },
        currentBid: { type: Number, default: 0 },
        minBidIncrement: { type: Number, default: 50 },
        highestBidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true },
        status: { type: String, enum: ['upcoming', 'active', 'ended', 'cancelled'], default: 'upcoming' },
        winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        winningBid: { type: Number, default: 0 },
        totalBids: { type: Number, default: 0 },
        image: { type: String },
        isDemo: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Auction', auctionSchema);
