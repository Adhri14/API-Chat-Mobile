const authMiddleware = require('../Middleware/auth');
const multer = require('multer');
const os = require('os');
const { uploadMedia } = require('../Controllers');

const router = require('express').Router();

router.post('/', [authMiddleware, multer({ dest: os.tmpdir() }).single('file')], uploadMedia);

module.exports = router;