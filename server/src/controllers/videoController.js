const videoService = require('../services/videoService');
const userService = require('../services/userService');

const getVideos = async (req, res) => {
    const videos = await videoService.getAllVideos();
    res.json({ success: true, videos });
};

const getVideoDetails = async (req, res) => {
    const { id } = req.params;
    const clerkId = req.auth.userId;

    // Fetch video
    const video = await videoService.getVideoById(id);
    if (!video) {
        return res.status(404).json({ success: false, error: 'Video not found' });
    }

    // Check if premium and user has access
    if (video.is_premium) {
        const user = await userService.getUserProfile(clerkId);
        if (!user || (user.subscription_status !== 'active' && user.role !== 'admin')) {
            return res.status(403).json({ success: false, error: 'Premium subscription required' });
        }
    }

    res.json({ success: true, video });
};

module.exports = {
    getVideos,
    getVideoDetails,
};
