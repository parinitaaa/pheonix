const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const User = require('../models/User');

// @route GET /api/products
const getProducts = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const query = { isActive: true };
    if (req.query.category) query.category = req.query.category;
    if (req.query.brand) query.brand = req.query.brand;
    if (req.query.minPrice || req.query.maxPrice) {
        query.price = {};
        if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
        if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }
    if (req.query.search) {
        query.$or = [
            { name: { $regex: req.query.search, $options: 'i' } },
            { description: { $regex: req.query.search, $options: 'i' } },
            { tags: { $in: [new RegExp(req.query.search, 'i')] } },
        ];
    }
    if (req.query.isFeatured) query.isFeatured = true;
    if (req.query.isTrending) query.isTrending = true;
    if (req.query.isDailyDeal) query.isDailyDeal = true;
    if (req.query.isFlashSale) query.isFlashSale = true;
    if (req.query.hasDiscount === 'true') {
        query.$or = [
            { discountPrice: { $gt: 0 } },
            { isDailyDeal: true },
            { isFlashSale: true }
        ];
    }

    let sort = {};
    if (req.query.sort === 'price_asc') sort = { price: 1 };
    else if (req.query.sort === 'price_desc') sort = { price: -1 };
    else if (req.query.sort === 'rating') sort = { rating: -1 };
    else if (req.query.sort === 'newest') sort = { createdAt: -1 };
    else if (req.query.sort === 'popular') sort = { sold: -1 };
    else sort = { createdAt: -1 };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query).sort(sort).skip(skip).limit(limit);

    res.json({ success: true, products, page, pages: Math.ceil(total / limit), total });
});

// @route GET /api/products/:id
const getProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate('reviews.user', 'name avatar');
    if (!product) { res.status(404); throw new Error('Product not found'); }

    // Track recently viewed
    if (req.user) {
        const user = await User.findById(req.user._id);
        user.recentlyViewed = [product._id, ...user.recentlyViewed.filter(id => id.toString() !== product._id.toString())].slice(0, 10);
        await user.save();
    }

    res.json({ success: true, product });
});

// @route POST /api/products (admin)
const createProduct = asyncHandler(async (req, res) => {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
});

// @route PUT /api/products/:id (admin)
const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) { res.status(404); throw new Error('Product not found'); }
    res.json({ success: true, product });
});

// @route DELETE /api/products/:id (admin)
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) { res.status(404); throw new Error('Product not found'); }
    product.isActive = false;
    await product.save();
    res.json({ success: true, message: 'Product removed' });
});

// @route POST /api/products/:id/review
const addReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) { res.status(404); throw new Error('Product not found'); }
    const already = product.reviews.find(r => r.user.toString() === req.user._id.toString());
    if (already) { res.status(400); throw new Error('You already reviewed this product'); }
    product.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment });
    product.rating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;
    product.numReviews = product.reviews.length;
    await product.save();
    res.status(201).json({ success: true, message: 'Review added' });
});

// @route GET /api/products/categories
const getCategories = asyncHandler(async (req, res) => {
    const categories = await Product.distinct('category', { isActive: true });
    res.json({ success: true, categories });
});

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, addReview, getCategories };
