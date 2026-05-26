const asyncHandler = require('express-async-handler');
const Wishlist = require('../models/Wishlist');

// @route GET /api/wishlist
const getWishlist = asyncHandler(async (req, res) => {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
    if (!wishlist) wishlist = { products: [] };
    res.json({ success: true, products: wishlist.products });
});

// @route POST /api/wishlist/:productId
const toggleWishlist = asyncHandler(async (req, res) => {
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, products: [] });

    const idx = wishlist.products.findIndex(id => id.toString() === req.params.productId);
    if (idx > -1) {
        wishlist.products.splice(idx, 1);
        await wishlist.save();
        res.json({ success: true, added: false, message: 'Removed from wishlist' });
    } else {
        wishlist.products.push(req.params.productId);
        await wishlist.save();
        res.json({ success: true, added: true, message: 'Added to wishlist' });
    }
});

module.exports = { getWishlist, toggleWishlist };
