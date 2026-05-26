const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { success: false, message: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: 'Too many login attempts, please try again later.' },
});

const bidLimiter = rateLimit({
    windowMs: 10 * 1000,
    max: 1,
    keyGenerator: (req) => `${req.ip}_${req.params.id}_${req.user?._id}`,
    message: { success: false, message: 'Bid too fast! Please wait before bidding again.' },
});

module.exports = { apiLimiter, authLimiter, bidLimiter };
