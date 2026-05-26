const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

// @desc    Register user
// @route   POST /api/auth/register
const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        res.status(400); throw new Error('Please provide all fields');
    }
    const exists = await User.findOne({ email });
    if (exists) { res.status(400); throw new Error('User already exists'); }

    const user = await User.create({ name, email, password });
    res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, points: user.points, streak: user.streak },
    });
});

// @desc    Login user
// @route   POST /api/auth/login
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) { res.status(400); throw new Error('Please provide email and password'); }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
        res.status(401); throw new Error('Invalid email or password');
    }

    // Update streak
    const today = new Date().toDateString();
    const lastLogin = user.lastLogin ? new Date(user.lastLogin).toDateString() : null;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (lastLogin === yesterday) {
        user.streak += 1;
    } else if (lastLogin !== today) {
        user.streak = 1;
    }
    user.lastLogin = new Date();
    await user.save();

    res.json({
        success: true,
        token: generateToken(user._id),
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, points: user.points, streak: user.streak },
    });
});

// @desc    Get profile
// @route   GET /api/auth/profile
const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password').populate('recentlyViewed', 'name images price');
    res.json({ success: true, user });
});

// @desc    Update profile
// @route   PUT /api/auth/profile
const updateProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const { name, avatar, shoppingGoal, todos, notes } = req.body;
    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    if (shoppingGoal !== undefined) user.shoppingGoal = shoppingGoal;
    if (todos) user.todos = todos;
    if (notes) user.notes = notes;
    if (req.body.password) user.password = req.body.password;
    await user.save();
    res.json({ success: true, user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, points: user.points, streak: user.streak, shoppingGoal: user.shoppingGoal, todos: user.todos, notes: user.notes } });
});

// @desc    Manage addresses
// @route   POST /api/auth/address
const addAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (req.body.isDefault) user.addresses.forEach(a => a.isDefault = false);
    user.addresses.push(req.body);
    await user.save();
    res.status(201).json({ success: true, addresses: user.addresses });
});

const deleteAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.id);
    await user.save();
    res.json({ success: true, addresses: user.addresses });
});

// @desc    Get leaderboard
// @route   GET /api/auth/leaderboard
const getLeaderboard = asyncHandler(async (req, res) => {
    const users = await User.find({ role: 'user' })
        .sort({ points: -1 })
        .limit(10)
        .select('name points streak avatar');
    res.json({ success: true, leaderboard: users });
});

module.exports = { register, login, getProfile, updateProfile, addAddress, deleteAddress, getLeaderboard };
