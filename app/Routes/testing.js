const router = require('express').Router();

router.get('/', (req, res) => {
    res.status(200).json({
        message: 'API Mobile Chat App',
    });
});

module.exports = router;