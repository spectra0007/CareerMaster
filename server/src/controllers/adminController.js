const pool = require('../config/db');
const videoService = require('../services/videoService');
const leetcodeService = require('../services/leetcodeService');
const cloudinaryService = require('../services/cloudinaryService');

const getAllUsers = async (req, res) => {
    const text = `
    SELECT u.id, u.clerk_id, u.email, u.first_name, u.last_name, u.role, u.created_at,
           s.plan, s.status as subscription_status
    FROM users u
    LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
    ORDER BY u.created_at DESC
  `;
    const { rows } = await pool.query(text);
    res.json({ success: true, users: rows });
};

const createVideo = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'No video file provided' });
    }

    try {
        // 1. Upload to Cloudinary
        const cloudResult = await cloudinaryService.uploadVideo(req.file.path);

        // 2. Prepare DB data
        const videoData = {
            ...req.body,
            cloudinary_id: cloudResult.cloudinary_id,
            cloudinary_url: cloudResult.cloudinary_url,
            thumbnail_url: cloudResult.thumbnail_url,
            duration: cloudResult.duration,
            is_premium: req.body.is_premium === 'true' || req.body.is_premium === true
        };

        if (!req.userInternalId) {
            const { rows } = await pool.query('SELECT id FROM users WHERE clerk_id = $1', [req.auth.userId]);
            videoData.upload_by = rows[0]?.id;
        } else {
            videoData.upload_by = req.userInternalId;
        }

        // 3. Save to DB
        const video = await videoService.createVideo(videoData);
        res.status(201).json({ success: true, video });
    } catch (error) {
        console.error('Video upload error:', error);
        res.status(500).json({ success: false, error: 'Video upload failed' });
    }
};

const deleteVideo = async (req, res) => {
    const { id } = req.params;

    // First get the video to find the cloudinary ID
    const video = await videoService.getVideoById(id);
    if (!video) {
        return res.status(404).json({ success: false, error: 'Video not found' });
    }

    // Delete from Cloudinary
    await cloudinaryService.deleteVideo(video.cloudinary_id);

    // Delete from DB
    const deleted = await videoService.deleteVideo(id);
    res.json({ success: true, video: deleted });
};

const createPlan = async (req, res) => {
    const planData = req.body;
    const plan = await leetcodeService.createPlan(planData);
    res.status(201).json({ success: true, plan });
};

module.exports = {
    getAllUsers,
    createVideo,
    deleteVideo,
    createPlan,
};
