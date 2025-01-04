const { registerDevice, testEmail } = require('../Controllers');

const router = require('express').Router();

router.post('/register', registerDevice);
// router.post('/test-email', testEmail);

module.exports = router;