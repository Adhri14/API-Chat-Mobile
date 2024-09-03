const { listChats, sendChat, listMessage, updateStatusRead } = require('../Controllers');
const authMiddleware = require('../Middleware/auth');
const router = require('express').Router();

router.get('/list', [authMiddleware], listChats);
router.get('/messages', [authMiddleware], listMessage);
router.post('/send-chat', [authMiddleware], sendChat);
router.post('/update-status/:chatId', [authMiddleware], updateStatusRead);

module.exports = router;