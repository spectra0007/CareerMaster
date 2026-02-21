const resend = require('../config/resend');

class EmailService {
    /**
     * Send welcome email to new users
     */
    async sendWelcomeEmail(email, firstName) {
        if (!process.env.RESEND_API_KEY) {
            console.warn('⚠️  RESEND_API_KEY not set — skipping welcome email');
            return;
        }

        try {
            const { data, error } = await resend.emails.send({
                from: 'CareerMaster <noreply@careermaster.co>',
                to: [email],
                subject: 'Welcome to CareerMaster! 🚀',
                html: `
          <h1>Welcome aboard, ${firstName || 'Engineer'}!</h1>
          <p>We're thrilled to have you join CareerMaster.</p>
          <p>Get ready to level up your engineering career with our curated system design videos and LeetCode tracker.</p>
          <br/>
          <p><a href="${process.env.CLIENT_URL}/dashboard">Go to your Dashboard</a></p>
          <br/>
          <p>Best,<br/>The CareerMaster Team</p>
        `,
            });

            if (error) throw error;
            console.log(`✅ Welcome email sent to ${email}`);
        } catch (error) {
            console.error(`❌ Failed to send welcome email to ${email}:`, error);
        }
    }

    /**
     * Send subscription confirmation
     */
    async sendSubscriptionConfirmation(email, planName) {
        if (!process.env.RESEND_API_KEY) return;

        try {
            await resend.emails.send({
                from: 'CareerMaster <noreply@careermaster.co>',
                to: [email],
                subject: 'CareerMaster Pro - Subscription Confirmed 👑',
                html: `
          <h1>You are now a PRO member!</h1>
          <p>Your subscription to the ${planName} plan has been activated.</p>
          <p>You now have full access to our premium system design and behavioral interview video library.</p>
          <br/>
          <p><a href="${process.env.CLIENT_URL}/videos">Explore Premium Videos</a></p>
        `,
            });
            console.log(`✅ Subscription email sent to ${email}`);
        } catch (error) {
            console.error(`❌ Failed to send subscription email to ${email}:`, error);
        }
    }
}

module.exports = new EmailService();
