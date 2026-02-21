const leetcodeService = require('../services/leetcodeService');
const userService = require('../services/userService');

const getPlans = async (req, res) => {
    const plans = await leetcodeService.getAllPlans();
    res.json({ success: true, plans });
};

const getProgress = async (req, res) => {
    const clerkId = req.auth.userId;
    const user = await userService.getUserProfile(clerkId);

    if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
    }

    const progress = await leetcodeService.getUserProgress(user.id);
    res.json({ success: true, progress });
};

const updateProgress = async (req, res) => {
    const { id: planId } = req.params;
    const { status, notes } = req.body;
    const clerkId = req.auth.userId;

    const user = await userService.getUserProfile(clerkId);
    if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
    }

    const updatedProgress = await leetcodeService.updateProgress(user.id, planId, status, notes);
    res.json({ success: true, progress: updatedProgress });
};

module.exports = {
    getPlans,
    getProgress,
    updateProgress,
};
