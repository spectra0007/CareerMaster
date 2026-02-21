const express = require('express');
const router = express.Router();
const { getVideos, getVideoDetails } = require('../controllers/videoController');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

router.use(authenticate);

router.get('/', asyncHandler(getVideos));
router.get('/:id', asyncHandler(getVideoDetails));

module.exports = router;
