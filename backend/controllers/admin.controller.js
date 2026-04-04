const User = require('../models/User');

exports.getDashboardStats = async (req, res) => {
    try {
        const totalActiveMembers = await User.countDocuments({
            subscriptionStatus: 'active',
            role: 'member'
        });

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const newSignupsThisMonth = await User.countDocuments({
            createdAt: { $gte: startOfMonth },
            role: 'member'
        });

        const activeEssentialPlans = await User.countDocuments({
            subscriptionStatus: 'active',
            plan: 'essential',
            role: 'member'
        });

        const activePremiumPlans = await User.countDocuments({
            subscriptionStatus: 'active',
            plan: 'premium',
            role: 'member'
        });

        // Legacy: Claims are no longer used in HairCabello
        const openClaims = 0;
        const claimsSubmittedThisMonth = 0;

        const failedCancelledSubscriptions = await User.countDocuments({
            subscriptionStatus: 'canceled',
            role: 'member'
        });

        const monthlyRecurringRevenueResult = await User.aggregate([
            { $match: { subscriptionStatus: 'active', role: 'member' } },
            { $group: { _id: null, totalMRR: { $sum: '$planPrice' } } }
        ]);

        const monthlyRecurringRevenue = monthlyRecurringRevenueResult.length > 0
            ? monthlyRecurringRevenueResult[0].totalMRR
            : 0;

        res.json({
            totalActiveMembers,
            newSignupsThisMonth,
            activeEssentialPlans,
            activePremiumPlans,
            openClaims,
            claimsSubmittedThisMonth,
            failedCancelledSubscriptions,
            monthlyRecurringRevenue,
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
