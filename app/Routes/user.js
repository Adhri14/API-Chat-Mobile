const { getProfile, updateProfile, changePassword, getListUsers, getProfileById, followProfile } = require('../Controllers');
const authMiddleware = require('../Middleware/auth');
const multer = require('multer');
const os = require('os');

const router = require('express').Router();

router.get('/', [authMiddleware], getProfile);
router.get('/list', [authMiddleware], getListUsers);
router.get('/:userId', [authMiddleware], getProfileById);
router.post('/update-profile', [authMiddleware, multer({ dest: os.tmpdir() }).single('image')], updateProfile);
router.post('/update-password', [authMiddleware], changePassword);
router.post('/follow/:userId', [authMiddleware], followProfile);

module.exports = router;