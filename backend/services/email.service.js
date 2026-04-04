const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendWelcomeEmail = async (to, { name, password, plan, price, hairLength, hairType, gifts }) => {
    const isProduction = process.env.NODE_ENV === 'production';
    
    const giftsList = gifts?.length > 0 
        ? `<p style="margin: 5px 0;"><strong>Gifts:</strong> ${gifts.join(', ')}</p>` 
        : '';

    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #334155;">
            <div style="background-color: #2563eb; padding: 40px; text-align: center; border-radius: 20px 20px 0 0;">
                <h1 style="color: #ffffff; margin: 0; font-style: italic; font-weight: 900;">HairCabello</h1>
            </div>
            <div style="padding: 40px; border: 1px solid #e2e8f0; border-top: 0; border-radius: 0 0 20px 20px; background-color: #ffffff;">
                <h2 style="color: #1e293b;">Welcome to the Family, ${name}!</h2>
                <p>Your HairCabello subscription is active. Your first bundle is being prepared for shipment.</p>
                
                <div style="background-color: #f8fafc; padding: 25px; border-radius: 15px; margin: 30px 0; border: 1px solid #f1f5f9;">
                    <h3 style="margin-top: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8;">Order Summary</h3>
                    <p style="margin: 5px 0;"><strong>Plan:</strong> ${plan.toUpperCase()} Bundle</p>
                    <p style="margin: 5px 0;"><strong>Monthly Price:</strong> $${price}</p>
                    <p style="margin: 5px 0;"><strong>Hair selection:</strong> ${hairLength}" ${hairType.replace('-', ' ')}</p>
                    ${giftsList}
                </div>

                <div style="background-color: #eef2ff; padding: 25px; border-radius: 15px; border-left: 4px solid #2563eb;">
                    <h3 style="margin-top: 0; font-size: 14px; text-transform: uppercase;">Your Portal Credentials</h3>
                    <p style="margin: 5px 0;"><strong>Login:</strong> ${to}</p>
                    <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
                    <p style="font-size: 12px; color: #64748b; margin-top: 10px;">For security, please change your password after logging in.</p>
                </div>

                <div style="text-align: center; margin-top: 40px;">
                    <a href="${process.env.FRONTEND_MEMBER_URL}/login" style="background-color: #0f172a; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
                        GO TO MEMBER PORTAL
                    </a>
                </div>

                <p style="margin-top: 40px; font-size: 12px; color: #94a3b8; text-align: center;">
                    &copy; ${new Date().getFullYear()} HairCabello International. All rights reserved.
                </p>
            </div>
        </div>
    `;

    try {
        await resend.emails.send({
            from: 'HairCabello <onboarding@resend.dev>',
            to: isProduction ? to : 'delivered@resend.dev',
            subject: isProduction 
                ? "Your HairCabello Bundle is being prepared!" 
                : `[DEV] Your HairCabello Bundle is being prepared!`,
            html,
        });
    } catch (error) {
        console.error('Failed to send welcome email:', error);
    }
}
