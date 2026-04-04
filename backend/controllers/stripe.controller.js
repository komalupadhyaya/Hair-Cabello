const Stripe = require('stripe');
const User = require('../models/User');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});

exports.handleWebhook = async (req, res) => {

    console.log("\n================ STRIPE WEBHOOK RECEIVED ================");
    console.log("Time:", new Date().toISOString());

    const sig = req.headers['stripe-signature'];

    console.log("Signature Header:", sig ? "PRESENT" : "MISSING");
    console.log("Webhook Secret Exists:", process.env.STRIPE_WEBHOOK_SECRET ? "YES" : "NO");

    let event;

    try {

        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        console.log("Webhook verification SUCCESS");
        console.log("Event Type:", event.type);

    } catch (err) {

        console.error("Webhook signature verification FAILED");
        console.error("Error Message:", err.message);
        console.error("Provided Signature:", sig);
        console.error("Webhook Secret used (first 10 chars):", process.env.STRIPE_WEBHOOK_SECRET ? process.env.STRIPE_WEBHOOK_SECRET.substring(0, 10) : "NONE");

        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log("Stripe webhook received:", event.type);

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        console.log("\n--- PROCESSING CHECKOUT SESSION ---");

        try {
            console.log("Looking for user with ID:", session.metadata?.userId || session.client_reference_id);
            const user = await User.findById(session.metadata?.userId || session.client_reference_id);

            if (!user) {
                console.warn("No user matched this Stripe session metadata userId:", session.metadata?.userId);
                return res.json({ received: true });
            }

            console.log("User found:", user.email);
            console.log("Subscription ID from session:", session.subscription);

            // Get subscription to find next billing date
            const subscription = await stripe.subscriptions.retrieve(session.subscription);
            
            // Safe extraction of current_period_end (sometimes it's nested in items)
            const periodEnd = subscription.current_period_end || 
                              subscription.items?.data[0]?.current_period_end || 
                              subscription.current_period_start + (30 * 24 * 60 * 60); // Final fallback to 30 days if somehow missing
            
            const nextBillingDate = new Date(periodEnd * 1000);

            user.stripeSubscriptionId = session.subscription;
            user.stripeCustomerId = session.customer;
            user.subscriptionStatus = 'active';
            user.activatedAt = new Date();
            user.lastPaymentDate = new Date();
            user.nextBillingDate = nextBillingDate;
            user.planPrice = session.amount_total / 100;

            // Ensure hair bundle data is accurate from metadata if not already set
            if (session.metadata?.hairLength) user.hairLength = session.metadata.hairLength;
            if (session.metadata?.hairType) user.hairType = session.metadata.hairType;
            if (session.metadata?.selectedGifts) {
                user.selectedGifts = session.metadata.selectedGifts.split(', ').map(g => g.trim());
            }
            console.log("Assigned nextBillingDate:", nextBillingDate);

            await user.save();
            console.log("User successfully activated and saved:", user.email);
            console.log("Saved User Next Billing Date:", user.nextBillingDate);

        } catch (error) {
            console.error("ERROR during checkout.session.completed processing:", error);
            return res.status(500).json({ error: 'Internal server error' });
        }

    } else if (event.type === 'invoice.payment_succeeded') {
        const invoice = event.data.object;
        console.log("\n--- INVOICE PAYMENT SUCCEEDED ---");

        if (!invoice.subscription) return res.json({ received: true });

        try {
            const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
            
            // Safe extraction of current_period_end
            const periodEnd = subscription.current_period_end || 
                              subscription.items?.data[0]?.current_period_end;
            
            if (!periodEnd) {
                console.warn("Could not find current_period_end for subscription:", invoice.subscription);
                return res.json({ received: true });
            }

            const nextBillingDate = new Date(periodEnd * 1000);

            const user = await User.findOneAndUpdate(
                { stripeSubscriptionId: invoice.subscription },
                { 
                    subscriptionStatus: 'active',
                    lastPaymentDate: new Date(),
                    nextBillingDate: nextBillingDate
                },
                { new: true }
            );

            if (user) {
                console.log(`Updated next billing date to ${nextBillingDate} for user: ${user.email}`);
            }

        } catch (error) {
            console.error("Error handling invoice.payment_succeeded:", error);
        }

    } else if (event.type === 'invoice.payment_failed') {
        const invoice = event.data.object;
        console.log("\n--- PAYMENT FAILED EVENT ---");

        try {
            const user = await User.findOne({ stripeCustomerId: invoice.customer });
            if (user) {
                user.subscriptionStatus = 'past_due';
                await user.save();
                console.log("User marked past_due:", user.email);
            }
        } catch (error) {
            console.error("Error handling invoice.payment_failed:", error);
        }

    } else if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object;
        console.log("\n--- SUBSCRIPTION CANCELED ---");

        try {
            const user = await User.findOne({ stripeSubscriptionId: subscription.id });
            if (user) {
                user.subscriptionStatus = 'canceled';
                await user.save();
                console.log("User subscription canceled:", user.email);
            }
        } catch (error) {
            console.error("Error processing subscription.deleted event:", error);
        }
    }

    console.log("Webhook processing finished.");
    console.log("=========================================================\n");
    res.json({ received: true });
};

exports.getSessionDetails = async (req, res) => {
    const { sessionId } = req.params;
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (!session) return res.status(404).json({ error: 'Session not found' });

        const user = await User.findById(session.metadata?.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({
            name: user.fullName,
            email: user.email,
            plan: user.plan,
            price: user.planPrice || (session.amount_total / 100),
            hairLength: user.hairLength,
            hairType: user.hairType,
            selectedGifts: user.selectedGifts,
            nextBillingDate: user.nextBillingDate
        });

    } catch (error) {
        console.error("Error fetching session details:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.createBillingPortal = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.stripeCustomerId) {
            return res.status(404).json({ error: 'Stripe customer not found. Have you subscribed yet?' });
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: `${process.env.FRONTEND_MEMBER_URL}/member/settings`,
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error("Error creating billing portal session:", error);
        res.status(500).json({ error: 'Failed to create billing portal' });
    }
};
