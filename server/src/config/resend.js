const { Resend } = require('resend');

// Only initialize if we have a key, otherwise return a dummy object or null
const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : { emails: { send: async () => ({ error: new Error('RESEND_API_KEY not configured') }) } };

module.exports = resend;
