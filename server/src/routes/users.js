const express = require('express');
const router = express.Router();
const { getMyProfile } = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

router.use(authenticate);

router.get('/me', asyncHandler(getMyProfile));

module.exports = router;
