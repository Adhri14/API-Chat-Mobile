const { listChats, sendChat, listMessage, updateStatusRead } = require('../Controllers');
const authMiddleware = require('../Middleware/auth');
const router = require('express').Router();

router.get('/list', [authMiddleware], listChats);
router.get('/:chatId/messages', [authMiddleware], listMessage);
router.post('/send', [authMiddleware], sendChat);
router.post('/:chatId/update-status', [authMiddleware], updateStatusRead);

module.exports = router;