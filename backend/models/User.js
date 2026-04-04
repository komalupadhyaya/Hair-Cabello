const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
        lowercase: true,
        trim: true,
    },
    phone: {
        type: String,
        trim: true,
    },
    plan: {
        type: String,
        required: true,
        enum: ['essential', 'premium', 'luxury'],
    },
    hairLength: {
        type: String,
        enum: ['16', '18', '22'],
    },
    hairType: {
        type: String,
        enum: ['body-wave', 'straight', 'curly'],
    },
    selectedGifts: [{
        type: String,
    }],
    stripeCustomerId: {
        type: String,
    },
    stripeSessionId: {
        type: String,
    },
    stripeSubscriptionId: {
        type: String,
    },
    subscriptionStatus: {
        type: String,
        enum: ['pending', 'active', 'canceled', 'past_due'],
        default: 'pending',
    },
    planPrice: {
        type: Number,
    },
    activatedAt: {
        type: Date,
    },
    password: {
        type: String,
    },
    passwordResetToken: {
        type: String,
    },
    passwordResetExpires: {
        type: Date,
    },
    forcePasswordChange: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        enum: ['member', 'admin'],
        default: 'member',
    },
    lastPaymentDate: {
        type: Date,
    },
    nextBillingDate: {
        type: Date,
    },
    nextOrderPreferences: {
        hairLength: String,
        hairType: String,
        gifts: [String],
        updatedAt: { type: Date, default: Date.now }
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('User', UserSchema);
