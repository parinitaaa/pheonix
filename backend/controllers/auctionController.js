const asyncHandler = require('express-async-handler');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const User = require('../models/User');

// @route GET /api/auctions
const getAuctions = asyncHandler(async (req, res) => {
    const query = {};
    if (req.query.status) query.status = req.query.status;
    const auctions = await Auction.find(query).populate('product', 'name images').populate('highestBidder', 'name').sort({ endTime: 1 });
    res.json({ success: true, auctions });
});

// @route GET /api/auctions/:id
const getAuction = asyncHandler(async (req, res) => {
    const auction = await Auction.findById(req.params.id)
        .populate('product', 'name images description')
        .populate('highestBidder', 'name avatar')
        .populate('winner', 'name avatar');
    if (!auction) { res.status(404); throw new Error('Auction not found'); }
    const bids = await Bid.find({ auction: auction._id }).populate('user', 'name avatar').sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, auction, bids });
});

// @route POST /api/auctions/:id/bid
const placeBid = asyncHandler(async (req, res) => {
    const { amount } = req.body;
    const auction = await Auction.findById(req.params.id);
    if (!auction) { res.status(404); throw new Error('Auction not found'); }
    if (auction.status !== 'active') { res.status(400); throw new Error('Auction is not active'); }
    if (new Date() > auction.endTime) { res.status(400); throw new Error('Auction has ended'); }

    const minBid = auction.currentBid > 0 ? auction.currentBid + auction.minBidIncrement : auction.startingPrice;
    if (amount < minBid) { res.status(400); throw new Error(`Minimum bid is ₹${minBid}`); }
    if (auction.highestBidder?.toString() === req.user._id.toString()) { res.status(400); throw new Error('You are already the highest bidder'); }

    auction.currentBid = amount;
    auction.highestBidder = req.user._id;
    auction.totalBids += 1;
    await auction.save();

    await Bid.create({ auction: auction._id, user: req.user._id, amount });

    const populatedAuction = await Auction.findById(auction._id).populate('highestBidder', 'name avatar');
    res.json({ success: true, auction: populatedAuction, message: 'Bid placed successfully!' });
});

// @route POST /api/auctions (admin)
const createAuction = asyncHandler(async (req, res) => {
    const auction = await Auction.create(req.body);
    res.status(201).json({ success: true, auction });
});

// @route PUT /api/auctions/:id (admin)
const updateAuction = asyncHandler(async (req, res) => {
    const auction = await Auction.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!auction) { res.status(404); throw new Error('Auction not found'); }
    res.json({ success: true, auction });
});

// Cron job logic — called by scheduler
const processExpiredAuctions = async () => {
    const expired = await Auction.find({ status: 'active', endTime: { $lte: new Date() } });
    for (const auction of expired) {
        auction.status = 'ended';
        if (auction.highestBidder) {
            auction.winner = auction.highestBidder;
            auction.winningBid = auction.currentBid;
            // Add points to winner
            await User.findByIdAndUpdate(auction.winner, { $inc: { points: 500 } });
            // Mark winning bid
            await Bid.findOneAndUpdate({ auction: auction._id, user: auction.winner, amount: auction.winningBid }, { isWinningBid: true });
        }
        await auction.save();
    }
    // Activate upcoming auctions
    await Auction.updateMany({ status: 'upcoming', startTime: { $lte: new Date() } }, { status: 'active' });
};

module.exports = { getAuctions, getAuction, placeBid, createAuction, updateAuction, processExpiredAuctions };
