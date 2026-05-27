require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Product = require('../models/Product');
const Auction = require('../models/Auction');
const Coupon = require('../models/Coupon');

const seed = async () => {
    try {
        await connectDB();
        console.log('🌱 Seeding database...');

        // Clear
        await User.deleteMany({});
        await Product.deleteMany({});
        await Auction.deleteMany({});
        await Coupon.deleteMany({});

        // Admin
        const admin = await User.create({
            name: 'Admin INFINITY',
            email: process.env.ADMIN_EMAIL || 'admin@infinity.com',
            password: process.env.ADMIN_PASSWORD || 'Admin@123456',
            role: 'admin',
            points: 9999,
            streak: 100
        });
        console.log('✅ Admin created:', admin.email);

        // Demo User
        const user = await User.create({
            name: 'Alex Nova',
            email: 'user@infinity.com',
            password: 'User@123456',
            role: 'user',
            points: 500,
            streak: 7
        });
        console.log('✅ Demo user created:', user.email);

        // Products
        // Unique, Premium Products - EXACTLY 6 DEALS
        const productData = [
            {
                name: 'NVIDIA RTX 5090 Ultra',
                category: 'Electronics',
                price: 149999,
                discountPrice: 129999, // DEAL 1
                discountPercent: 13,
                description: 'The most powerful GPU ever created. 96GB VRAM, next-gen AI cores.',
                shortDescription: 'Next-gen flagship GPU',
                brand: 'NVIDIA',
                stock: 15,
                sold: 42,
                isFeatured: true,
                isTrending: true,
                rating: 4.9,
                numReviews: 128,
                images: ['https://images.unsplash.com/photo-1591488320449-011701bb6704?q=80&w=800'],
                tags: ['gpu', 'gaming', 'rtx']
            },
            {
                name: 'Sony Alpha A9 III',
                category: 'Electronics',
                price: 499999,
                discountPrice: 0,
                description: 'World\'s first global shutter 24MP full-frame mirrorless camera.',
                shortDescription: 'Pro mirrorless camera',
                brand: 'Sony',
                stock: 8,
                sold: 23,
                isFeatured: true,
                rating: 4.8,
                numReviews: 64,
                images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800'],
                tags: ['camera', 'photography']
            },
            {
                name: 'Apple Vision Pro 2',
                category: 'Electronics',
                price: 299999,
                discountPrice: 0,
                description: 'Spatial computing redefined. Dual 4K Micro-OLED displays, R1 chip.',
                shortDescription: 'Spatial computing headset',
                brand: 'Apple',
                stock: 20,
                sold: 87,
                isFeatured: true,
                isTrending: true,
                rating: 4.7,
                numReviews: 215,
                images: ['https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=800'],
                tags: ['apple', 'vr', 'ar']
            },
            {
                name: 'Alienware Aurora R16',
                category: 'Gaming',
                price: 249999,
                discountPrice: 199999, // DEAL 2
                discountPercent: 20,
                description: 'Intel Core i9-14900KF, RTX 4090, 64GB DDR5 gaming PC.',
                shortDescription: 'Ultimate gaming PC',
                isTrending: true,
                isDailyDeal: true,
                brand: 'Alienware',
                stock: 10,
                sold: 31,
                rating: 4.8,
                numReviews: 89,
                images: ['https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800']
            },
            {
                name: 'Steam Deck OLED 1TB',
                category: 'Gaming',
                price: 65000,
                discountPrice: 0,
                description: 'Handheld gaming PC with stunning 7.4" OLED display and 1TB storage.',
                shortDescription: 'Portable gaming PC',
                brand: 'Valve',
                stock: 50,
                sold: 156,
                isFeatured: true,
                rating: 4.9,
                numReviews: 432,
                images: ['https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=800']
            },
            {
                name: 'ROG Swift 4K 240Hz',
                category: 'Gaming',
                price: 99999,
                discountPrice: 84999, // DEAL 3
                discountPercent: 15,
                description: '32-inch 4K OLED gaming monitor with 240Hz refresh rate.',
                shortDescription: 'Pro gaming OLED monitor',
                isTrending: true,
                brand: 'ASUS',
                stock: 12,
                sold: 45,
                rating: 4.7,
                numReviews: 56,
                images: ['https://images.unsplash.com/photo-1547119957-637f8679db1e?q=80&w=800']
            },
            {
                name: 'Cyberpunk Neon Jacket',
                category: 'Fashion',
                price: 12999,
                discountPrice: 8999, // DEAL 4
                discountPercent: 30,
                description: 'LED-embedded jacket with reactive lighting patterns.',
                shortDescription: 'Futuristic LED jacket',
                isFeatured: true,
                brand: 'NeonWear',
                stock: 50,
                sold: 120,
                rating: 4.6,
                numReviews: 234,
                images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800']
            },
            {
                name: 'Nike Adapt Auto Max',
                category: 'Fashion',
                price: 35000,
                discountPrice: 0,
                description: 'Self-lacing futuristic sneakers with app control.',
                shortDescription: 'Smart auto-lacing sneakers',
                isTrending: true,
                brand: 'Nike',
                stock: 15,
                sold: 67,
                rating: 4.8,
                numReviews: 112,
                images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800']
            },
            {
                name: 'Tesla Powerwall 3',
                category: 'Home & Living',
                price: 899999,
                discountPrice: 0,
                description: 'Advanced home energy storage with 13.5kWh capacity.',
                shortDescription: 'Home energy storage',
                isFeatured: true,
                brand: 'Tesla',
                stock: 5,
                sold: 12,
                rating: 4.9,
                numReviews: 43,
                images: ['https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=800']
            },
            {
                name: 'Smart Gravity Chair',
                category: 'Home & Living',
                price: 44999,
                discountPrice: 0,
                description: 'Zero-gravity massage chair with AI posture correction.',
                shortDescription: 'AI massage chair',
                brand: 'AeroRest',
                stock: 10,
                sold: 24,
                rating: 4.7,
                numReviews: 31,
                images: ['https://images.unsplash.com/photo-1592078615290-033ee584e277?q=80&w=800']
            },
            {
                name: 'Rolex Submariner Cyber',
                category: 'Jewelry',
                price: 1499999,
                discountPrice: 0,
                description: 'Limited edition Submariner with holographic dial.',
                shortDescription: 'Luxury smartwatch',
                isAuctionProduct: true,
                brand: 'Rolex',
                stock: 3,
                sold: 7,
                rating: 5.0,
                numReviews: 18,
                images: ['https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=800']
            },
            {
                name: 'Carbon Fiber Mountain Bike',
                category: 'Sports',
                price: 159999,
                discountPrice: 0,
                description: 'Ultra-light carbon fiber frame.',
                shortDescription: 'Pro carbon MTB',
                brand: 'Trek',
                stock: 6,
                sold: 21,
                rating: 4.8,
                numReviews: 54,
                images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800']
            },
            {
                name: 'Smart Boxing Gloves',
                category: 'Sports',
                price: 12999,
                discountPrice: 0,
                description: 'Sensor-equipped training gloves.',
                shortDescription: 'AI training gloves',
                isTrending: true,
                brand: 'Impact',
                stock: 25,
                sold: 63,
                rating: 4.6,
                numReviews: 76,
                images: ['https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=800']
            },
            {
                name: 'Signed Iron Man Helmet',
                category: 'Collectibles',
                price: 199999,
                discountPrice: 0,
                description: 'Signed by Robert Downey Jr. One of 10 worldwide.',
                shortDescription: 'Signed movie prop',
                isAuctionProduct: true,
                brand: 'Marvel',
                stock: 1,
                sold: 3,
                rating: 4.9,
                numReviews: 45,
                images: ['https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=800']
            },
            {
                name: 'Dyson V15 Detect',
                category: 'Home & Living',
                price: 74999,
                discountPrice: 59999, // DEAL 5
                discountPercent: 20,
                description: 'The most powerful, intelligent cordless vacuum.',
                shortDescription: 'Laser-guided vacuum',
                brand: 'Dyson',
                stock: 15,
                sold: 56,
                isFeatured: true,
                rating: 4.9,
                numReviews: 89,
                images: ['https://images.unsplash.com/photo-1558317374-067fb5f30001?q=80&w=800']
            },
            {
                name: 'Marshall Emberton II',
                category: 'Electronics',
                price: 17999,
                discountPrice: 0,
                description: 'Rich, clear and loud portable Bluetooth speaker.',
                shortDescription: 'Portable speaker',
                brand: 'Marshall',
                stock: 40,
                sold: 123,
                isTrending: true,
                rating: 4.8,
                numReviews: 156,
                images: ['https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=800']
            },
            {
                name: 'Logitech G Pro X Superlight 2',
                category: 'Gaming',
                price: 16999,
                discountPrice: 0,
                description: 'The world\'s fastest pro-grade gaming mouse.',
                shortDescription: 'Ultralight gaming mouse',
                brand: 'Logitech',
                stock: 25,
                sold: 89,
                isFeatured: true,
                rating: 4.9,
                numReviews: 210,
                images: ['https://images.unsplash.com/photo-1527863680551-fb5dec79d9ff?q=80&w=800']
            },
            {
                name: 'Keychron Q1 Pro',
                category: 'Gaming',
                price: 19999,
                discountPrice: 0,
                description: 'Customizable wireless mechanical keyboard.',
                shortDescription: 'Premium keyboard',
                brand: 'Keychron',
                stock: 12,
                sold: 34,
                rating: 4.7,
                numReviews: 45,
                images: ['https://images.unsplash.com/photo-1541140134513-85a161dc4a00?q=80&w=800']
            },
            {
                name: 'GoPro HERO12 Black',
                category: 'Electronics',
                price: 44999,
                discountPrice: 0,
                description: 'Incredible image quality, best-in-class stabilization.',
                shortDescription: 'Flagship action camera',
                brand: 'GoPro',
                stock: 30,
                sold: 67,
                isTrending: true,
                rating: 4.8,
                numReviews: 92,
                images: ['https://images.unsplash.com/photo-1565967511849-76a60a516170?q=80&w=800']
            },
            {
                name: 'Nanoleaf Lines',
                category: 'Home & Living',
                price: 21999,
                discountPrice: 0,
                description: 'Smart backlit LED light bars for your space.',
                shortDescription: 'Modular RGB light bars',
                brand: 'Nanoleaf',
                stock: 20,
                sold: 44,
                rating: 4.6,
                numReviews: 56,
                images: ['https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=800']
            },
            {
                name: 'Secretlab TITAN Evo',
                category: 'Gaming',
                price: 54999,
                discountPrice: 0,
                description: 'The most advanced ergonomic gaming chair.',
                shortDescription: 'Pro gaming chair',
                brand: 'Secretlab',
                stock: 10,
                sold: 28,
                isFeatured: true,
                rating: 4.9,
                numReviews: 134,
                images: ['https://images.unsplash.com/photo-1629429408209-1f912961dbd8?q=80&w=800']
            },
            // BEAUTY PRODUCTS
            {
                name: 'Advanced Night Repair Serum',
                category: 'Beauty',
                price: 8500,
                discountPrice: 6800, // DEAL 6
                discountPercent: 20,
                description: 'Patented serum for visible age prevention. Radiance in one application.',
                shortDescription: 'Anti-aging face serum',
                brand: 'Lumina',
                stock: 45,
                sold: 231,
                isTrending: true,
                rating: 4.8,
                numReviews: 542,
                images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800']
            },
            {
                name: 'Professional Ionic Hair Dryer',
                category: 'Beauty',
                price: 15999,
                discountPrice: 0,
                description: 'Fast drying, no extreme heat. Engineered for different hair types.',
                shortDescription: 'Ionic hair dryer',
                brand: 'Vortex',
                stock: 20,
                sold: 89,
                isFeatured: true,
                rating: 4.7,
                numReviews: 124,
                images: ['https://images.unsplash.com/photo-1522338242992-e1a54906a8da?q=80&w=800']
            },
            {
                name: 'Luxury Scented Candle Set',
                category: 'Beauty',
                price: 3499,
                discountPrice: 0,
                description: 'Hand-poured soy wax candles with essential oils. Lavender and Sandalwood.',
                shortDescription: 'Relaxation candle set',
                brand: 'Aura',
                stock: 100,
                sold: 456,
                rating: 4.9,
                numReviews: 876,
                images: ['https://images.unsplash.com/photo-1589492477829-5e65395b66cc?q=80&w=800']
            },
            {
                name: 'Vitamin C Brightening Mask',
                category: 'Beauty',
                price: 1999,
                discountPrice: 0,
                description: 'Instant glow mask with pure Vitamin C and clay base.',
                shortDescription: 'Brightening face mask',
                brand: 'GlowRoot',
                stock: 60,
                sold: 156,
                rating: 4.5,
                numReviews: 89,
                images: ['https://www.reinfann.fo/wp-content/uploads/2023/07/Puca_vitamin_c_glow_gel_mask_3.jpg']
            },
            {
                name: 'Sonic Facial Cleansing Brush',
                category: 'Beauty',
                price: 4999,
                discountPrice: 0,
                description: 'Deep pore cleansing with silicone pulsations. Rechargeable and waterproof.',
                shortDescription: 'Sonic face brush',
                brand: 'SilkySkin',
                stock: 30,
                sold: 112,
                isTrending: true,
                rating: 4.6,
                numReviews: 231,
                images: ['https://images.unsplash.com/photo-1590439471364-192aa70c0b53?q=80&w=800']
            },
        ];

        // Use .create() to trigger pre-save hooks (for slugs)
        const products = await Product.create(productData);
        console.log(`✅ ${products.length} products seeded`);

        // Auctions
        const auctionItems = [
            {
                product: products[10]._id, // Rolex at index 10
                title: 'Rolex Submariner – Cyber Edition',
                description: 'Limited edition holographic Rolex.',
                startingPrice: 800000,
                currentBid: 950000,
                minBidIncrement: 50000,
                startTime: new Date(Date.now() - 3600000),
                endTime: new Date(Date.now() + 7200000),
                status: 'active',
                image: products[10].images[0],
                isDemo: true
            },
            {
                product: products[13]._id, // Iron Man at index 13
                title: 'Iron Man Helmet – Signed by RDJ',
                description: 'One of a kind signed collectible.',
                startingPrice: 100000,
                currentBid: 145000,
                minBidIncrement: 10000,
                startTime: new Date(Date.now() - 1800000),
                endTime: new Date(Date.now() + 10800000),
                status: 'active',
                image: products[13].images[0],
                isDemo: true
            },
        ];
        await Auction.create(auctionItems);
        console.log(`✅ ${auctionItems.length} auctions seeded`);

        console.log('\n🎉 Seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ SEEDING ERROR:');
        if (error.name === 'ValidationError') {
            Object.keys(error.errors).forEach(k => console.error(`- ${k}: ${error.errors[k].message}`));
        } else {
            console.error(error);
        }
        process.exit(1);
    }
};

seed();


