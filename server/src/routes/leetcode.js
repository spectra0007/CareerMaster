const express = require('express');
const router = express.Router();
const { getPlans, getProgress, updateProgress } = require('../controllers/leetcodeController');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

router.use(authenticate);

router.get('/', asyncHandler(getPlans));
router.get('/progress', asyncHandler(getProgress));
router.put('/:id/progress', asyncHandler(updateProgress));

module.exports = router;
