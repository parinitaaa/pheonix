const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
    },
    { timestamps: true }
);

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: [true, 'Product name is required'], trim: true },
        slug: { type: String, unique: true },
        description: { type: String, required: true },
        shortDescription: { type: String },
        price: { type: Number, required: true, min: 0 },
        discountPrice: { type: Number, default: 0 },
        discountPercent: { type: Number, default: 0 },
        images: [{ type: String }],
        category: {
            type: String,
            required: true,
            enum: ['Electronics', 'Fashion', 'Gaming', 'Home & Living', 'Beauty', 'Sports', 'Books', 'Collectibles', 'Art', 'Jewelry'],
        },
        brand: { type: String },
        tags: [String],
        stock: { type: Number, required: true, min: 0, default: 0 },
        sold: { type: Number, default: 0 },
        reviews: [reviewSchema],
        rating: { type: Number, default: 0 },
        numReviews: { type: Number, default: 0 },
        isFeatured: { type: Boolean, default: false },
        isTrending: { type: Boolean, default: false },
        isDailyDeal: { type: Boolean, default: false },
        isFlashSale: { type: Boolean, default: false },
        flashSaleEnds: { type: Date },
        flashSalePrice: { type: Number, default: 0 },
        isAuctionProduct: { type: Boolean, default: false },
        specifications: [{ key: String, value: String }],
        weight: Number,
        dimensions: { length: Number, width: Number, height: Number },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

productSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();
    }
    if (this.reviews.length > 0) {
        this.rating = this.reviews.reduce((acc, r) => acc + r.rating, 0) / this.reviews.length;
        this.numReviews = this.reviews.length;
    }
    next();
});

module.exports = mongoose.model('Product', productSchema);
