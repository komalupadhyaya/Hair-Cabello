const { z } = require('zod');
const Stripe = require('stripe');
const User = require('../models/User');
const Affiliate = require('../models/Affiliate');
const Referral = require('../models/Referral');
const Commission = require('../models/Commission');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});

// Zod validation schema
const signupSchema = z.object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone number is required'),
    plan: z.enum(['essential', 'premium', 'luxury'], {
        errorMap: () => ({ message: 'Plan must be essential, premium, or luxury' }),
    }),
    hairLength: z.enum(['16', '18', '22'], {
        errorMap: () => ({ message: 'Invalid hair length' }),
    }),
    hairType: z.enum(['body-wave', 'straight', 'curly'], {
        errorMap: () => ({ message: 'Invalid hair type' }),
    }),
    selectedGifts: z.array(z.string()).optional().default([]),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

const PRICE_MAP = {
    essential: process.env.STRIPE_ESSENTIAL_PRICE_ID,
    premium: process.env.STRIPE_PREMIUM_PRICE_ID,
    luxury: process.env.STRIPE_LUXURY_PRICE_ID
};

const GIFT_LIMITS = {
    essential: 1,
    premium: 3,
    luxury: 5
};

exports.startSignup = async (req, res) => {
    // 1. Validate request body
    const parseResult = signupSchema.safeParse(req.body);
    if (!parseResult.success) {
        const errors = parseResult.error.flatten().fieldErrors;
        return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    const { fullName, email, phone, plan, hairLength, hairType, selectedGifts, password } = parseResult.data;

    // 1.2 Validate gift limits
    const limit = GIFT_LIMITS[plan];
    if (selectedGifts.length > limit) {
        return res.status(400).json({ 
            error: `Validation failed`, 
            details: { selectedGifts: [`The ${plan} plan only allows up to ${limit} gift(s).`] } 
        });
    }

    // 1.5. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({
            error: 'This email is already registered. Please log in.'
        });
    }

    // 2. Resolve Stripe price ID
    const priceId = PRICE_MAP[plan];

    if (!priceId) {
        console.error('Price ID not configured for plan:', plan);
        return res.status(500).json({ error: 'Server configuration error: price ID not found' });
    }

    try {
        // 3. Find or create Stripe customer
        let stripeCustomerId;
        const existingCustomers = await stripe.customers.list({ email, limit: 1 });

        if (existingCustomers.data.length > 0) {
            stripeCustomerId = existingCustomers.data[0].id;
            console.log('Found existing Stripe customer:', stripeCustomerId);
        } else {
            const newCustomer = await stripe.customers.create({
                email,
                name: fullName,
                phone,
            });
            stripeCustomerId = newCustomer.id;
            console.log('Created new Stripe customer:', stripeCustomerId);
        }

        // 4. Save preliminary user record BEFORE checkout
        console.log("Creating checkout session for:", email);

        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            fullName,
            email,
            phone,
            plan,
            hairLength,
            hairType,
            selectedGifts,
            password: hashedPassword,
            role: 'member',
            forcePasswordChange: false,
            stripeCustomerId,
            subscriptionStatus: 'pending',
            createdAt: new Date(),
        });

        await user.save();
        console.log('User record saved with pending status:', user._id);

        // 5. Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            customer: stripeCustomerId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.FRONTEND_SIGNUP_URL}/welcome?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_SIGNUP_URL}/`,
            metadata: {
                email: email,
                plan: plan,
                userId: user._id.toString(),
                hairLength,
                hairType,
                selectedGifts: selectedGifts.join(', ')
            }
        });

        console.log('Stripe checkout session created:', session.id);

        // Update user with session ID for tracking
        user.stripeSessionId = session.id;
        await user.save();

        // 6. Return checkout URL
        return res.status(200).json({ url: session.url });

    } catch (error) {
        console.error('Stripe session creation failed:', error);
        return res.status(500).json({ error: 'Stripe session creation failed' });
    }
};
