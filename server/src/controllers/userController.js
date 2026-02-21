const userService = require('../services/userService');

const getMyProfile = async (req, res) => {
    const clerkId = req.auth.userId;
    const user = await userService.getUserProfile(clerkId);

    if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, user });
};

module.exports = {
    getMyProfile,
};
