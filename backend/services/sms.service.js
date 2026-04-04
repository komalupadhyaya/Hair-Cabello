const User = require('../models/User');

exports.sendClaimUpdateSMS = async (to, status) => {
    // SMS logic removed or updated for HairCabello if needed.
    // HairCabello doesn't have claims, so this service may be repurposed for shipping updates.
    const body = `HairCabello: Your order status has been updated to ${status}. Log in to view details.`;
    console.log(`[SMS] To: ${to}, Body: ${body}`);
};

exports.sendVendorScheduledSMS = async (to, vendor, date) => {
    const body = `HairCabello: A delivery from ${vendor} has been scheduled for ${date}.`;
    console.log(`[SMS] To: ${to}, Body: ${body}`);
};
