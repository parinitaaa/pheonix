const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' },
    isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: [true, 'Name is required'], trim: true },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: { type: String, required: [true, 'Password is required'], minlength: 6 },
        avatar: { type: String, default: '' },
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        addresses: [addressSchema],
        points: { type: Number, default: 0 },
        streak: { type: Number, default: 0 },
        lastLogin: { type: Date },
        isActive: { type: Boolean, default: true },
        recentlyViewed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
        notes: [{ title: String, content: String, createdAt: { type: Date, default: Date.now } }],
        shoppingGoal: { type: Number, default: 0 },
        monthlySpend: { type: Number, default: 0 },
        todos: [
            {
                text: String,
                completed: { type: Boolean, default: false },
                createdAt: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true }
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
