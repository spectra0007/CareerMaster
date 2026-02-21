const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getAllUsers, createVideo, deleteVideo, createPlan } = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Configure Multer for temp local storage before Cloudinary upload
const upload = multer({ dest: 'uploads/' });

router.use(requireAdmin);

router.get('/users', asyncHandler(getAllUsers));

router.post('/videos', upload.single('video'), asyncHandler(createVideo));
router.delete('/videos/:id', asyncHandler(deleteVideo));

router.post('/plans', asyncHandler(createPlan));

module.exports = router;
