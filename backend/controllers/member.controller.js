const Stripe = require('stripe');
const User = require('../models/User');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateNextOrderPreferences = async (req, res) => {
    try {
        const { hairLength, hairType, gifts } = req.body;
        
        // Basic validation for gifts limit based on current plan
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const giftLimits = { essential: 1, premium: 3, luxury: 5 };
        const limit = giftLimits[user.plan] || 0;

        if (gifts && gifts.length > limit) {
            return res.status(400).json({ error: `Your ${user.plan} plan only allows up to ${limit} gift(s).` });
        }

        user.nextOrderPreferences = {
            hairLength: hairLength || user.nextOrderPreferences?.hairLength,
            hairType: hairType || user.nextOrderPreferences?.hairType,
            gifts: gifts || user.nextOrderPreferences?.gifts,
            updatedAt: new Date()
        };

        await user.save();
        res.json({ message: 'Next order preferences updated successfully', preferences: user.nextOrderPreferences });
    } catch (error) {
        console.error('Error updating next order preferences:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.memberCancelSubscription = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (user.stripeSubscriptionId) {
            await stripe.subscriptions.cancel(user.stripeSubscriptionId);
        }

        user.subscriptionStatus = 'canceled';
        await user.save();

        res.json({ message: 'Subscription canceled successfully' });
    } catch (error) {
        console.error('Error canceling member subscription:', error);
        res.status(500).json({ error: 'Failed to cancel subscription' });
    }
};

const AuditLog = require('../models/AuditLog');

exports.getAllMembers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 25;
        const skip = (page - 1) * limit;

        const members = await User.find({ role: 'member' })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalRecords = await User.countDocuments({ role: 'member' });
        const totalPages = Math.ceil(totalRecords / limit);

        res.json({
            data: members,
            page,
            totalPages,
            totalRecords
        });
    } catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getMemberById = async (req, res) => {
    try {
        const member = await User.findOne({ _id: req.params.id, role: 'member' });
        if (!member) return res.status(404).json({ error: 'Member not found' });
        res.json(member);
    } catch (error) {
        console.error('Error fetching member:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.cancelSubscription = async (req, res) => {
    try {
        const member = await User.findOne({ _id: req.params.id, role: 'member' });
        if (!member) return res.status(404).json({ error: 'Member not found' });

        if (member.stripeSubscriptionId) {
            await stripe.subscriptions.cancel(member.stripeSubscriptionId);
        }

        member.subscriptionStatus = 'canceled';
        await member.save();

        await AuditLog.create({
            userId: req.user?.id,
            action: 'CANCEL_SUBSCRIPTION',
            targetType: 'User',
            targetId: member._id,
            metadata: { method: 'Admin' }
        });

        res.json({ message: 'Subscription canceled successfully', member });
    } catch (error) {
        console.error('Error canceling subscription:', error);
        res.status(500).json({ error: 'Failed to cancel subscription' });
    }
};
