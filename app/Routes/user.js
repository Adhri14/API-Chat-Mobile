const { getProfile, updateProfile } = require('../Controllers');
const authMiddleware = require('../Middleware/auth');

const router = require('express').Router();

router.get('/', [authMiddleware], getProfile);
router.post('/update-profile', [authMiddleware], updateProfile);

module.exports = router;