/**
 * HairCabello — Stripe Product Setup Script
 * Run once to create all 3 subscription products in Stripe TEST MODE.
 * 
 * Usage:
 *   node scripts/createStripeProducts.js
 *
 * After running, copy the printed IDs into your .env file.
 */

require('dotenv').config();
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});

const PRODUCTS = [
    {
        name: 'Essential Bundle',
        description: 'HairCabello Essential Monthly Hair Bundle — includes 1 complimentary gift',
        priceUSD: 150,
        envKey: 'STRIPE_ESSENTIAL_PRICE_ID',
    },
    {
        name: 'Premium Bundle',
        description: 'HairCabello Premium Monthly Hair Bundle — includes 3 complimentary gifts',
        priceUSD: 250,
        envKey: 'STRIPE_PREMIUM_PRICE_ID',
    },
    {
        name: 'Luxury Bundle',
        description: 'HairCabello Luxury Monthly Hair Bundle — includes 5 complimentary gifts',
        priceUSD: 350,
        envKey: 'STRIPE_LUXURY_PRICE_ID',
    },
];

async function createProducts() {
    console.log('\n========================================');
    console.log(' HairCabello — Stripe Product Setup');
    console.log('========================================\n');

    if (!process.env.STRIPE_SECRET_KEY) {
        console.error('ERROR: STRIPE_SECRET_KEY is not set in .env');
        process.exit(1);
    }

    if (!process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
        console.warn('WARNING: STRIPE_SECRET_KEY does not appear to be a test key.');
        console.warn('Please ensure you are using Stripe TEST MODE.\n');
    }

    const results = [];

    for (const product of PRODUCTS) {
        try {
            console.log(`Creating product: ${product.name}...`);

            // Create product
            const stripeProduct = await stripe.products.create({
                name: product.name,
                description: product.description,
                metadata: {
                    project: 'HairCabello',
                    mode: 'test',
                },
            });

            // Create monthly recurring price
            const stripePrice = await stripe.prices.create({
                product: stripeProduct.id,
                unit_amount: product.priceUSD * 100, // Convert to cents
                currency: 'usd',
                recurring: {
                    interval: 'month',
                },
                metadata: {
                    project: 'HairCabello',
                    plan: product.name,
                },
            });

            console.log(`  ✅ Product ID : ${stripeProduct.id}`);
            console.log(`  ✅ Price ID   : ${stripePrice.id}`);
            console.log(`  ✅ Amount     : $${product.priceUSD}/month\n`);

            results.push({
                envKey: product.envKey,
                priceId: stripePrice.id,
                productId: stripeProduct.id,
                name: product.name,
                amount: product.priceUSD,
            });
        } catch (err) {
            console.error(`  ❌ Failed to create ${product.name}:`, err.message);
            process.exit(1);
        }
    }

    console.log('========================================');
    console.log(' Copy these into your .env file:');
    console.log('========================================\n');

    for (const r of results) {
        console.log(`${r.envKey}=${r.priceId}`);
    }

    console.log('\n========================================');
    console.log(' Setup complete! All products created.');
    console.log('========================================\n');
}

createProducts().catch((err) => {
    console.error('Unexpected error:', err);
    process.exit(1);
});
