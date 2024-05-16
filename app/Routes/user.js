const { getProfile, updateProfile } = require('../Controllers');
const authMiddleware = require('../Middleware/auth');
const multer = require('multer');
const os = require('os');

const router = require('express').Router();

router.get('/', [authMiddleware], getProfile);
router.post('/update-profile', [authMiddleware, multer({ dest: os.tmpdir() }).single('image')], updateProfile);

module.exports = router;