const { registerDevice } = require('../Controllers');

const router = require('express').Router();

router.post('/register', registerDevice);

module.exports = router;